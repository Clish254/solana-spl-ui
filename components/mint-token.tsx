"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { LoadingSpinner } from "./icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Toaster, toast } from "sonner";
import { ObjectWithMatchingProperties, SuccessDialog } from "./SuccessDialog";
import { mintTokens } from "@/lib/mint-token";
import { getMint } from "@solana/spl-token";

export default function MintToken() {
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
    receiverTokenAccount: z.string(),
    amount: z.coerce.number().min(1),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!publicKey) {
      return;
    }

    const mint = new PublicKey(values.mint);
    if (!PublicKey.isOnCurve(mint.toBytes())) {
      return;
    }
    const receiverTokenAccount = new PublicKey(values.receiverTokenAccount);

    let mintAccount = await getMint(connection, mint);
    setLoading(true);
    try {
      toast.loading("Sending transaction...");
      let tx = await mintTokens(
        mint,
        publicKey,
        receiverTokenAccount,
        values.amount,
        mintAccount.decimals,
      );

      const signature = await sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, "confirmed");
      toast.dismiss();
      setSuccessDialogTitle("Tokens minted successfully");
      setSuccessDialogDescription("Check details below");
      setSuccessDialogData({
        "Token account": receiverTokenAccount.toString(),
        Amount: values.amount.toString(),
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
        <CardTitle>Mint tokens</CardTitle>
        <CardDescription>
          By default your connected wallet address is used as the mint authority
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
                      placeholder="e.g. 2rfsYzyZR3vef2dqgK6dWuhWE8P9KnE2ALswKJG55ad5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="receiverTokenAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receiver Token Account</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 2rfsYzyZR3vef2dqgK6dWuhWE8P9KnE2ALswKJG55ad5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 100000000"
                      type="number"
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
                  Mint
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
