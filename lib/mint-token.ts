import { PublicKey, Transaction } from "@solana/web3.js";
import { createMintToCheckedInstruction } from "@solana/spl-token";

export const mintTokens = async (
  mint: PublicKey,
  mintAuthority: PublicKey,
  receiverTokenAccount: PublicKey,
  amount: number,
  decimals: number,
): Promise<Transaction> => {
  let tx = new Transaction().add(
    createMintToCheckedInstruction(
      mint,
      receiverTokenAccount,
      mintAuthority,
      amount, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      decimals,
    ),
  );

  return tx;
};
