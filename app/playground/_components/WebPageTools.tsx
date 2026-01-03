import { DEFAULT_HTML_HEADER } from "@/app/constants/const";
import { Button } from "@/components/ui/button";
import {
  Code,
  Code2,
  Download,
  Monitor,
  SquareArrowOutUpRight,
  TabletSmartphone,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import ViewCodeBlock from "./ViewCodeBlock";

function WebPageTools({
  selectedScreenSize,
  setSelectedScreenSize,
  generatedCode,
}: any) {

    const [finalCode,setFinalCode] = useState<string>();

    const downloadCode = () => {
        if (!finalCode) return;
        const blob = new Blob([finalCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
        a.href=url;
        a.download='index.html'
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    }

    useEffect(()=>{
        const cleanCode =
        (DEFAULT_HTML_HEADER.replace("<!--{code}-->", generatedCode) || "")
          .replaceAll("```html", "")
          .replaceAll("```", "")
          .replace("html", "") ?? "";
    setFinalCode(cleanCode);

    },[generatedCode])
  const openInNewTab = () => {
    if (!finalCode) return;

    const blob = new Blob([finalCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    window.open(url, "_blank");
  };
  return (
    <div className="p-2 shadow rounded-xl w-full flex items-center justify-between">
      <div className="flex gap-2">
        <Button
          variant={"ghost"}
          className={`${
            selectedScreenSize == "web" ? "border border-primary" : null
          }`}
          onClick={() => setSelectedScreenSize("web")}
        >
          <Monitor></Monitor>{" "}
        </Button>
        <Button
          variant={"ghost"}
          className={`${
            selectedScreenSize == "mobile" ? "border border-primary" : null
          }`}
          onClick={() => setSelectedScreenSize("mobile")}
        >
          {" "}
          <TabletSmartphone></TabletSmartphone>
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant={"outline"} onClick={() => openInNewTab()}>
          View <SquareArrowOutUpRight></SquareArrowOutUpRight>
        </Button>
        <ViewCodeBlock code={finalCode}>
          <Button variant={"outline"}>
            View <Code></Code>
          </Button>
        </ViewCodeBlock>
        <Button variant={"outline"} onClick={()=> downloadCode()}>
          Download <Download></Download>
        </Button>
      </div>
    </div>
  );
}

export default WebPageTools;
