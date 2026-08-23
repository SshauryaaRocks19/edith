import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemedBackground } from "@/components/ThemedBackground";
import BounceCards from "@/components/BounceCards";
import { Bot, Database, Zap, Play, Send } from "lucide-react";

export default function Home() {
  const features = [
    (
      <div key="feature-1" className="flex flex-col items-center text-center gap-4 h-full">
        <div className="p-4 bg-primary/10 text-primary rounded-lg border-2 border-border shadow-sm">
          <Database size={40} />
        </div>
        <h3 className="font-bold text-xl font-heading mt-2">Real-Time Context</h3>
        <p className="text-muted-foreground font-medium">
          Powered by Bright Data to fetch real-world technical interview questions directly from active forums.
        </p>
      </div>
    ),
    (
      <div key="feature-2" className="flex flex-col items-center text-center gap-4 h-full">
        <div className="p-4 bg-secondary/40 text-foreground rounded-lg border-2 border-border shadow-sm">
          <Bot size={40} />
        </div>
        <h3 className="font-bold text-xl font-heading mt-2">AI Synthesis</h3>
        <p className="text-muted-foreground font-medium">
          Gemini automatically transforms unstructured discussion threads into pristine, runnable LeetCode-style problems.
        </p>
      </div>
    ),
    (
      <div key="feature-3" className="flex flex-col items-center text-center gap-4 h-full">
        <div className="p-4 bg-accent/20 text-accent-foreground rounded-lg border-2 border-border shadow-sm">
          <Zap size={40} />
        </div>
        <h3 className="font-bold text-xl font-heading mt-2">Zero Memorization</h3>
        <p className="text-muted-foreground font-medium">
          Stop grinding obsolete problem lists. Solve exactly what companies are asking today.
        </p>
      </div>
    )
  ];

  return (
    <main className="min-h-screen w-full relative flex flex-col items-center overflow-x-hidden pb-32">
      {/* Theme-aware GradientWaves background */}
      <ThemedBackground />

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-12 flex flex-col items-center text-center gap-12">
        <div className="max-w-4xl flex flex-col items-center gap-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight font-heading">
            <span className="block mb-2 text-foreground">Edith,</span>
            <span className="block text-primary drop-shadow-sm">Get hired:</span>
            <span className="block text-foreground">without memorizing</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium mt-4">
            The next-generation dynamic interview preparation platform.
          </p>
          
          <div className="flex items-center gap-4 mt-8">
            <Link href="/find-problems">
              <Button size="lg" className="h-14 px-8 text-lg border-2 border-border shadow-sm font-bold">
                Start Preparing
              </Button>
            </Link>
            <Link href="https://github.com/SshauryaaRocks19/edith" target="_blank">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2 border-border shadow-sm font-bold">
                View Source
              </Button>
            </Link>
          </div>
        </div>

        {/* Features / Bounce Cards Section */}
        <div className="mt-28 w-full max-w-5xl mx-auto flex flex-col items-center mb-16">
          <BounceCards 
            items={features}
            containerWidth={1000}
            containerHeight={450}
            animationDelay={0.2}
            transformStyles={[
              'rotate(-5deg) translate(-300px)',
              'rotate(0deg)',
              'rotate(5deg) translate(300px)'
            ]}
          />
        </div>
      </div>

      {/* IDE Mockup Section */}
      <div className="w-full max-w-6xl mx-auto px-4 relative z-10 flex flex-col items-center mt-8">
        <h2 className="text-4xl md:text-5xl font-black font-heading mb-12 text-center text-foreground">
          Experience the IDE
        </h2>
        
        <div className="w-full bg-background border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] flex flex-col overflow-hidden">
          {/* IDE Header */}
          <div className="h-14 border-b-4 border-border flex items-center px-4 gap-4 bg-muted">
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-border bg-red-400"></div>
              <div className="w-4 h-4 rounded-full border-2 border-border bg-amber-400"></div>
              <div className="w-4 h-4 rounded-full border-2 border-border bg-emerald-400"></div>
            </div>
            <div className="font-mono text-sm font-bold bg-background px-4 py-1.5 rounded-md border-2 border-border shadow-sm flex-1 max-w-[200px] text-center">
              edith-workspace
            </div>
          </div>
          
          {/* IDE Body */}
          <div className="flex flex-col md:flex-row h-[550px]">
            {/* Left Pane (Problem) */}
            <div className="w-full md:w-1/2 border-b-4 md:border-b-0 md:border-r-4 border-border p-8 overflow-y-auto bg-card text-left">
              <h3 className="text-3xl font-black font-heading mb-4 text-primary">1. Reverse Linked List</h3>
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-xs rounded-full border-2 border-green-700/20">Easy</span>
                <span className="px-3 py-1 bg-muted font-bold text-xs rounded-full border-2 border-border text-foreground">Linked List</span>
              </div>
              <p className="text-foreground text-lg mb-6 font-medium leading-relaxed">
                Given the <code className="bg-muted px-1.5 py-0.5 rounded border border-border">head</code> of a singly linked list, reverse the list, and return the reversed list.
              </p>
              <div className="bg-muted p-5 rounded-xl border-2 border-border shadow-sm mb-6">
                <p className="font-mono text-sm text-foreground"><strong>Input:</strong> head = [1,2,3,4,5]</p>
                <p className="font-mono text-sm text-foreground mt-2"><strong>Output:</strong> [5,4,3,2,1]</p>
              </div>
            </div>
            
            {/* Right Pane (Code) */}
            <div className="w-full md:w-1/2 bg-zinc-950 p-6 font-mono text-sm text-blue-400 overflow-y-auto relative text-left">
              <pre className="text-sm md:text-base leading-relaxed"><code>
<span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span> {'{\n'}
  <span className="text-blue-400">reverseList</span>(head: ListNode | null): ListNode | null {'{\n'}
    <span className="text-purple-400">let</span> prev = <span className="text-orange-400">null</span>;
    <span className="text-purple-400">let</span> curr = head;
    
    <span className="text-purple-400">while</span> (curr !== <span className="text-orange-400">null</span>) {'{\n'}
      <span className="text-purple-400">const</span> nextTemp = curr.next;
      curr.next = prev;
      prev = curr;
      curr = nextTemp;
    {'}\n'}
    
    <span className="text-purple-400">return</span> prev;
  {'}\n'}
{'}'}
              </code></pre>
              
              {/* Run / Submit buttons */}
              <div className="absolute bottom-6 right-6 flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground font-bold border-2 border-border shadow-[4px_4px_0_0_var(--color-border)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_var(--color-border)] transition-all">
                  <Play size={16} /> Run Code
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold border-2 border-emerald-800 shadow-[4px_4px_0_0_#065f46] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_#065f46] transition-all">
                  <Send size={16} /> Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
