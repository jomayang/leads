import Image from "next/image";
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import WalletButton from "./WalletButton";
import useWindowSize from "react-use/lib/useWindowSize";
import { TextField } from "@mui/material";
import { useCoinflip } from "../hooks/useCoinflip";
import { PublicKey } from "@solana/web3.js";
import Loading from "./Loading";

function FlipSection({ connected, publicKey }: any) {
  const [vaultCreatorAddress, setVaultCreatorAddress] = useState("");
  const [associatedPlayAccount, setAssociatedPlayAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [userWinAmount, setUserWinAmount] = useState(0);
  const [action, setAction] = useState("");
  const {
    initializePlayAccount,
    fetchPlayingAccount,
    startPlay,
    betHeads,
    betTails,
    claimReward,
    transactionPending,
    loading,
    tryAgain,
  } = useCoinflip();
  const { width, height } = useWindowSize();
  useEffect(() => {
    const getPlayAccount = async () => {
      try {
        const vault: any = process.env.NEXT_PUBLIC_VAULT_PK;
        console.log("vault: ", vault);
        const vaultPk: PublicKey = new PublicKey(vault);
        const result = await fetchPlayingAccount(vaultPk);

        const playAccountAddress: any = result?.userStatsPda.toString();
        const lamportsPlayed = result?.userStats.lamportsPlayed.toNumber();
        const status = result?.userStats.status;
        const winAmount = result?.userStats.winAmount.toNumber();
        console.log(status);
        if (status == 0 && lamportsPlayed > 0) {
          setUserStatus("play");
        } else if (status == 1) {
          setUserStatus("lost");
        } else if (status == 2) {
          setUserStatus("won");
        } else {
          setUserStatus("initial");
        }

        console.log("res: ", result?.userStats, lamportsPlayed);
        setAssociatedPlayAccount(playAccountAddress);
      } catch (error) {
        console.log(error);
      }
    };
    getPlayAccount();
  }, [publicKey, transactionPending]);

  const handleCreateAccount = () => {
    const vaultCreatorStr: any =
      process.env.NEXT_PUBLIC_VAULT_CREATOR?.toString();
    const vaultCreator: PublicKey = new PublicKey(vaultCreatorStr);
    console.log("the vault creator: ", vaultCreatorStr, vaultCreator);
    initializePlayAccount(vaultCreator);
    setAction("create-account");
  };

  const handleStartPlay = () => {
    const amountSol = +amount * 1000000000;
    const vaultCreatorStr: any =
      process.env.NEXT_PUBLIC_VAULT_CREATOR?.toString();
    const vaultCreator: PublicKey = new PublicKey(vaultCreatorStr);
    const royaltyAccount: PublicKey = new PublicKey(
      "73uzSZS5ep9rG9CcAScYeV8Uz4PwjUocY9rc4xpmDLDR"
    );

    startPlay(amountSol, vaultCreator, royaltyAccount);
    setAction("start-play");
  };

  const handleBetHeads = () => {
    const vaultCreatorStr: any =
      process.env.NEXT_PUBLIC_VAULT_CREATOR?.toString();
    const vaultCreator: PublicKey = new PublicKey(vaultCreatorStr);
    betHeads(vaultCreator);
    setAction("bet-heads");
  };

  const handleBetTails = () => {
    const vaultCreatorStr: any =
      process.env.NEXT_PUBLIC_VAULT_CREATOR?.toString();
    const vaultCreator: PublicKey = new PublicKey(vaultCreatorStr);
    betTails(vaultCreator);
    setAction("bet-tails");
  };

  const handleClaimReward = () => {
    const vaultCreatorStr: any =
      process.env.NEXT_PUBLIC_VAULT_CREATOR?.toString();
    const vaultCreator: PublicKey = new PublicKey(vaultCreatorStr);
    claimReward(vaultCreator);
    setAction("claim-reward");
  };

  const handlePlayAgain = () => {
    const vaultCreatorStr: any =
      process.env.NEXT_PUBLIC_VAULT_CREATOR?.toString();
    const vaultCreator: PublicKey = new PublicKey(vaultCreatorStr);
    tryAgain(vaultCreator);
  };

  return (
    <div className="flex grow items-center text-center flex-col">
      <div className="py-8">
        <h1 className="text-3xl uppercase font-bold">
          #1 Most trusted place to flip
        </h1>
        <p className="text-lg uppercase">
          over 22m <b className="text-[#E93A88]">solana</b> transactions
        </p>
      </div>
      <Image src={"/coin.svg"} width={280} height={280} alt="coin" />
      <div className="py-4">
        {!connected && (
          <WalletButton connected={connected} publicKey={publicKey} />
        )}
        <div className="py-10">{loading && <Loading />}</div>
        {connected && (
          <>
            {console.log(associatedPlayAccount)}
            {!associatedPlayAccount ? (
              <button
                onClick={handleCreateAccount}
                className="py-3 px-5 mt-4 rounded-md hover:text-black wallet-button"
              >
                Create Account
              </button>
            ) : (
              <>
                {userStatus == "initial" && (
                  <>
                    <TextField
                      label="Play Amount (sol)"
                      variant="outlined"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Play Amount (sol)"
                      fullWidth
                    />
                    <button
                      onClick={handleStartPlay}
                      className="py-3 px-5 mt-4 rounded-md hover:text-black wallet-button"
                    >
                      Start Play
                    </button>
                  </>
                )}
                {userStatus == "lost" && (
                  <>
                    <h1 className="mb-10 text-4xl font-bold uppercase text-red-400">
                      you lost!
                    </h1>
                    <button
                      onClick={handlePlayAgain}
                      className="py-3 px-5 mx-1 mt-4 rounded-md hover:text-black wallet-button"
                    >
                      Play again
                    </button>
                  </>
                )}

                {userStatus == "play" && (
                  <>
                    <button
                      onClick={handleBetHeads}
                      className="py-3 px-5 mt-4 mx-1 rounded-md hover:text-black wallet-button"
                    >
                      Bet Heads
                    </button>
                    <button
                      onClick={handleBetTails}
                      className="py-3 px-5 mx-1 mt-4 rounded-md hover:text-black wallet-button"
                    >
                      Bet Tails
                    </button>
                  </>
                )}
                {userStatus == "won" && (
                  <>
                    <h1 className="mb-10 text-4xl font-bold uppercase text-green-300">
                      you Won!
                    </h1>
                    <button
                      onClick={handleClaimReward}
                      className="py-3 px-5 mt-4 rounded-md hover:text-black wallet-button"
                    >
                      Claim Reward
                    </button>
                    <Confetti width={width} height={height} />
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FlipSection;
