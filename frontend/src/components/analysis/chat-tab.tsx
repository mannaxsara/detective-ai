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

  // Dynamic message formatter for markdown bullet lists and bold text
  const formatMessage = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      let cleanLine = line.trim();
      if (!cleanLine) return <div key={idx} className="h-2" />;
      
      // Detect bullet points
      const isBullet = cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*');
      if (isBullet) {
        cleanLine = cleanLine.substring(1).trim();
      }

      // Bold parser helper: **text** -> strong
      const parts = [];
      let remaining = cleanLine;
      while (remaining.includes('**')) {
        const startIndex = remaining.indexOf('**');
        const endIndex = remaining.indexOf('**', startIndex + 2);
        if (endIndex === -1) break;
        
        parts.push(remaining.substring(0, startIndex));
        parts.push(<strong key={startIndex} className="font-extrabold text-foreground">{remaining.substring(startIndex + 2, endIndex)}</strong>);
        remaining = remaining.substring(endIndex + 2);
      }
      parts.push(remaining);

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 text-left pl-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
            <span className="text-foreground/90 text-xs">{parts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-foreground/90 text-xs leading-relaxed text-left py-0.5 font-medium">
          {parts}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-sans">
      {/* Sidebar Suggestions */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5.5 text-left relative overflow-hidden shadow-none">
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Quick Queries
            </h4>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
              Click any prompt below to query the case file.
            </p>
          </div>
          
          <div className="space-y-2 mt-4.5">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={mutation.isPending}
                className="w-full text-left p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors duration-150 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 font-semibold cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-border bg-card flex flex-col h-[600px] overflow-hidden relative shadow-none">
          {/* Header */}
          <div className="p-4 border-b border-border bg-muted/30 flex flex-row items-center justify-between z-10">
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Investigation Log Panel</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  Query the evidence dataset metrics and health anomalies
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={clearChat}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 rounded-lg w-8 h-8 flex items-center justify-center cursor-pointer border border-transparent"
                title="Clear Chat Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-background/50 scrollbar-thin">
            {messages.map((msg, index) => {
              const isBot = msg.role === "bot";
              return (
                <div key={index} className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isBot
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-muted/50 border-border text-foreground"
                    }`}
                  >
                    {isBot ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>

                  <div className="space-y-1 text-left">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                        isBot
                          ? "bg-muted/40 border-border text-foreground rounded-tl-none"
                          : "bg-primary/10 border-primary/20 text-foreground rounded-tr-none"
                      }`}
                    >
                      {isBot ? formatMessage(msg.content) : <p className="font-semibold text-foreground">{msg.content}</p>}
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground/70 px-1 block text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {mutation.isPending && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20 text-primary">
                  <Bot className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div className="p-4 rounded-2xl bg-muted/40 border border-border text-muted-foreground text-xs rounded-tl-none flex items-center gap-2.5 font-semibold text-left">
                  <span className="flex gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
                  </span>
                  Querying database findings...
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
            className="p-4 border-t border-border bg-card flex gap-3"
          >
            <input
              type="text"
              placeholder="Ask a question about the evidence dataset..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={mutation.isPending}
              className="flex-1 bg-muted/30 border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs h-11 rounded-xl px-4.5 placeholder:text-muted-foreground/60 text-foreground transition-all"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !input.trim()}
              className="bg-primary hover:opacity-90 text-primary-foreground font-bold text-xs uppercase tracking-wider shrink-0 h-11 px-6 rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
