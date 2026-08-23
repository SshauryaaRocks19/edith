"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Button } from "@/components/ui/button";

interface ChatViewProps {
  onTransitionToManual: () => void;
  onIntentReceived: (intent: any, reader: ReadableStreamDefaultReader<Uint8Array>, initialText?: string) => void;
}

export function ChatView({ onTransitionToManual, onIntentReceived }: ChatViewProps) {
  const [loading, setLoading] = useState(false);

  const placeholders = [
    "I have a frontend loop at Meta tomorrow...",
    "System design interview at Stripe for Staff SWE...",
    "Practice dynamic programming questions for Google...",
    "I need a senior backend coding challenge for Uber...",
    "Help me prepare for Netflix UI engineering..."
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle change if needed
  };

  const submitRequest = async (requestText: string) => {
    if (!requestText || loading) return;

    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: requestText }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server error: ${text}`);
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const intentEndIndex = buffer.indexOf("__INTENT_END__\n");
        if (intentEndIndex !== -1) {
          const intentStartIndex = buffer.indexOf("__INTENT__");
          if (intentStartIndex !== -1) {
            const intentStr = buffer.substring(intentStartIndex + "__INTENT__".length, intentEndIndex);
            const intent = JSON.parse(intentStr);
            
            const remainingText = buffer.substring(intentEndIndex + "__INTENT_END__\n".length);
            onIntentReceived(intent, reader, remainingText);
            break;
          }
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.querySelector("input") as HTMLInputElement)?.value;
    submitRequest(input);
  };

  const trendingTopics = [
    "Amazon OA 2024",
    "Google L5 System Design",
    "Meta Front-End",
    "Stripe API Design"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4"
    >
      <div className="w-full max-w-3xl flex flex-col items-center gap-10">
        <h1 className="text-5xl md:text-6xl font-black font-heading text-center tracking-tight text-foreground drop-shadow-sm">
          Find new problems
        </h1>
        
        <div className="w-full relative">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={handleSubmit}
            disabled={loading}
          />
        </div>

        {!loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 mt-2"
          >
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Trending Topics</p>
            <div className="flex flex-wrap justify-center gap-3">
              {trendingTopics.map((topic, i) => (
                <button 
                  key={i}
                  onClick={() => submitRequest(topic)}
                  className="px-4 py-2 bg-card text-foreground font-bold text-sm border-2 border-border rounded-full shadow-[2px_2px_0_0_var(--color-border)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0_0_var(--color-border)] transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="h-16 w-full max-w-md mx-auto flex items-center justify-center mt-4">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center w-full gap-3"
            >
              <div className="w-full h-2 bg-muted overflow-hidden rounded-full border-2 border-border">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 4, ease: "easeOut" }}
                />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse font-bold">
                Synthesizing challenge from live signals...
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4"
            >
              <span className="text-muted-foreground text-sm font-medium">Or prefer specifying exactly what you need?</span>
              <Button variant="outline" onClick={onTransitionToManual} className="border-2 border-border shadow-sm font-bold">
                Manual Mode
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
