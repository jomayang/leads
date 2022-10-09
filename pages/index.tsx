import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import WalletButton from "../components/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import FlipSection from "../components/FlipSection";
import Stats from "../components/Stats";
import { useCoinflip } from "../hooks/useCoinflip";

const Home: NextPage = () => {
  const { connected, publicKey } = useWallet();
  // const program = useCoinflip();

  return (
    <div>
      {/* Header */}
      <Header connected={connected} publicKey={publicKey} />
      <div className="lg:flex px-10 xl:px-20">
        <Sidebar />
        <FlipSection connected={connected} publicKey={publicKey} />
        <Stats />
      </div>
    </div>
  );
};

export default Home;
