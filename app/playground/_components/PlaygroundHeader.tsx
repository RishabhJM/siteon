import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

function PlaygroundHeader() {
  return (
    <div>
      <div className="flex justify-between items-center p-4 shadow">
        <Image src={"/logo.svg"} alt="Logo" width={48} height={48} />
        <Button>Save</Button>
      </div>
    </div>
  );
}

export default PlaygroundHeader;
