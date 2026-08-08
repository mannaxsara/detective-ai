"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Sparkles, MessageSquare, Bot, User, Trash2 } from "lucide-react";
import { analysisAPI } from "@/lib/api";

interface ChatTabProps {
  datasetId: number | string;
}

interface Message {
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "What is the total size of the dataset?",
  "What are the main KPIs?",
  "Show some detected insights.",
  "Are there any outliers or anomalies?",
];

export default function ChatTab({ datasetId }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content: "Hello! I am **DetectiveAI**, your autonomous data analyst. Ask me anything about your dataset's size, KPIs, insights, recommendations, or anomalies!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (message: string) => analysisAPI.chat(datasetId, message),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: data.reply, timestamp: new Date() },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Sorry, I encountered an error trying to process that request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = (text: string) => {
    if (!text.trim() || mutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: text, timestamp: new Date() }]);
    setInput("");
    mutation.mutate(text);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    setMessages([
      {
        role: "bot",
        content: "Chat cleared! Ask me anything about your dataset's size, KPIs, insights, recommendations, or anomalies!",
        timestamp: new Date(),
      },
    ]);
  };

  const formatMessage = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-black dark:text-white bg-[#edfe5e] px-1 rounded">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded border border-black bg-[#edf0e9] dark:bg-[#262720] text-xs font-mono font-bold text-black dark:text-white">{part.slice(1, -1)}</code>;
      }
      if (part === '\n') {
        return <br key={i} />;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans text-black dark:text-white">
      {/* Sidebar Suggestions */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-black dark:text-white">
              <Sparkles className="w-4 h-4 text-black dark:text-white" />
              Quick Queries
            </h4>
            <p className="text-xs font-sans text-black/75 dark:text-white/75 mt-1 font-medium">
              Click any prompt below to query the case file.
            </p>
          </div>
          
          <div className="space-y-2.5 pt-1">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={mutation.isPending}
                className="w-full text-left p-3 rounded-[10px] border border-black bg-[#edf0e9] dark:bg-[#262720] hover:bg-[#edfe5e] hover:text-black transition-all text-xs font-mono font-bold cursor-pointer shadow-[1.5px_1.5px_0px_#000000] disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="lg:col-span-3">
        <div className="rounded-[18px] border border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] flex flex-col h-[calc(100vh-280px)] min-h-[480px] md:h-[600px] overflow-hidden shadow-[4px_4px_0px_#000000]">
          {/* Header */}
          <div className="p-4 border-b border-black dark:border-[#3b3a33] bg-[#edf0e9] dark:bg-[#262720] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#edfe5e] border border-black flex items-center justify-center text-black shadow-[1px_1px_0px_#000000]">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-serif font-bold text-black dark:text-white">Investigation Log Panel</h4>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-black/75 dark:text-white/75">
                  Query evidence dataset metrics & health anomalies
                </p>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="p-1.5 rounded-[6px] border border-black bg-white dark:bg-[#1c1d18] text-black dark:text-white hover:bg-[#bc3e3e] hover:text-white transition-colors cursor-pointer"
              title="Clear Chat Logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f9f9f7] dark:bg-[#11120d]">
            {messages.map((msg, index) => {
              const isBot = msg.role === "bot";
              return (
                <div key={index} className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  <div
                    className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 border border-black ${
                      isBot
                        ? "bg-[#edfe5e] text-black"
                        : "bg-white dark:bg-[#1c1d18] text-black dark:text-white"
                    } shadow-[1px_1px_0px_#000000]`}
                  >
                    {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`p-4 rounded-[14px] text-xs leading-relaxed border border-black ${
                        isBot
                          ? "bg-white dark:bg-[#1c1d18] text-black dark:text-white shadow-[2px_2px_0px_#000000]"
                          : "bg-[#edfe5e] text-black font-bold shadow-[2px_2px_0px_#000000]"
                      }`}
                    >
                      {isBot ? formatMessage(msg.content) : <p className="font-mono text-xs">{msg.content}</p>}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-black/60 dark:text-white/60 px-1 block text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {mutation.isPending && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 border border-black bg-[#edfe5e] text-black shadow-[1px_1px_0px_#000000]">
                  <Bot className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="p-4 rounded-[14px] bg-white dark:bg-[#1c1d18] border border-black text-black dark:text-white text-xs font-mono font-bold flex items-center gap-2.5 shadow-[2px_2px_0px_#000000]">
                  <span className="flex gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-black dark:bg-[#edfe5e] animate-ping" />
                  </span>
                  Querying evidence database...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-black dark:border-[#3b3a33] bg-white dark:bg-[#1c1d18] flex gap-3 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask a question about the evidence dataset..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={mutation.isPending}
              className="flex-1 bg-[#edf0e9] dark:bg-[#262720] border border-black dark:border-[#3b3a33] text-black dark:text-white text-xs font-mono font-bold h-11 rounded-[10px] px-4 placeholder:text-black/50 dark:placeholder:text-white/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !input.trim()}
              className="btn-ink-accent text-xs py-2 px-5 font-mono uppercase font-bold inline-flex items-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
