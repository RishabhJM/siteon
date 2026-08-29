"use client";

import React, { useEffect, useState } from "react";
import PlaygroundHeader from "../_components/PlaygroundHeader";
import ChatSection from "../_components/ChatSection";
import WebsiteDesign from "../_components/WebsiteDesign";
import ElementSettings from "../_components/ElementSettings";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export type Frame = {
  projectId: string;
  frameId: string;
  designCode: string;
  chatMessages: Message[];
};

export type Message = {
  role: string;
  content: string;
};

export type HtmlPatch = {
  selector: string;
  html: string;
};

const stripCodeFences = (code: string) =>
  code
    .replace(/^\s*```(?:html)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

const HTML_TAGS =
  "html|body|head|header|nav|main|section|article|aside|footer|div|span|h[1-6]|p|a|button|form|input|textarea|select|option|table|thead|tbody|tr|th|td|ul|ol|li|img|figure|label|script|style";

const stripHtmlPreamble = (response: string) => {
  const code = stripCodeFences(response);
  const firstTag = code.search(new RegExp(`<(?:(?:!doctype\\s+html)|${HTML_TAGS})\\b`, "i"));
  return firstTag > 0 ? code.slice(firstTag).trim() : code;
};

const isHtmlResponse = (response: string) => {
  const code = stripHtmlPreamble(response);
  const startsWithHtml = new RegExp(
    `^(?:<!doctype\\s+html\\s*>\\s*)?<(?:(?:${HTML_TAGS}))\\b`,
    "i"
  ).test(code);
  const tagCount = code.match(new RegExp(`<(?:(?:${HTML_TAGS}))\\b`, "gi"))?.length ?? 0;

  // A complete HTML fragment may start with a component such as <header>
  // rather than an <html>/<body> wrapper.
  return startsWithHtml || (tagCount >= 2 && /<\/[a-z][^>]*>/i.test(code));
};

// The iframe already provides the document shell, so store/render only the
// generated page content when the model returns a complete HTML document.
const getRenderableCode = (response: string) => {
  const code = stripHtmlPreamble(response);
  const body = code.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (body) return body[1].trim();

  return code
    .replace(/^<!doctype\s+html\s*>\s*/i, "")
    .replace(/^<html\b[^>]*>\s*/i, "")
    .replace(/\s*<\/html>\s*$/i, "")
    .trim();
};

// Unlike getRenderableCode, this also works while the model is still
// generating the document and the closing tags do not exist yet.
const getStreamingRenderableCode = (response: string) => {
  let code = stripHtmlPreamble(response);
  const bodyStart = code.match(/<body\b[^>]*>/i);

  if (bodyStart?.index !== undefined) {
    code = code.slice(bodyStart.index + bodyStart[0].length);
  } else {
    const htmlStart = code.match(/<html\b[^>]*>/i);
    if (htmlStart?.index !== undefined) {
      code = code.slice(htmlStart.index + htmlStart[0].length);
    }
  }

  return code
    .replace(/<\/body>[\s\S]*$/i, "")
    .replace(/<\/html>\s*$/i, "")
    .trim();
};

const parseHtmlPatches = (response: string): HtmlPatch[] | null => {
  const cleaned = response
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  const start = Math.min(
    ...[cleaned.indexOf("{"), cleaned.indexOf("[")].filter((index) => index >= 0)
  );
  if (!Number.isFinite(start)) return null;

  const end = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (end < start) return null;

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    const patches = Array.isArray(parsed)
      ? parsed
      : parsed.operations ?? parsed.patches ?? [parsed];
    if (!Array.isArray(patches)) return null;

    const validPatches = patches.filter(
      (patch): patch is HtmlPatch =>
        typeof patch?.selector === "string" && typeof patch?.html === "string"
    );
    return validPatches.length > 0 ? validPatches : null;
  } catch (error) {
    console.error("[playground] Failed to parse AI edit patch JSON:", {
      error,
      responseStart: response.slice(0, 160),
    });
    return null;
  }
};

const isPatchLikeResponse = (response: string) =>
  /^\s*```(?:json)?\s*[\[{]/i.test(response) ||
  /["'](?:operations|patches|selector)["']\s*:/i.test(response);

const PROMPT = `
userInput: {userInput}

Instructions:

1. If the user input is explicitly asking to generate or modify a website, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code", "Change the hero section", or "Make the buttons green"), then:

   - Generate a complete HTML Tailwind CSS code using Flowbite UI components, starting from <html> tag(Not <!DOCTYPE html).  
   - Approach the page as an experienced creative director and senior product designer. Create a distinctive visual concept that fits the user's subject, audience, and mood instead of falling back to a generic SaaS template.
   - Make the page feel immersive and art-directed: establish a clear visual narrative, strong hierarchy, intentional composition, memorable typography, and a considered rhythm of whitespace and dense detail. Use asymmetry, layering, editorial layouts, unexpected but usable interactions, and rich section transitions when they serve the concept.
   - Choose a purposeful color system, typography pairing, imagery direction, and graphic language. Do not force blue or any other default palette when it does not suit the brief. Ensure contrast and accessibility.
   - Avoid AI-generated design clichés and visual slop: no interchangeable centered hero with three feature cards, no repetitive rounded rectangles, no excessive pills, no gratuitous gradients, no random glassmorphism, no neon glow everywhere, no meaningless badges, no placeholder copy, and no decorative elements that do not support the story.
   - Write specific, believable content for the requested brand or experience. Use varied layouts and component shapes rather than repeating the same card pattern. Every section should have a clear purpose and contribute to the overall atmosphere.
   - Make the first viewport immediately compelling, with a strong focal point and a polished responsive composition. Design mobile layouts intentionally rather than merely stacking desktop columns.
   - Treat readability as non-negotiable: explicitly set text colors for every major section and component, verify text against its actual background, and never use black or near-black text on dark backgrounds or white text on light backgrounds. Maintain WCAG AA-level contrast for body text, labels, buttons, links, placeholders, and hover/focus states.
   - Build theme support into the page. When dark mode is requested, implement a complete dark theme using Tailwind \`dark:\` variants across backgrounds, text, borders, controls, overlays, and imagery—not just a dark page background. Include a visible, keyboard-accessible light/dark toggle with an accessible label, persist the preference in localStorage, and respect the user's system preference on first visit. Keep contrast and focus states accessible in both themes.
   - Remember this: Only include the <body> content (do not add <head> or <title>).  
   - Make it fully responsive for all screen sizes.  
   - Add proper padding and margin for each element.  
   - Components should feel like parts of one coherent experience; connect them through consistent spacing, typography, color, motion, and interaction patterns.
   - Use placeholders for all images: https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg
       - Add alt tag describing the image prompt.  
   - Use the following libraries/components where appropriate:  
       - FontAwesome icons (fa fa-)  
       - Flowbite UI components: buttons, modals, forms, tables, tabs, alerts, cards, dialogs, dropdowns, accordions, etc.  
       - Chart.js for charts & graphs  
       - Swiper.js for sliders/carousels  
       - Tippy.js for tooltips & popovers  
   - Include interactive components like modals, dropdowns, and accordions.  
   - Ensure proper spacing, alignment, hierarchy, and theme consistency.  
   - Ensure charts are visually appealing and match the theme color.  
   - Header menu options should be spread out and not connected.  
   - Do not include broken links.  
   - Do not add any extra text before or after the HTML code.  

2. If the user input is "general text or greetings" (e.g., "Hi", "Hello", "How are you?") or does not explicitly ask to generate code, then:

   - Respond with a simple, friendly text message instead of generating any code.  

{editInstructions}

Existing website HTML:
{currentCode}

Example:

- User: "Hi" → Response: "Hello! How can I help you today?"  
- User: "Build a responsive landing page with Tailwind CSS" → Response: [Generate full HTML code as per instructions above]
`;

function Playground() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frameId");
  const [frameDetails, setFrameDetails] = useState<Frame>();
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [htmlPatches, setHtmlPatches] = useState<HtmlPatch[]>([]);

  // console.log(frameId);
  // console.log(projectId);
  useEffect(() => {
    frameId && projectId && GetFrameDetails();
  }, []);

  const GetFrameDetails = async () => {
    const result = await axios.get(
      "/api/frames?frameId=" + frameId + "&projectId=" + projectId,
      {}
    );
    // console.log("RESULT FRAME DATA FROM DB", result?.data);
    // console.log("RESULT FRAME Design DATA FROM DB", result?.data?.designCode);
    setFrameDetails(result.data);
    if (result.data?.chatMessages?.length === 1) {
      const userMsg = result.data?.chatMessages[0].content;
      sendMessage(userMsg);
    } else {
      setMessages(result.data?.chatMessages);
    }
    if (result.data?.designCode) {
      setGeneratedCode(getRenderableCode(result.data.designCode));
    }
  };

  const sendMessage = async (userMessage: string) => {
    setLoading(true);
    const isEditing = Boolean(generatedCode.trim());
    if (isEditing) setHtmlPatches([]);
    const editInstructions = isEditing
      ? `This is an edit to an existing website. Return ONLY valid JSON in this exact shape:
{"operations":[{"selector":"a precise CSS selector for an existing element","html":"the complete replacement HTML for that element"}]}
Use one or more operations for the requested change. Do not return Markdown, code fences, explanations, or a complete document. Select the smallest existing element that fully contains the requested change. Preserve all unrelated content and functionality.`
      : `This is a new website request. Return the complete HTML page as instructed above.`;

    // if(messages.length===0){
    //   setMessages(() => [{ role: "user", content: userMessage }]);
    // }else{
    //   setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    // }
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    const result = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: PROMPT
              .replace("{userInput}", userMessage)
              .replace("{editInstructions}", editInstructions)
              .replace("{currentCode}", generatedCode || "(none - create a new website)"),
          },
        ],
      }),
    });

    if (!result.ok) {
      const errorBody = await result.text();
      console.error("[playground] AI request failed:", {
        status: result.status,
        responseStart: errorBody.slice(0, 160),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong while generating the response." },
      ]);
      setLoading(false);
      return;
    }

    const reader = result.body?.getReader();
    if (!reader) {
      console.error("[playground] AI response did not include a readable stream");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong while generating the response." },
      ]);
      setLoading(false);
      return;
    }
    const decoder = new TextDecoder();

    let aiResponse = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      aiResponse += chunk;

      if (isEditing) {
        const patches = parseHtmlPatches(aiResponse);
        if (patches) setHtmlPatches(patches);
      } else if (isHtmlResponse(aiResponse)) {
        // Render the accumulated response as soon as it looks like HTML. This
        // makes initial website generation update progressively.
        setGeneratedCode(getStreamingRenderableCode(aiResponse));
      }
    }

    const patches = isEditing ? parseHtmlPatches(aiResponse) : null;
    const isCompleteHtml = isHtmlResponse(aiResponse);
    const isCode = isEditing ? Boolean(patches) || isCompleteHtml : isCompleteHtml;
    if (patches) {
      setHtmlPatches(patches);
    } else if (isCompleteHtml) {
      if (isEditing) {
        console.warn(
          "[playground] AI returned a complete HTML document for an edit instead of JSON patches; applying it as a fallback."
        );
      }
      setGeneratedCode(getRenderableCode(aiResponse));
    }

    const invalidEditResponse =
      isEditing && (isHtmlResponse(aiResponse) || isPatchLikeResponse(aiResponse));
    if (!isCode && !invalidEditResponse) {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } else if (invalidEditResponse) {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: "I couldn’t apply that change. Please try the edit again." },
      ]);
    } else {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: "Your code is ready" },
      ]);
    }
    if ((!isEditing || isCompleteHtml) && isCode) {
      await saveGeneratedCode(aiResponse);
    }
    setLoading(false);
  };

  // useEffect(() => {
  //   console.log(generatedCode);
  // },[generatedCode])

  const saveGeneratedCode = async (aiResponse: string) => {
    const result = await axios.put("/api/frames", {
      designCode: aiResponse,
      frameId: frameId,
      projectId: projectId,
    });
    console.log(result.data);
    toast.success("Website is ready!");
  };

  useEffect(() => {
    if (messages.length > 1) {
      saveMessages(messages);
    }
  }, [messages]);

  const saveMessages = async (messages:Message[]) => {
    const result = await axios.put("/api/chat", {
      messages: messages,
      frameId: frameId,
    });
    console.log(result);
  };

  return (
    <div>
      <PlaygroundHeader />
      <div className="flex flex-col lg:flex-row">
        <ChatSection
          messages={messages ?? []}
          onSend={(input: string) => sendMessage(input)}
          loading={loading}
        />
        <WebsiteDesign
          generatedCode={generatedCode?.replace("```", "")}
          htmlPatches={htmlPatches}
          onCodeChange={(html) => {
            setGeneratedCode(html);
            saveGeneratedCode(html);
          }}
        />
        
      </div>
    </div>
  );
}

export default Playground;
