import React from "react";
import WalletButton from "./WalletButton";

function Header({ connected, publicKey }: any) {
  return (
    <div className="sticky bg-[#120C18] top-0 transition-all md:grid md:grid-cols-2 items-center px-10 xl:px-20 py-4 z-50">
      <h1 className="text-xl uppercase font-bold">Logo</h1>
      <div className="flex items-center justify-end">
        <WalletButton connected={connected} publicKey={publicKey} isHeader />
      </div>
    </div>
  );
}

export default Header;
