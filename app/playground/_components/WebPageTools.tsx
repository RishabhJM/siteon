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
import { useAuth } from "@clerk/nextjs";

function WebPageTools({
  selectedScreenSize,
  setSelectedScreenSize,
  generatedCode,
  getPreviewHtml,
}: any) {
  const [finalCode, setFinalCode] = useState<string>();
  const { has } = useAuth();

  const hasUnlimitedAccess = has && has({ plan: "unlimited" });

  const downloadCode = () => {
    const previewHtml = getPreviewHtml?.() || finalCode;
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const cleanCode =
      (DEFAULT_HTML_HEADER.replace("<!--{code}-->", generatedCode) || "")
        .replaceAll("```html", "")
        .replaceAll("```", "") ?? "";
    setFinalCode(cleanCode);
  }, [generatedCode]);
  const getCurrentPreviewCode = () => getPreviewHtml?.() || finalCode;
  const openInNewTab = () => {
    const previewHtml = getCurrentPreviewCode();
    if (!previewHtml) return;

    const blob = new Blob([previewHtml], { type: "text/html" });
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
        {hasUnlimitedAccess && (
          <ViewCodeBlock code={getCurrentPreviewCode()}>
            <Button variant={"outline"}>
              View <Code></Code>
            </Button>
          </ViewCodeBlock>
        )}
        {hasUnlimitedAccess && (
          <Button variant={"outline"} onClick={() => downloadCode()}>
            Download <Download></Download>
          </Button>
        )}
      </div>
    </div>
  );
}

export default WebPageTools;
