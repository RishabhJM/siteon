"use client";
import React, { useEffect, useRef, useState } from "react";
import WebPageTools from "./WebPageTools";
import { DEFAULT_HTML_HEADER } from "@/app/constants/const";

type Props = {
  generatedCode: string;
};
function WebsiteDesign({ generatedCode }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize,setSelectedScreenSize] = useState<string>('web');

    // Initialize iframe shell once
    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(DEFAULT_HTML_HEADER);
        doc.close();
    }, []);

    useEffect(() => {
      if (!iframeRef.current) return;
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;
    
      const root = doc.getElementById("root");
      if (!root) return;
    
      let hoverEl: HTMLElement | null = null;
      let selectedEl: HTMLElement | null = null;
    
      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target instanceof HTMLElement ? e.target : null;
        if (!target || selectedEl) return;
    
        if (hoverEl && hoverEl !== target) {
          hoverEl.style.outline = "";
        }
        hoverEl = target;
        hoverEl.style.outline = "2px dotted blue";
      };
    
      const handleMouseOut = () => {
        if (hoverEl && !selectedEl) {
          hoverEl.style.outline = "";
          hoverEl = null;
        }
      };
    
      const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    
        const target = e.target instanceof HTMLElement ? e.target : null;
        if (!target) return;
    
        if (selectedEl && selectedEl !== target) {
          selectedEl.style.outline = "";
          selectedEl.removeAttribute("contenteditable");
        }
    
        selectedEl = target;
        selectedEl.style.outline = "2px solid red";
        selectedEl.setAttribute("contenteditable", "true");
        target.focus();
      };
    
      root.addEventListener("mouseover", handleMouseOver);
      root.addEventListener("mouseout", handleMouseOut);
      root.addEventListener("click", handleClick);
    
      return () => {
        root.removeEventListener("mouseover", handleMouseOver);
        root.removeEventListener("mouseout", handleMouseOut);
        root.removeEventListener("click", handleClick);
      };
    }, [generatedCode]);
    

    // Update body only when code changes
    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        const root = doc.getElementById("root");
        if (root) {
            root.innerHTML =
                generatedCode
                    ?.replaceAll("```html", "")
                    .replaceAll("```", "")
                    .replace("<!--{code}-->","")
                    .replace("html", "") ?? "";
        }
    }, [generatedCode]);

    return (
      <div className="w-full p-5 flex items-center flex-col">
        <iframe
            ref={iframeRef}
            className={`${selectedScreenSize=='web'? "w-full" : "w-130"} + " h-175 border-2 rounded-xl`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"

        />
        <WebPageTools selectedScreenSize={selectedScreenSize} setSelectedScreenSize={(v:string)=>setSelectedScreenSize(v)} generatedCode={generatedCode}></WebPageTools>
      </div>
        
    );
}

export default WebsiteDesign;



