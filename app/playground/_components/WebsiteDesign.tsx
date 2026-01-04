"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import WebPageTools from "./WebPageTools";
import { DEFAULT_HTML_HEADER } from "@/app/constants/const";
import ElementSettings from "./ElementSettings";
import ImageSettings from "./ImageSettings";
import { OnSaveContext } from "@/context/OnSaveContext";
import { toast } from "sonner";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

type Props = {
  generatedCode: string;
};
function WebsiteDesign({ generatedCode }: Props) {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frameId");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState<string>("web");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>();
  const {onSaveData,setOnSaveData} = useContext(OnSaveContext);


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

    root.innerHTML =
      generatedCode
        ?.replaceAll("```html", "")
        .replaceAll("```", "")
        .replace("<!--{code}-->", "")
        .replace("html", "") ?? "";

    let hoverEl: HTMLElement | null = null;
    let selectedEl: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || selectedEl) return;
      if (target === root || target === doc.body) return;

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

      const target = e.target as HTMLElement;
      if (!target || target === root) return;
      console.log("Selected Element", target);

      if (selectedEl && selectedEl !== target) {
        selectedEl.style.outline = "";
        selectedEl.removeAttribute("contenteditable");
      }

      selectedEl = target;
      selectedEl.style.outline = "2px solid red";
      selectedEl.setAttribute("contenteditable", "true");
      target.focus();
      setSelectedElement(selectedEl);
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

  useEffect(()=>{
    onSaveData && onSaveCode();
  },[onSaveData])

  const onSaveCode= async ()=>{
    if(iframeRef.current){
      try{
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if(iframeDoc){
          const cloneDoc = iframeDoc.documentElement.cloneNode(true) as HTMLElement;
          //remove all outlines
          const AllEls = cloneDoc.querySelectorAll<HTMLElement>("*");
          AllEls.forEach(el=>{
            el.style.outline = "";
            el.style.cursor = "";
          })
          const html = cloneDoc.outerHTML;
          await saveGeneratedCode(html);
          console.log("HTML to save",html);
        }
      } catch(err){
        console.log(err);
      }
    }
  }

  const saveGeneratedCode = async (htmlCode: string) => {
    const result = await axios.put("/api/frames", {
      designCode: htmlCode,
      frameId: frameId,
      projectId: projectId,
    });
    console.log(result.data);
    toast.success("Changes saved succesfully!");
  };

  return (
    <div className="flex gap-2 w-full">
      <div className="w-full p-5 flex items-center flex-col">
        <iframe
          ref={iframeRef}
          className={`${
            selectedScreenSize == "web" ? "w-full" : "w-130"
          } + " h-175 border-2 rounded-xl`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        />
        <WebPageTools
          selectedScreenSize={selectedScreenSize}
          setSelectedScreenSize={(v: string) => setSelectedScreenSize(v)}
          generatedCode={generatedCode}
        ></WebPageTools>
      </div>
      <div>
        {/* @ts-ignore */}
        {selectedElement?.tagName == "IMG" ? (
          //@ts-ignore
          <ImageSettings selectedEl={selectedElement}></ImageSettings>
        ) : selectedElement ? (
          <ElementSettings
            selectedEl={selectedElement}
            clearSelection={() => setSelectedElement(null)}
          ></ElementSettings>
        ) : null}
      </div>
    </div>
  );
}

export default WebsiteDesign;
