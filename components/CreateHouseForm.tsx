import Image from "next/image";
import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import WalletButton from "./WalletButton";
import { useCoinflip } from "../hooks/useCoinflip";

function CreateHouseForm({ connected, publicKey }: any) {
  const [winRate, setWinRate] = useState(100);
  const { initializeHouse, fetchAssociatedHouse } = useCoinflip();
  const [associatedHouse, setAssociatedHouse] = useState("");
  const handleCreateHouse = () => {
    initializeHouse(winRate);
  };

  useEffect(() => {
    const getHouse = async () => {
      const result = await fetchAssociatedHouse();
      const houseAddress: any = result?.housePda.toString();
      console.log(result);
      setAssociatedHouse(houseAddress);
      // setAssociatedHouse(housePda)
    };
    getHouse();
  }, [associatedHouse]);

  return (
    <div className="flex grow items-center text-center flex-col">
      {/* <form> */}
      <div className="py-8">
        <h1 className="text-3xl uppercase font-bold">create a new house</h1>
        <p className="text-lg uppercase">
          fill the form and create your{" "}
          <b className="text-[#E93A88]">own house</b>.
        </p>
      </div>
      {associatedHouse ? (
        <p>Associated House: {associatedHouse}</p>
      ) : (
        <>
          <TextField
            label="Win Reward %"
            variant="outlined"
            value={winRate}
            onChange={(e) => setWinRate(+e.target.value)}
            placeholder="Win Reward %"
            fullWidth
          />
          <button
            onClick={handleCreateHouse}
            className="py-3 px-6 w-48 bg-[#E93A88] rounded-md uppercase font-bold text-sm hover:text-black hover:bg-white/90 my-4 transition-all ease-in-out duration-300"
          >
            create house
          </button>
        </>
      )}

      {/* </form> */}
    </div>
  );
}

export default CreateHouseForm;
