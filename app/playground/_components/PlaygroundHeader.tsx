import { Button } from "@/components/ui/button";
import { OnSaveContext } from "@/context/OnSaveContext";
import Image from "next/image";
import React, { useContext } from "react";

function PlaygroundHeader() {
  const {onSaveData,setOnSaveData} = useContext(OnSaveContext);
  return (
    <div>
      <div className="flex justify-between items-center p-4 shadow">
        <Image src={"/logo.svg"} alt="Logo" width={48} height={48} />
        <Button onClick={()=>setOnSaveData(Date.now())}>Save</Button>
      </div>
    </div>
  );
}

export default PlaygroundHeader;
