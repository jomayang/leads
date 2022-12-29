import * as anchor from "@project-serum/anchor";
import { useEffect, useMemo, useState } from "react";
import { COINFLIP_PROGRAM_ID } from "./index";
import coinflipIDL from "../idl/coinflip-idl.json";
import {
  SystemProgram,
  PublicKey,
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  Connection,
  sendAndConfirmRawTransaction,
} from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { authorFilter } from "../utils";
import { tr } from "date-fns/locale";
import { set } from "date-fns";
import axios from "axios";

interface WinningAccount {
  amount: anchor.BN;
  isWinner: boolean;
  timestamp: anchor.BN;
  user: PublicKey;
  vault: PublicKey;
}
interface Winning {
  publicKey: PublicKey;
  account: WinningAccount;
}

export const useCoinflip = () => {
  const [transactionPending, setTransactionPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [winnings, setWinnings] = useState([]);
  const [myProvider, setMyProvider] = useState<any>();
  const coinflipIdl: any = coinflipIDL;
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (anchorWallet) {
      const provider: any = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
      );
      setMyProvider(provider);

      return new anchor.Program(coinflipIdl, COINFLIP_PROGRAM_ID, provider);
    }
  }, [connection, anchorWallet]);

  useEffect(() => {
    const getVaultResults = async () => {
      const vault: any = process.env.NEXT_PUBLIC_VAULT_PK;
      const vaultPk: PublicKey = new PublicKey(vault);
      if (program && publicKey) {
        try {
          const playResults = await program.account.playResults.all();
          const filterMax = (fn, c) => (x) => c && fn(x) && c--;
          const filter = (result) =>
            result.account.vault.toString() == vault.toString() &&
            result.account.isWinner == true;
          const winnings = playResults.filter(filterMax(filter, 4));
          const winningsAccount: any = winnings.map((win) => win.account);
          setWinnings(winningsAccount);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getVaultResults();
  }, [publicKey]);

  const fetchAssociatedHouse = async () => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const [housePda] = findProgramAddressSync(
          [utf8.encode("vault"), publicKey.toBuffer()],
          program.programId
        );
        const house = await program.account.houseState.fetch(housePda);

        return { house, housePda };
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const fetchPlayingAccount = async (vault: PublicKey) => {
    if (program && publicKey) {
      try {
        const [userStatsPda] = findProgramAddressSync(
          [utf8.encode("user-stats"), publicKey.toBuffer(), vault.toBuffer()],
          program.programId
        );
        const userStats = await program.account.userStats.fetch(userStatsPda);
        return { userStats, userStatsPda };
      } catch (error) {
        console.log(error);
      }
    }
  };

  const initializeHouse = async (winRate: number) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const [housePda] = findProgramAddressSync(
          [utf8.encode("vault"), publicKey.toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .initHouse(0, winRate)
          .accounts({
            authority: publicKey,
            vault: housePda,
            feeAccount: publicKey,
          })
          .rpc();
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const initializePlayAccount = async (vaultCreator: PublicKey) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);
        const [vaultPda] = findProgramAddressSync(
          [utf8.encode("vault"), vaultCreator.toBuffer()],
          program.programId
        );
        const [userStatsPda] = findProgramAddressSync(
          [
            utf8.encode("user-stats"),
            publicKey.toBuffer(),
            vaultPda.toBuffer(),
          ],
          program.programId
        );

        const tx = await program.methods
          .initPlayingState()
          .accounts({
            user: publicKey,
            userStats: userStatsPda,
            vault: vaultPda,
            vaultCreator: vaultCreator,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const startPlay = async (
    amount: number,
    vaultCreator: PublicKey,
    royaltyAccount: PublicKey
  ) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);
        const [vaultPda] = findProgramAddressSync(
          [utf8.encode("vault"), vaultCreator.toBuffer()],
          program.programId
        );

        const [userStatsPda] = findProgramAddressSync(
          [
            utf8.encode("user-stats"),
            publicKey.toBuffer(),
            vaultPda.toBuffer(),
          ],
          program.programId
        );
        console.log("mehdioh");
        let fromKeypair = Keypair.generate();
        let toKeypair = Keypair.generate();
        let transaction = new Transaction();
        const instruction = SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toKeypair.publicKey,
          lamports: LAMPORTS_PER_SOL,
        });
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: toKeypair.publicKey,
            lamports: LAMPORTS_PER_SOL,
          })
        );
        console.log("second transaction-->", instruction);
        const blockhash = await connection.getLatestBlockhash("finalized");
        let startPlayTx = new Transaction(blockhash);
        const ix = await program.methods
          .startPlay(new anchor.BN(amount))
          .accounts({
            user: publicKey,
            userStats: userStatsPda,
            vault: vaultPda,
            vaultCreator: vaultCreator,
            royaltyAccount: royaltyAccount,
          })
          .instruction();
        startPlayTx.add(ix);
        startPlayTx.feePayer = anchorWallet.publicKey;
        // startPlayTx.serialize;
        console.log("the connection 1 ; ", connection);
        const conn2 = new Connection(
          "https://api.devnet.solana.com",
          "confirmed"
        );
        console.log("connection2: ", ix);
        // const tx = connection.confirmTransaction(startPlayTx)
        console.log("transaction-->", startPlayTx);
        // const provider = anchor.getProvider();
        console.log("px: ", myProvider);
        // myProvider.
        const px = await myProvider.sendAndConfirm(startPlayTx);
        // const signature = await anchorWallet.signTransaction(startPlayTx);
        // startPlayTx.sign();

        // await connection.confirmTransaction(ix)
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const betHeads = async (vaultCreator: PublicKey) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const [vaultPda] = findProgramAddressSync(
          [utf8.encode("vault"), vaultCreator.toBuffer()],
          program.programId
        );

        const vaultAccount = await program.account.houseState.fetch(vaultPda);
        const lastPlay = vaultAccount.lastPlay;

        const [playResultsPda] = findProgramAddressSync(
          [
            utf8.encode("play-results"),
            vaultPda.toBuffer(),
            Uint8Array.from([lastPlay]),
          ],
          program.programId
        );

        const [userStatsPda] = findProgramAddressSync(
          [
            utf8.encode("user-stats"),
            publicKey.toBuffer(),
            vaultPda.toBuffer(),
          ],
          program.programId
        );

        const tx = await program.methods
          .heads()
          .accounts({
            user: publicKey,
            playResults: playResultsPda,
            userStats: userStatsPda,
            vault: vaultPda,
            vaultCreator: vaultCreator,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const betTails = async (vaultCreator: PublicKey) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const [vaultPda] = findProgramAddressSync(
          [utf8.encode("vault"), vaultCreator.toBuffer()],
          program.programId
        );

        const vaultAccount = await program.account.houseState.fetch(vaultPda);
        const lastPlay = vaultAccount.lastPlay;

        const [playResultsPda] = findProgramAddressSync(
          [
            utf8.encode("play-results"),
            vaultPda.toBuffer(),
            Uint8Array.from([lastPlay]),
          ],
          program.programId
        );

        const [userStatsPda] = findProgramAddressSync(
          [
            utf8.encode("user-stats"),
            publicKey.toBuffer(),
            vaultPda.toBuffer(),
          ],
          program.programId
        );

        const tx = await program.methods
          .tails()
          .accounts({
            user: publicKey,
            playResults: playResultsPda,
            userStats: userStatsPda,
            vault: vaultPda,
            vaultCreator: vaultCreator,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const claimReward = async (vaultCreator: PublicKey) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const [vaultPda] = findProgramAddressSync(
          [utf8.encode("vault"), vaultCreator.toBuffer()],
          program.programId
        );

        const [userStatsPda] = findProgramAddressSync(
          [
            utf8.encode("user-stats"),
            publicKey.toBuffer(),
            vaultPda.toBuffer(),
          ],
          program.programId
        );
        console.log("vault pda: ", vaultPda.toString());
        console.log("userstats pda: ", userStatsPda.toString());
        const tx = await program.methods
          .claimReward()
          .accounts({
            user: publicKey,
            userStats: userStatsPda,
            vault: vaultPda,
            vaultCreator: vaultCreator,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };

  const tryAgain = async (vaultCreator: PublicKey) => {
    if (program && publicKey) {
      try {
        setLoading(true);
        setTransactionPending(true);

        const [vaultPda] = findProgramAddressSync(
          [utf8.encode("vault"), vaultCreator.toBuffer()],
          program.programId
        );

        const [userStatsPda] = findProgramAddressSync(
          [
            utf8.encode("user-stats"),
            publicKey.toBuffer(),
            vaultPda.toBuffer(),
          ],
          program.programId
        );
        console.log("vault pda: ", vaultPda.toString());
        console.log("userstats pda: ", userStatsPda.toString());
        const tx = await program.methods
          .tryAgain()
          .accounts({
            user: publicKey,
            userStats: userStatsPda,
            vault: vaultPda,
            vaultCreator: vaultCreator,
          })
          .rpc();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setTransactionPending(false);
      }
    }
  };
  return {
    initializeHouse,
    initializePlayAccount,
    startPlay,
    betHeads,
    betTails,
    fetchAssociatedHouse,
    fetchPlayingAccount,
    claimReward,
    tryAgain,
    winnings,
    transactionPending,
    loading,
  };
};
