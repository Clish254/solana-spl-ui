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
import { createToken } from "../lib/create-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import { Toaster, toast } from "sonner";
import { ObjectWithMatchingProperties, SuccessDialog } from "./SuccessDialog";

export default function CreateToken() {
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
    mintAuthority: z.string().optional(),
    freezeAuthority: z.string().optional(),
    decimals: z.coerce.number().min(1),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mintAuthority: "",
      freezeAuthority: "",
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!publicKey) {
      return;
    }

    let mintAuthority: PublicKey = publicKey;
    let freezeAuthority: PublicKey = publicKey;
    if (values.mintAuthority && values.mintAuthority !== "") {
      const key = new PublicKey(values.mintAuthority);
      if (!PublicKey.isOnCurve(key.toBytes())) {
        return;
      }
      mintAuthority = key;
    }
    if (values.freezeAuthority && values.freezeAuthority !== "") {
      const key = new PublicKey(values.freezeAuthority);
      if (!PublicKey.isOnCurve(key.toBytes())) {
        return;
      }
      freezeAuthority = key;
    }

    let mintKeypair = Keypair.generate();
    setLoading(true);
    try {
      toast.loading("Sending transaction...");
      let tx = await createToken(
        connection,
        publicKey,
        mintKeypair,
        mintAuthority,
        freezeAuthority,
        values.decimals,
      );

      const signature = await sendTransaction(tx, connection, {
        signers: [mintKeypair],
      });
      await connection.confirmTransaction(signature, "confirmed");
      toast.dismiss();
      setSuccessDialogTitle("Token created successfully");
      setSuccessDialogDescription("Check token details below");
      setSuccessDialogData({
        Mint: mintKeypair.publicKey.toString(),
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
        <CardTitle>Create token</CardTitle>
        <CardDescription>
          Creating tokens is done by creating what is called a &quot;mint
          account&quot;. This mint account is later used to mint tokens to a
          user&apos;s token account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="mintAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mint authority</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 2rfsYzyZR3vef2dqgK6dWuhWE8P9KnE2ALswKJG55ad5"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    If you leave this empty it will default to your wallet
                    address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="freezeAuthority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Freeze authority</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 2rfsYzyZR3vef2dqgK6dWuhWE8P9KnE2ALswKJG55ad5"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    If you leave this empty it will default to your wallet
                    address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="decimals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decimals</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 8" type="number" {...field} />
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
