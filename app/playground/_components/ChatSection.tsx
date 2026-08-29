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
    <div className="flex h-[50vh] w-full flex-col justify-between border-r border-border bg-background p-4 shadow-sm lg:h-[92vh] lg:w-96">
      <div className="flex-1 overflow-y-auto">
        {messages?.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">No messages</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`my-2 max-w-[80%] rounded-xl p-3 text-sm shadow-sm
						${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-center items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div>
            <span className="ml-2 text-sm text-muted-foreground">Generating response...</span>
          </div>
        )}
      </div>
      <div className="p-3 border-t flex items-center gap-2">
        <textarea
          className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
