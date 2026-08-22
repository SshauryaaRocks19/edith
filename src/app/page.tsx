"use client";

import { useState, useEffect, useRef } from "react";
import { IntentManifest, SynthesisChallenge } from "@/lib/types";

export default function Home() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Backend SWE");
  const [topics, setTopics] = useState("");
  
  const [intent, setIntent] = useState<IntentManifest | null>(null);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [backgroundSyncing, setBackgroundSyncing] = useState(false);
  const [error, setError] = useState("");
  
  // Ref to track the latest input values to avoid stale closures
  const inputRef = useRef({ company, role, topics });
  
  useEffect(() => {
    inputRef.current = { company, role, topics };
  }, [company, role, topics]);

  // Speculative Execution: Debounced automatic intent resolution
  useEffect(() => {
    // Only auto-resolve if we have a company typed out
    if (company.trim().length < 2) return;

    const timer = setTimeout(() => {
      // Secretly trigger the intent resolution in the background
      handleResolveIntent(true);
    }, 750); // 750ms debounce after typing stops

    return () => clearTimeout(timer);
  }, [company, role, topics]);

  const MOCK_RECORDS = [
    {
      source: "teamblind",
      url: "https://www.teamblind.com/post/mock1",
      company: company || "Google",
      role: role || "SWE",
      date_posted: new Date().toISOString(),
      title: "Interview Experience",
      body: "Asked about distributed systems, caching, and rate limiting.",
      comments: [],
      signals: {
        topics: topics ? topics.split(",").map(t => t.trim()) : ["distributed systems", "caching", "rate limiting"],
        difficulty: "hard",
        recency: "recent"
      },
      _needs_healing: false,
      _raw_html: null
    }
  ];

  const handleResolveIntent = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setBackgroundSyncing(true);
    
    setError("");
    // We intentionally do not clear the old intent/challenge if it's a background sync
    // so the UI doesn't jump around while typing.
    if (!isBackground) {
      setIntent(null);
      setChallenge(null);
    }
    
    const currentInputs = inputRef.current;
    const requestText = `I am preparing for a ${currentInputs.role} interview at ${currentInputs.company || "a tech company"}. Focus on: ${currentInputs.topics || "general technical topics"}.`;

    try {
      const res = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: requestText })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve intent");
      
      setIntent(data);
    } catch (err: any) {
      if (!isBackground) setError(err.message);
    } finally {
      if (!isBackground) setLoading(false);
      else setBackgroundSyncing(false);
    }
  };

  const handleSynthesize = async () => {
    setLoading(true);
    setError("");
    setChallenge(null);

    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: MOCK_RECORDS })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to synthesize challenge");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream available");
      
      const decoder = new TextDecoder("utf-8");
      let markdown = "";
      setChallenge(""); // initialize empty string to show stream starting

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        markdown += chunk;
        setChallenge(markdown);
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Edith Pipeline Tester</h1>
          <p className="text-neutral-400 mt-2">Throwaway UI to test the Intent and Synthesis APIs.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* LEFT: FORM */}
          <div className="col-span-1 space-y-6 bg-neutral-900 border border-neutral-800 p-6 rounded-xl h-fit">
            <h2 className="text-lg font-semibold text-white mb-4">Interview Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Company</label>
                <input 
                  type="text" 
                  list="companies"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, Google..."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <datalist id="companies">
                  <option value="Stripe" />
                  <option value="Google" />
                  <option value="Meta" />
                  <option value="Amazon" />
                  <option value="Netflix" />
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Role / Field</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Backend SWE">Backend SWE</option>
                  <option value="Frontend SWE">Frontend SWE</option>
                  <option value="Fullstack SWE">Fullstack SWE</option>
                  <option value="Data Structures & Algorithms">DSA (General)</option>
                  <option value="System Design">System Design (General)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Specific Topics (comma separated)</label>
                <textarea 
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g. Distributed locking, rate limiting, graphs"
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-6 mt-4 border-t border-neutral-800 flex flex-col gap-6">
                <div className="space-y-2">
                  <button 
                    onClick={() => handleResolveIntent(false)}
                    disabled={loading || !company}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-[0.98]"
                  >
                    {loading && !challenge ? "Processing Step 1..." : "Step 1: Extract Intent & Sources"}
                  </button>
                  
                  {backgroundSyncing && (
                    <p className="text-xs text-neutral-500 text-center animate-pulse">Syncing in background...</p>
                  )}
                  {intent && !loading && !backgroundSyncing && (
                    <p className="text-xs text-green-400 text-center font-medium">✓ Intent resolved! Ready to synthesize.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleSynthesize}
                    disabled={loading || !intent}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 active:scale-[0.98]"
                  >
                    {loading && challenge === null && intent ? "Generating Step 2..." : "Step 2: Synthesize Final Challenge"}
                  </button>
                  {!intent && (
                    <p className="text-xs text-neutral-500 text-center">Complete Step 1 first to unlock synthesis.</p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/30 border border-red-800 text-red-200 text-sm rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-8">
            
            {/* Step 1 Output */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
              <div className="border-b border-neutral-800 bg-neutral-950/80 px-6 py-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${intent ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>1</div>
                <h2 className={`font-semibold text-lg ${intent ? 'text-white' : 'text-neutral-500'}`}>Step 1 Output: Intent & Sources</h2>
              </div>
              <div className="p-6 bg-neutral-900/50">
                {intent ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                        <span className="block text-xs text-neutral-500 mb-1">Extracted Company</span>
                        <span className="font-medium text-white">{intent.company}</span>
                      </div>
                      <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                        <span className="block text-xs text-neutral-500 mb-1">Extracted Role</span>
                        <span className="font-medium text-white">{intent.role} ({intent.role_level})</span>
                      </div>
                      <div className="col-span-2 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                        <span className="block text-xs text-neutral-500 mb-1">Topics Identified</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {intent.topics.map(t => (
                            <span key={t} className="bg-neutral-800 text-neutral-300 px-2 py-1 rounded-md text-xs">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-white mb-3">Ranked Scraper Targets</h3>
                      <div className="space-y-3">
                        {intent.ranked_sources.map(src => (
                          <div key={src.source_id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/30 text-blue-400 text-xs font-bold">{src.rank}</span>
                              <span className="font-mono text-sm text-neutral-200">{src.source_id}</span>
                            </div>
                            <p className="text-sm text-neutral-400 leading-relaxed">{src.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-neutral-600">
                    Click "Step 1" on the left to resolve intent and rank scraper sources.
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 Output */}
            <div className={`bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl transition-opacity duration-300 ${!intent ? 'opacity-50' : 'opacity-100'}`}>
              <div className="border-b border-neutral-800 bg-neutral-950/80 px-6 py-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${challenge ? 'bg-purple-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>2</div>
                <h2 className={`font-semibold text-lg ${challenge ? 'text-white' : 'text-neutral-500'}`}>Step 2 Output: Final Challenge</h2>
              </div>
              <div className="p-6 bg-neutral-900/50">
                {challenge !== null ? (
                  <div className="bg-neutral-950 p-6 rounded-lg border border-neutral-800">
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap font-sans text-neutral-300 leading-relaxed">
                      {challenge}
                      {loading && <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-neutral-600">
                    {intent ? "Click 'Step 2' on the left to synthesize the final challenge from mock scraped data." : "Complete Step 1 first."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
