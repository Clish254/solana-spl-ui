import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createBurnCheckedInstruction } from "@solana/spl-token";

export const burnTokens = async (
  user: PublicKey,
  mint: PublicKey,
  userTokenAccount: PublicKey,
  amount: number,
  decimals: number,
): Promise<Transaction> => {
  let tx = new Transaction().add(
    createBurnCheckedInstruction(
      userTokenAccount,
      mint,
      user,
      amount, // amount, if your deciamls is 8, 10^8 for 1 token
      decimals,
    ),
  );
  return tx;
};
