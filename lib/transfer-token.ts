import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createTransferCheckedInstruction } from "@solana/spl-token";

export const transferTokens = async (
  fromAddress: PublicKey,
  mint: PublicKey,
  fromTokenAccount: PublicKey,
  toTokenAccount: PublicKey,
  amount: number,
  decimals: number,
): Promise<Transaction> => {
  let tx = new Transaction().add(
    createTransferCheckedInstruction(
      fromTokenAccount,
      mint,
      toTokenAccount,
      fromAddress,
      amount, // amount, if your deciamls is 8, send 10^8 for 1 token
      decimals,
    ),
  );
  return tx;
};
