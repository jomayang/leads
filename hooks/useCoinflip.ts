import * as anchor from "@project-serum/anchor";
import { useEffect, useMemo, useState } from "react";
import { COINFLIP_PROGRAM_ID } from "./index";
import coinflipIDL from "../idl/coinflip-idl.json";
import { SystemProgram, PublicKey } from "@solana/web3.js";
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

  const coinflipIdl: any = coinflipIDL;
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const program = useMemo(() => {
    if (anchorWallet) {
      const provider = new anchor.AnchorProvider(
        connection,
        anchorWallet,
        anchor.AnchorProvider.defaultOptions()
      );

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

          const winnings = playResults.filter(
            (result) =>
              result.account.vault.toString() == vault.toString() &&
              result.account.isWinner == true
          );
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

  // const fetchPlayingStep = async (vault: PublicKey) => {
  //   if (program && publicKey) {
  //     try {
  //       setTransactionPending(true);
  //       const [userStatsPda] = findProgramAddressSync(
  //         [utf8.encode("user-stats"), publicKey.toBuffer(), vault.toBuffer()],
  //         program.programId
  //       );
  //       const userStats = await program.account.userStats.fetch(userStatsPda);
  //       setTransactionPending(false);
  //       return { userStats, userStatsPda };
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setTransactionPending(false);
  //     }
  //   }
  // }
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

        const tx = await program.methods
          .startPlay(new anchor.BN(amount))
          .accounts({
            user: publicKey,
            userStats: userStatsPda,
            vault: vaultPda,
            vaultCreator: vaultCreator,
            royaltyAccount: royaltyAccount,
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

  return {
    initializeHouse,
    initializePlayAccount,
    startPlay,
    betHeads,
    betTails,
    fetchAssociatedHouse,
    fetchPlayingAccount,
    claimReward,
    winnings,
    transactionPending,
    loading,
  };
};
