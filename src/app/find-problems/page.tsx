"use client";

import ShapeGrid from "@/components/ShapeGrid";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { ChatView } from "@/components/find-problems/ChatView";
import { ManualView } from "@/components/find-problems/ManualView";
import { LeetCodeView } from "@/components/find-problems/LeetCodeView";

type ViewState = "chat" | "manual" | "leetcode";

export default function FindProblemsPage() {
  const [view, setView] = useState<ViewState>("chat");
  const [intent, setIntent] = useState<any>(null);
  const [streamReader, setStreamReader] = useState<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const [initialText, setInitialText] = useState("");

  const handleIntentReceived = (receivedIntent: any, reader: ReadableStreamDefaultReader<Uint8Array> | null, parsedInitialText: string = "") => {
    setIntent(receivedIntent);
    setStreamReader(reader);
    setInitialText(parsedInitialText);
    setView("leetcode");
  };

  useEffect(() => {
    // Check if we arrived here via a static problem set link
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const mode = searchParams.get("mode");
      const company = searchParams.get("company");
      const problemIndex = searchParams.get("problemIndex");
      
      if (mode === "static" && company) {
        import("@/lib/problem_sets.json").then((module) => {
          const problemSets = module.default as Record<string, any[]>;
          const problems = problemSets[company];
          if (problems && problems.length > 0) {
            // Pick the requested problem or default to a random one
            const parsedIndex = problemIndex ? parseInt(problemIndex) : -1;
            const isValidIndex = !isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < problems.length;
            const targetProblem = isValidIndex ? problems[parsedIndex] : problems[Math.floor(Math.random() * problems.length)];
            
            const syntheticIntent = {
              company,
              role: "Software Engineer",
              level: "Mid",
              focus: targetProblem.topics.join(", "),
              source: `Static Problem Set (${company})`,
              title: targetProblem.title,
              difficulty: targetProblem.difficulty,
            };

            // Instead of streaming, we just pass the full markdown text and a null reader
            handleIntentReceived(syntheticIntent, null, targetProblem.content);
          }
        });
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-transparent relative overflow-hidden flex flex-col z-0">
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-[0.18] dark:opacity-[0.12]">
        <ShapeGrid 
          shape="circle" 
          borderColor="#94a3b8"
          squareSize={40}
        />
      </div>
      <AnimatePresence mode="wait">
        {view === "chat" && (
          <ChatView 
            key="chat"
            onTransitionToManual={() => setView("manual")} 
            onIntentReceived={handleIntentReceived}
          />
        )}
        
        {view === "manual" && (
          <ManualView 
            key="manual"
            onBack={() => setView("chat")} 
            onIntentReceived={handleIntentReceived}
          />
        )}

        {view === "leetcode" && intent && (
          <LeetCodeView 
            key="leetcode"
            intent={intent} 
            streamReader={streamReader} 
            initialMarkdown={initialText}
            problemIndex={typeof window !== "undefined" ? parseInt(new URLSearchParams(window.location.search).get("problemIndex") || "-1") : -1}
            isStaticMode={typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "static"}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
