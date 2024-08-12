"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "./icons";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Toaster, toast } from "sonner";
import { ObjectWithMatchingProperties, SuccessDialog } from "./SuccessDialog";
import { useState } from "react";
import { createTokenAccount } from "@/lib/create-token-account";

export default function CreateTokenAccount() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState<string>("");
  const [successDialogDescription, setSuccessDialogDescription] =
    useState<string>("");
  const [successDialogData, setSuccessDialogData] = useState<
    ObjectWithMatchingProperties<string>
  >({});
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const formSchema = z.object({
    mint: z.string(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mint: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!publicKey) {
      return;
    }

    const mint = new PublicKey(values.mint);
    if (!PublicKey.isOnCurve(mint.toBytes())) {
      return;
    }

    setLoading(true);
    try {
      toast.loading("Sending transaction...");
      const { tx, ata } = await createTokenAccount(mint, publicKey);

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      toast.dismiss();
      setSuccessDialogTitle("Token account created successfully");
      setSuccessDialogDescription("Check token account details below");
      setSuccessDialogData({
        "Token account": ata.toString(),
        Signature: signature,
      });
      setLoading(false);
      setOpen(true);
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong");
      setLoading(false);
    }
  }
  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Create token account</CardTitle>
        <CardDescription>
          This will create an associated token account. Associated Token
          Accounts are deterministicly created accounts for every
          keypair(wallet). ATAs are the recommended method of managing token
          accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="mint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mint</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 6hmM1tjDrPnu2Zys8a3uUpPtV66CnJWage7zgpWKDy87"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              {!loading && (
                <Button
                  type="submit"
                  className="cursor-pointer"
                  disabled={publicKey == null}
                >
                  Create
                </Button>
              )}
              {loading && (
                <LoadingSpinner className="mr-2 h-4 w-4 animate-spin" />
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <SuccessDialog
        open={open}
        setOpen={setOpen}
        title={successDialogTitle}
        description={successDialogDescription}
        data={successDialogData}
      />
      <Toaster position="bottom-right" />
    </Card>
  );
}
