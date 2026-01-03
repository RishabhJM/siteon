import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

function ViewCodeBlock({ children, code }: any) {
    const handleCopy = async () =>{
        await navigator.clipboard.writeText(code);
        toast.success("Code copied to clipboard");
    }
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="min-w-5xl max-h-150 overflow-auto">
        <DialogHeader>
          <DialogTitle><div className="flex gap-4 items-center">Source Code <span><Button onClick={handleCopy}><Copy/></Button></span></div></DialogTitle>
          {/* <DialogDescription>
          </DialogDescription> */}
          <div>
              <SyntaxHighlighter language="html" style={docco}>{code} </SyntaxHighlighter>
            </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default ViewCodeBlock;
