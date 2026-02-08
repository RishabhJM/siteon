"use client";

import React, { useEffect, useState } from "react";
import { Message } from "../[projectId]/page";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  messages: Message[];
  onSend: any;
  loading: boolean;
};

function ChatSection({ messages, onSend, loading }: Props) {
  const [inputMessage, setInputMessage] = useState<string>();

  const handleSend = () => {
    if (!inputMessage?.trim()) return;
    onSend(inputMessage);
    setInputMessage("");
  };
  useEffect(()=>{
    console.log("ALL THE MESSAGES IN CHAT SECTION",messages)
    
  },[])
  return (
    <div className="w-full lg:w-96 shadow h-[50vh] lg:h-[92vh] p-4 flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto">
        {messages?.length === 0 ? (
          <p className="text-gray-400 text-center">No messages</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 my-2 rounded-lg max-w-[80%] shadow
						${msg.role === "user" ? "bg-gray-100 text-black" : "bg-gray-300 text-black"}`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-800"></div>
            <span className="ml-2 text-zinc-800">Generating response...</span>
          </div>
        )}
      </div>
      <div className="p-3 border-t flex items-center gap-2">
        <textarea
          className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
          placeholder="Start typing your ideas..."
          onChange={(event) => setInputMessage(event.target.value)}
          value={inputMessage}
        ></textarea>
        <Button onClick={handleSend} variant={"default"}>
          <ArrowUp></ArrowUp>
        </Button>
      </div>
    </div>
  );
}

export default ChatSection;
