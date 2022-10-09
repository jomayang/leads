import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import WalletButton from "../../components/WalletButton";
import { useWallet } from "@solana/wallet-adapter-react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import CreateHouseForm from "../../components/CreateHouseForm";

const CreateHouse: NextPage = () => {
  const { connected, publicKey } = useWallet();

  return (
    <div>
      {/* Header */}
      <Header connected={connected} publicKey={publicKey} />
      <div className="lg:flex px-10 xl:px-20">
        <Sidebar />
        <CreateHouseForm />
      </div>
    </div>
  );
};

export default CreateHouse;
