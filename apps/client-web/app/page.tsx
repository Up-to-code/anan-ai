"use client";

import { useState } from "react";
import { useLocale } from "./_components/LocaleProvider";
import { ChatMessage } from "@/components/ui/chat-message";
import { ChatSuggestions } from "@/components/ui/chat-suggestions";
import { AssistantTurn } from "@/components/assistant/AssistantTurn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Menu, Settings, LogOut } from "lucide-react";
import { buildBuyerChatSuggestions, type BuyerAssistantMessage, type BuyerChatSuggestion } from "@anan/client-assistant";

export default function PublicAssistantPage() {
  const { locale, dictionary, isRtl } = useLocale();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<BuyerAssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: dictionary.assistant.welcome,
      createdAt: Date.now(),
    },
  ]);

  const suggestions = buildBuyerChatSuggestions(locale, "default");

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: BuyerAssistantMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate assistant reply
    setTimeout(() => {
      const assistantReply: BuyerAssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: locale === "ar" 
          ? "جاري البحث عن أفضل الخيارات لك..." 
          : "Searching for the best options for you...",
        createdAt: Date.now(),
        uiTurn: {
          objective: "client_assistant",
          targetZone: "client_web",
          assistantText: locale === "ar"
            ? "لقد وجدت لك بعض العقارات المميزة في الرياض التي تناسب متطلباتك."
            : "I found some premium properties in Riyadh that match your requirements.",
          cards: [
            {
              id: "prop-1",
              componentId: "property_shortlist",
              props: {
                properties: [
                  {
                    id: "1",
                    title: "فيلا ريفان ريزيدنس",
                    address: "حي الملقا، الرياض",
                    price: 2500000,
                    beds: 4,
                    baths: 5,
                    area: "450 م²",
                    media: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"],
                  },
                  {
                    id: "2",
                    title: "شقة نرجس فيو",
                    address: "حي النرجس، الرياض",
                    price: 1200000,
                    beds: 3,
                    baths: 3,
                    area: "180 م²",
                    media: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
                  }
                ]
              }
            }
          ]
        }
      };
      setMessages((prev) => [...prev, assistantReply]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b-2 border-slate-100 flex items-center justify-between px-6 shrink-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
          </div>
          <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-900">
            Anan <span className="text-blue-600">Assistant</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon-sm" className="text-slate-400">
              <Menu className="w-4 h-4" />
           </Button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 relative">
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col min-h-full">
          {messages.map((message) => (
            <div key={message.id}>
              {message.uiTurn ? (
                <AssistantTurn turn={message.uiTurn} />
              ) : (
                <ChatMessage message={message} />
              )}
            </div>
          ))}
          
          <div className="mt-auto pt-4">
             <ChatSuggestions 
                suggestions={suggestions} 
                onSelect={(s) => handleSend(s.prompt)} 
             />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t-2 border-slate-100 bg-white shrink-0">
        <div className="max-w-3xl mx-auto relative group">
          <Input 
            placeholder={dictionary.assistant.placeholder}
            className="h-14 pr-14 rounded-xl border-2 border-slate-100 focus:border-blue-600 focus:ring-0 transition-all text-sm font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          />
          <Button 
            className={cn(
              "absolute top-2 bottom-2 w-10 h-10 rounded-lg p-0 transition-all",
              isRtl ? "left-2" : "right-2",
              input.trim() ? "bg-blue-600" : "bg-slate-100 text-slate-400"
            )}
            onClick={() => handleSend(input)}
          >
            <Send className={cn("w-4 h-4", isRtl && "rotate-180")} />
          </Button>
        </div>
        <div className="max-w-3xl mx-auto mt-2 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Institutional Protocol v1.0 • Riyadh, Saudi Arabia
          </p>
        </div>
      </footer>
    </div>
  );
}
