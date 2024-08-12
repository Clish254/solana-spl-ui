import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

export const createTokenAccount = async (
  mint: PublicKey,
  owner: PublicKey,
): Promise<{ tx: Transaction; ata: PublicKey }> => {
  // calculate ATA
  let ata = await getAssociatedTokenAddress(
    mint, // mint
    owner, // owner
  );
  let tx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      owner, // payer
      ata, // ata
      owner, // owner
      mint, // mint
    ),
  );
  return { tx, ata };
};
