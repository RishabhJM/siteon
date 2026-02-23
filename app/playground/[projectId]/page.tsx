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

const PROMPT = `
userInput: {userInput}

Instructions:

1. If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code"), then:

   - Generate a complete HTML Tailwind CSS code using Flowbite UI components, starting from <html> tag(Not <!DOCTYPE html).  
   - Use a modern design with **blue as the primary color theme**.  
   - Remember this: Only include the <body> content (do not add <head> or <title>).  
   - Make it fully responsive for all screen sizes.  
   - All primary components must match the theme color.  
   - Add proper padding and margin for each element.  
   - Components should be independent; do not connect them.  
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
      const designCode = result.data?.designCode;
      const index = designCode.indexOf("```html") + 7;
      const formattedCode = designCode.slice(index);
      setGeneratedCode(formattedCode);
    }
  };

  const sendMessage = async (userMessage: string) => {
    setLoading(true);

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
            content: PROMPT?.replace("{userInput}", userMessage),
          },
        ],
      }),
    });

    const reader = result.body?.getReader();
    const decoder = new TextDecoder();

    let aiResponse = "";
    let isCode = false;

    while (true) {
      //@ts-ignore
      const { done, value } = await reader?.read();

      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      aiResponse += chunk;
      console.log(aiResponse)

      if (!isCode && aiResponse.includes("```html")) {
        isCode = true;
        const index = aiResponse.indexOf("```html") + 7;
        const initialCodeChunk = aiResponse.slice(index);
        setGeneratedCode((prev: any) => prev + initialCodeChunk);
      } else if (isCode) {
        setGeneratedCode((prev: any) => prev + chunk);
      }
    }
    console.log(aiResponse)

    if (!isCode) {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } else {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: "Your code is ready" },
      ]);
    }
    await saveGeneratedCode(aiResponse);
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
        <WebsiteDesign generatedCode={generatedCode?.replace("```", "")} />
        
      </div>
    </div>
  );
}

export default Playground;
