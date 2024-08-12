import {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createMint,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

export const createToken = async (
  connection: Connection,
  feePayer: PublicKey,
  mintKeypair: Keypair,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null = null,
  decimals: number,
): Promise<Transaction> => {
  let tx = new Transaction().add(
    // create mint account
    SystemProgram.createAccount({
      fromPubkey: feePayer,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: await getMinimumBalanceForRentExemptMint(connection),
      programId: TOKEN_PROGRAM_ID,
    }),
    // init mint account
    createInitializeMintInstruction(
      mintKeypair.publicKey, // mint pubkey
      decimals, // decimals
      mintAuthority, // mint authority
      freezeAuthority, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
    ),
  );
  return tx;
};
