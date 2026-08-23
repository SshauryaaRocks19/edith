import { ThemedBackground } from "@/components/ThemedBackground";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import problemSets from "@/lib/problem_sets.json";
import { ArrowRight, Code2 } from "lucide-react";

export default function ProblemSetsPage() {
  const companies = Object.keys(problemSets);

  return (
    <main className="min-h-screen w-full relative flex flex-col items-center overflow-x-hidden pb-32">
      {/* Theme-aware GradientWaves background */}
      <ThemedBackground />

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-12 flex flex-col items-center gap-12">
        
        {/* Header */}
        <div className="max-w-4xl flex flex-col items-center text-center gap-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight font-heading text-foreground">
            Prebuilt <span className="text-primary drop-shadow-sm">Sets</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mt-2">
            Top curated interview questions for leading tech companies, scraped from real-world recent interviews.
          </p>
        </div>

        {/* Problem Sets Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {companies.map((company, idx) => {
            const problems = (problemSets as any)[company];
            // Cycle through our neo-brutalist accent colors
            const bgColors = ["bg-card", "bg-primary/10", "bg-secondary/20", "bg-accent/20"];
            const bgColor = bgColors[idx % bgColors.length];
            
            return (
              <div 
                key={company}
                className={`${bgColor} border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] p-8 flex flex-col h-full`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-4xl font-black font-heading text-foreground">{company}</h2>
                  <div className="bg-background border-2 border-border rounded-full p-3 shadow-sm">
                    <Code2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <p className="text-lg text-foreground/80 font-medium mb-6">
                  {problems.length} recent interview problems tailored to {company}'s current hiring loop.
                </p>

                <div className="mt-auto">
                  <Link href={`/find-problems?company=${company}&mode=static`}>
                    <Button size="lg" className="w-full h-14 text-lg border-2 border-border shadow-[4px_4px_0_0_var(--color-border)] font-bold hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_var(--color-border)] transition-all">
                      Start Practicing <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}
