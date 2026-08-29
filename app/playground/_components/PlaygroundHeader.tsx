import { Button } from "@/components/ui/button";
import { OnSaveContext } from "@/context/OnSaveContext";
import Image from "next/image";
import Link from "next/link";
import React, { useContext } from "react";
import ThemeToggle from "@/app/_components/ThemeToggle";

function PlaygroundHeader() {
  const {onSaveData,setOnSaveData} = useContext(OnSaveContext);
  return (
    <div>
      <div className="flex items-center justify-between border-b border-border bg-background/80 p-3 shadow-sm backdrop-blur">
        <Link href="/">
          <Image src={"/logo.svg"} alt="Logo" width={48} height={48} className="cursor-pointer"/>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={()=>setOnSaveData(Date.now())}>Save</Button>
        </div>
      </div>
    </div>
  );
}

export default PlaygroundHeader;
