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
import type { HtmlPatch } from "../[projectId]/page";

type Props = {
  generatedCode: string;
  htmlPatches?: HtmlPatch[];
  onCodeChange?: (html: string) => void;
};

function WebsiteDesign({ generatedCode, htmlPatches = [], onCodeChange }: Props) {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frameId");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedScreenSize, setSelectedScreenSize] = useState<string>("web");
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>();
  const {onSaveData,setOnSaveData} = useContext(OnSaveContext);
  const [iframeReady, setIframeReady] = useState(false);
  const appliedPatchSignature = useRef("");


  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.srcdoc = DEFAULT_HTML_HEADER;
  }, []);


  useEffect(() => {
    if (!iframeReady || !iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    const root = doc.getElementById("root");
    if (!root) return;
    const cleanCode = generatedCode?.trim() ?? "";
    root.innerHTML = cleanCode;
    setSelectedElement(null); // clear stale selection when DOM is replaced
  }, [generatedCode, iframeReady]);

  useEffect(() => {
    if (htmlPatches.length === 0) {
      appliedPatchSignature.current = "";
      return;
    }
    if (!iframeReady || !iframeRef.current) return;
    const patchSignature = JSON.stringify(htmlPatches);
    if (patchSignature === appliedPatchSignature.current) return;

    const doc = iframeRef.current.contentDocument;
    const root = doc?.getElementById("root");
    if (!root) return;

    let applied = false;
    htmlPatches.forEach(({ selector, html }) => {
      try {
        const target = root.matches(selector)
          ? root
          : root.querySelector<HTMLElement>(selector);
        if (!target) return;

        // The iframe root is the document body. Preserve that root when a
        // patch targets body/:root, otherwise replacing it breaks the editor.
        if (target === root) {
          const parsed = new DOMParser().parseFromString(html, "text/html");
          const replacementBody = parsed.body;
          Array.from(replacementBody.attributes).forEach((attribute) => {
            if (attribute.name !== "id") root.setAttribute(attribute.name, attribute.value);
          });
          root.innerHTML = replacementBody.innerHTML;
        } else {
          target.outerHTML = html;
        }
        applied = true;
      } catch (error) {
        console.error("[playground] Failed to apply HTML patch:", { selector, error });
      }
    });

    if (!applied) {
      console.error("[playground] No HTML patch selector matched the preview:",
        htmlPatches.map(({ selector }) => selector));
    }

    if (applied) {
      appliedPatchSignature.current = patchSignature;
      setSelectedElement(null);
      onCodeChange?.(root.innerHTML);
    }
  }, [htmlPatches, iframeReady, onCodeChange]);


  const handleIframeLoad = () => {
    setIframeReady(true); // unblocks the content effect
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    // Keep the preview's browser color scheme independent from Siteon's
    // next-themes class on the parent document.
    doc.documentElement.style.colorScheme = "light";
    iframeRef.current?.style.setProperty("color-scheme", "light");
    const root = doc.getElementById("root");
    if (!root) return;

    let hoverEl: HTMLElement | null = null;
    let selectedEl: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || selectedEl) return;
      if (target === root || target === doc.body) return;
      if (hoverEl && hoverEl !== target) hoverEl.style.outline = "";
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
  };

  useEffect(()=>{
    if(onSaveData){
      console.log("SAVE CALLED");
      onSaveCode();
      setOnSaveData(null);
    }
  },[onSaveData])

  const onSaveCode= async ()=>{
    if(iframeRef.current){
      try{
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if(iframeDoc){
          const cloneDoc = iframeDoc.documentElement.cloneNode(true) as HTMLElement;
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
    <div className="flex flex-col lg:flex-row gap-2 w-full">
      <div className="w-full p-5 flex items-center flex-col">
        <iframe
          ref={iframeRef}
          onLoad={handleIframeLoad}
          className={`${selectedScreenSize == "web" ? "w-full" : "w-130"} h-175 border-2 rounded-xl max-w-full`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        />
        <WebPageTools
          selectedScreenSize={selectedScreenSize}
          setSelectedScreenSize={(v: string) => setSelectedScreenSize(v)}
          generatedCode={generatedCode}
          getPreviewHtml={() => {
            const documentElement = iframeRef.current?.contentDocument?.documentElement;
            if (!documentElement) return "";

            const snapshot = documentElement.cloneNode(true) as HTMLElement;
            const sourceElements = [
              documentElement,
              ...Array.from(documentElement.querySelectorAll<HTMLElement>("*")),
            ];
            const snapshotElements = [
              snapshot,
              ...Array.from(snapshot.querySelectorAll<HTMLElement>("*")),
            ];

            // A new tab has a different viewport and can recalculate
            // responsive/dark utility rules. Freeze the colors visible in
            // the iframe so the standalone preview is visually identical.
            sourceElements.forEach((source, index) => {
              const target = snapshotElements[index];
              const computed = source.ownerDocument.defaultView?.getComputedStyle(source);
              if (!target || !computed) return;
              [
                ["color", computed.color],
                ["background-color", computed.backgroundColor],
                ["border-top-color", computed.borderTopColor],
                ["border-right-color", computed.borderRightColor],
                ["border-bottom-color", computed.borderBottomColor],
                ["border-left-color", computed.borderLeftColor],
              ].forEach(([property, value]) => {
                target.style.setProperty(property, value, "important");
              });
            });

            // The iframe's document has already been initialized. A new tab
            // must not execute the shell or generated scripts a second time,
            // otherwise Tailwind/Flowbite can produce a different theme state
            // than the rendered iframe. Keep the generated styles in the
            // snapshot, but make the snapshot static.
            snapshot.querySelectorAll("script").forEach((script) => script.remove());
            return `<!DOCTYPE html>\n${snapshot.outerHTML}`;
          }}
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
