"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Play, Send, Code, Terminal, Settings, Maximize, RotateCcw, 
  CheckCircle2, FileText, BookOpen, FlaskConical, CheckCheck, 
  Star, Share2, Tag, ChevronDown, PlusCircle
} from "lucide-react";

interface LeetCodeViewProps {
  intent: any;
  streamReader: ReadableStreamDefaultReader<Uint8Array> | null;
  initialMarkdown?: string;
  problemIndex?: number;
  isStaticMode?: boolean;
}

export function LeetCodeView({ intent, streamReader, initialMarkdown = "", problemIndex = -1, isStaticMode = false }: LeetCodeViewProps) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [starterCodes, setStarterCodes] = useState<Record<string, string>>({});
  const [executionResults, setExecutionResults] = useState<any[] | null>(null);
  const [executing, setExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState("Description");
  const markdownRef = useRef<HTMLDivElement>(null);

  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(4);
  
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const readStream = async () => {
      if (!streamReader) return;
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { value, done } = await streamReader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMarkdown((prev) => prev + chunk);
        }
      } catch (err) {
        console.error("Stream reading error:", err);
      }
    };
    readStream();
  }, [streamReader]);

  // Extract starter code
  useEffect(() => {
    const starterMatch = markdown.match(/##\s+Starter Code([\s\S]*)$/i);
    if (starterMatch) {
      const section = starterMatch[1];
      const blocks = section.match(/```(python|cpp|java|javascript)\n([\s\S]*?)\n```/g);
      if (blocks) {
        const codes: Record<string, string> = {};
        blocks.forEach(block => {
          const match = block.match(/```(python|cpp|java|javascript)\n([\s\S]*?)\n```/);
          if (match && match[1] && match[2]) {
            codes[match[1]] = match[2];
          }
        });
        setStarterCodes(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(codes)) return codes;
          return prev;
        });
      }
    }
  }, [markdown]);

  // Sync IDE code when language changes or starter code becomes available
  useEffect(() => {
    const currentStarter = starterCodes[language];
    if (currentStarter) {
      if (!code) {
        setCode(currentStarter);
      } else {
        // If code is one of the other starters, switch it (meaning they haven't modified it)
        const isOtherStarter = Object.values(starterCodes).includes(code);
        if (isOtherStarter && code !== currentStarter) {
          setCode(currentStarter);
        }
      }
    }
  }, [language, starterCodes, code]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
  };

  const extractTestCases = (md: string) => {
    const testCases: any[] = [];
    const testCaseSection = md.match(/##\s+Test Cases([\s\S]*?)(?=##\s+Starter Code|$)/i)?.[1];
    
    if (testCaseSection) {
      const blocks = testCaseSection.match(/```([\s\S]*?)```/g);
      if (blocks) {
        // Check if blocks follow the single-block format (Input: ... \n Expected Output: ...)
        const hasInputTextInside = blocks.some(b => b.toLowerCase().includes("input:") || b.toLowerCase().includes("expected output:"));
        
        if (hasInputTextInside) {
          blocks.forEach(block => {
            const content = block.replace(/```/g, "").trim();
            const lines = content.split("\n");
            let input = "";
            let output = "";
            let currentField = "";
            
            lines.forEach(line => {
              if (line.toLowerCase().startsWith("input:")) {
                currentField = "input";
                input += line.replace(/input:/i, "").trim() + "\n";
              } else if (line.toLowerCase().startsWith("expected output:") || line.toLowerCase().startsWith("output:")) {
                currentField = "output";
                output += line.replace(/expected output:|output:/i, "").trim() + "\n";
              } else {
                if (currentField === "input") input += line + "\n";
                if (currentField === "output") output += line + "\n";
              }
            });
            
            if (input || output) {
              testCases.push({ input: input.trim(), expected_output: output.trim() });
            }
          });
        } else {
          // Fallback: Gemini frequently ignores prompt format and generates alternating input/output blocks
          for (let i = 0; i < blocks.length; i += 2) {
            if (i + 1 < blocks.length) {
              const input = blocks[i].replace(/```(python|cpp|java|javascript)?/gi, "").trim();
              const output = blocks[i+1].replace(/```(python|cpp|java|javascript)?/gi, "").trim();
              testCases.push({ input, expected_output: output });
            }
          }
        }
      }
    }
    return testCases;
  };

  const handleRunCode = async () => {
    setExecuting(true);
    setExecutionResults(null);
    try {
      const testCases = extractTestCases(markdown);
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, test_cases: testCases }), // Fixed payload key
      });
      const results = await response.json();
      const runResults = results.results || results;
      setExecutionResults(runResults);

      if (isStaticMode && problemIndex >= 0 && intent?.company) {
        // Check if all tests passed
        const allPassed = Array.isArray(runResults) && runResults.length > 0 && runResults.every((r: any) => r.passed);
        if (allPassed) {
          try {
            await fetch("/api/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ company: intent.company, problemIndex, status: "solved" })
            });
          } catch (e) {
            console.error("Failed to save progress", e);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  const handleResetCode = () => {
    if (starterCodes[language]) {
      setCode(starterCodes[language]);
    }
  };

  let displayMarkdown = markdown;
  
  // Extract Metadata using strictly anchored regex so it doesn't steal subheadings
  const titleMatch = displayMarkdown.match(/^\s*#\s+([^\n]+)/);
  const parsedTitle = titleMatch ? titleMatch[1].trim() : (displayMarkdown.length > 50 ? "Interview Challenge" : "");
  if (titleMatch) displayMarkdown = displayMarkdown.replace(titleMatch[0], "");

  // If Gemini skipped the Problem Statement heading, automatically inject it for UI consistency
  if (parsedTitle && displayMarkdown.length > 10 && !displayMarkdown.match(/##\s+Problem Statement/i)) {
    displayMarkdown = "## Problem Statement\n\n" + displayMarkdown.trim();
  }

  const diffMatch = displayMarkdown.match(/\*\*Difficulty:\*\*\s*(.+)(?:\r?\n|$)/m);
  const parsedDiff = diffMatch ? diffMatch[1].trim() : "";
  if (diffMatch) displayMarkdown = displayMarkdown.replace(diffMatch[0], "");

  const topicsMatch = displayMarkdown.match(/\*\*Topics:\*\*\s*(.+)(?:\r?\n|$)/m);
  const parsedTopics = topicsMatch ? topicsMatch[1].split(",").map(s => s.trim()) : [];
  if (topicsMatch) displayMarkdown = displayMarkdown.replace(topicsMatch[0], "");

  // Strip Test Cases and Starter Code sections from display
  displayMarkdown = displayMarkdown.replace(/##\s+Test Cases[\s\S]*?(?=##\s+Starter Code|$)/i, "");
  displayMarkdown = displayMarkdown.replace(/##\s+Starter Code[\s\S]*$/i, "");

  const TabButton = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-colors ${
        activeTab === id 
          ? "bg-card text-foreground rounded-t-lg border-t border-x border-border shadow-sm translate-y-[1px]" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className={`w-4 h-4 ${activeTab === id ? 'text-primary' : 'opacity-70'}`} />
      {label}
    </button>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex h-screen w-full bg-background p-2 gap-2 overflow-hidden font-sans"
    >
      {/* Left Pane - Problem Description */}
      <div className="w-1/2 h-full flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Top Tab Bar */}
        <div className="flex bg-muted/30 border-b border-border h-11 items-end px-2 shrink-0 pt-2">
          <TabButton id="Description" icon={FileText} label="Description" />
          <TabButton id="Editorial" icon={BookOpen} label="Editorial" />
          <TabButton id="Solutions" icon={FlaskConical} label="Solutions" />
          <TabButton id="Submissions" icon={CheckCheck} label="Submissions" />
        </div>

        {/* Content Area */}
        <div ref={markdownRef} className="flex-1 overflow-y-auto relative">
          {activeTab === "Description" ? (
            <div className="p-6 pb-12">
              {parsedTitle ? (
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground mb-4">
                    {parsedTitle}
                  </h1>
                  <div className="flex flex-wrap gap-3 mb-6 items-center">
                    {parsedDiff && (
                      <Badge 
                        variant="secondary"
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          parsedDiff.toLowerCase() === 'hard' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 
                          parsedDiff.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 
                          'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                        }`}
                      >
                        {parsedDiff}
                      </Badge>
                    )}
                    {parsedTopics.length > 0 && parsedTopics.map((topic, i) => (
                      <Badge key={i} variant="outline" className="text-xs px-2.5 py-0.5 rounded-full text-muted-foreground border-border">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-pulse h-8 bg-muted rounded w-1/2 mb-8"></div>
              )}

              {/* Enhanced Markdown Rendering */}
              <div className="prose prose-invert max-w-none text-[15px]">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4 text-foreground" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-8 mb-4 text-foreground" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground/90" {...props} />,
                    p: ({node, ...props}) => <p className="leading-relaxed text-muted-foreground mb-5" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 space-y-2 my-5 text-muted-foreground" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 space-y-2 my-5 text-muted-foreground" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                    pre: ({node, ...props}) => (
                      <pre className="bg-muted/30 p-4 rounded-lg border border-border/50 overflow-x-auto text-[13px] font-mono text-zinc-300 my-5" {...props} />
                    ),
                    code: ({node, inline, className, children, ...props}: any) => {
                      return !inline ? (
                        <code className={className} {...props}>{children}</code>
                      ) : (
                        <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono text-[13px] border border-border/50" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {displayMarkdown}
                </ReactMarkdown>
              </div>

              {isStaticMode && problemIndex >= 0 && (
                <div className="mt-12 flex items-center justify-between pt-6 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="border-2 border-border shadow-[2px_2px_0_0_var(--color-border)]"
                    disabled={problemIndex <= 0}
                    onClick={() => {
                      if (typeof window !== 'undefined' && intent?.company) {
                        window.location.href = `/find-problems?company=${intent.company}&mode=static&problemIndex=${problemIndex - 1}`;
                      }
                    }}
                  >
                    Previous Problem
                  </Button>
                  <Button
                    className="border-2 border-border shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] font-bold"
                    onClick={() => {
                      if (typeof window !== 'undefined' && intent?.company) {
                        window.location.href = `/find-problems?company=${intent.company}&mode=static&problemIndex=${problemIndex + 1}`;
                      }
                    }}
                  >
                    Next Problem
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <FlaskConical className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">Coming soon...</p>
            </div>
          )}
        </div>

        {/* Left Pane Footer */}
        <div className="h-12 border-t border-border bg-card flex items-center justify-between px-4 shrink-0">
          <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Tag className="w-4 h-4" />
            Topics
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <button className="hover:text-amber-500 transition-colors flex items-center gap-1.5">
              <Star className="w-4 h-4" /> <span className="text-xs font-medium">Star</span>
            </button>
            <button className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" /> <span className="text-xs font-medium">Add to List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Pane - IDE */}
      <div className="w-1/2 h-full flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex h-10 border-b border-border items-center px-4 bg-muted/10 shrink-0 gap-2">
          <Code className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-foreground">Code</span>
        </div>
        
        {/* Language Bar */}
        <div className="flex h-10 border-b border-border items-center justify-between px-2 bg-muted/5 shrink-0">
          <Select value={language} onValueChange={(val) => setLanguage(val || "python")}>
            <SelectTrigger className="w-[120px] h-7 border-none bg-transparent shadow-none hover:bg-muted/50 focus:ring-0 text-xs font-medium">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python 3</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 text-muted-foreground pr-2">
            <button onClick={handleResetCode} className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Reset Code">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <Popover>
              <PopoverTrigger className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Editor Settings">
                <Settings className="w-3.5 h-3.5" />
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm border-b pb-2">Editor Settings</h4>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Font Size</Label>
                      <span className="text-xs text-muted-foreground">{fontSize}px</span>
                    </div>
                    <Slider 
                      value={[fontSize]} 
                      min={10} 
                      max={24} 
                      step={1} 
                      onValueChange={(val) => setFontSize(Array.isArray(val) ? val[0] : (val as number))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Tab Size</Label>
                      <span className="text-xs text-muted-foreground">{tabSize} spaces</span>
                    </div>
                    <Slider 
                      value={[tabSize]} 
                      min={2} 
                      max={8} 
                      step={2} 
                      onValueChange={(val) => setTabSize(Array.isArray(val) ? val[0] : (val as number))}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <button className="p-1.5 hover:bg-muted rounded-md transition-colors" title="Fullscreen">
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        
        {/* Editor */}
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: fontSize,
              tabSize: tabSize,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              fontFamily: 'var(--font-mono), monospace',
              lineHeight: 1.6,
            }}
          />
        </div>

        {/* Execution Results Terminal */}
        <div className="h-[240px] border-t border-border flex flex-col bg-card shrink-0">
          <div className="flex h-10 bg-muted/10 border-b border-border items-center justify-between px-2 shrink-0">
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-md text-[13px] font-medium text-foreground shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Testcase
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-muted/50 rounded-md text-[13px] font-medium text-muted-foreground transition-colors">
                <Terminal className="w-4 h-4" /> Test Result
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 bg-muted/5">
            {executionResults ? (
              <div className="space-y-4">
                {executionResults.map((result, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-semibold text-sm text-foreground">Case {i + 1}</span>
                      {result.passed ? (
                        <span className="text-emerald-500 text-xs font-semibold">Accepted</span>
                      ) : (
                        <span className="text-red-500 text-xs font-semibold">Wrong Answer</span>
                      )}
                    </div>
                    {!result.passed && (
                      <div className="space-y-3 font-mono text-[13px]">
                        <div>
                          <span className="text-muted-foreground block mb-1">Input</span> 
                          <div className="bg-muted/50 p-2 rounded border border-border/50 text-foreground">{result.input}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Output</span> 
                          <div className="bg-muted/50 p-2 rounded border border-border/50 text-foreground">{result.actual_output}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground block mb-1">Expected</span> 
                          <div className="bg-muted/50 p-2 rounded border border-border/50 text-foreground">{result.expected_output}</div>
                        </div>
                        {result.stderr && (
                          <div className="text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20 whitespace-pre-wrap">
                            {result.stderr}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm font-medium">
                Run your code to see test results here.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane Footer (Run/Submit) */}
        <div className="h-14 border-t border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            Saved to local <CheckCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={handleRunCode} 
              disabled={executing || !code}
              className="h-8 px-4 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border shadow-sm"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" /> 
              {executing ? "Running..." : "Run"}
            </Button>
            <Button 
              className="h-8 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" /> 
              Submit
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
