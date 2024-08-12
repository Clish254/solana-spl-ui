import { PublicKey, Transaction } from "@solana/web3.js";
import { createApproveCheckedInstruction } from "@solana/spl-token";

export const delegateToken = async (
  owner: PublicKey,
  mint: PublicKey,
  tokenAccount: PublicKey,
  delegate: PublicKey,
  amount: number,
  decimals: number,
): Promise<Transaction> => {
  let tx = new Transaction().add(
    createApproveCheckedInstruction(
      tokenAccount,
      mint,
      delegate,
      owner,
      amount, // amount, if your deciamls is 8, 10^8 for 1 token
      decimals,
    ),
  );
  return tx;
};
