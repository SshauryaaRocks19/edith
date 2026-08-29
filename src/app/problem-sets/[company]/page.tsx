import { ThemedBackground } from "@/components/ThemedBackground";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import problemSets from "@/lib/problem_sets.json";
import { ArrowLeft, Play, CheckCircle2, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase";

export default async function CompanyProblemsPage({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  const problems = (problemSets as any)[company];

  if (!problems) {
    return notFound();
  }

  const { userId } = await auth();
  const solvedStatus: Record<number, boolean> = {};

  if (userId) {
    const { data } = await supabaseServer
      .from("user_progress")
      .select("problem_index, status")
      .eq("user_id", userId)
      .eq("company", company)
      .eq("status", "solved");
      
    if (data) {
      data.forEach((row) => {
        solvedStatus[row.problem_index] = true;
      });
    }
  }

  return (
    <main className="min-h-screen w-full relative flex flex-col items-center overflow-x-hidden pb-32">
      <ThemedBackground />

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-12 flex flex-col items-center gap-8">
        
        <div className="w-full max-w-4xl flex items-center justify-between">
          <Link href="/problem-sets">
            <Button variant="outline" className="border-2 border-border shadow-[2px_2px_0_0_var(--color-border)] font-bold">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Sets
            </Button>
          </Link>
          <h1 className="text-4xl font-black font-heading text-foreground">
            {company} <span className="text-primary">Loop</span>
          </h1>
        </div>

        <div className="w-full max-w-4xl flex flex-col gap-4 mt-4">
          {problems.map((problem: any, index: number) => {
            const isSolved = solvedStatus[index];
            
            return (
              <div 
                key={index}
                className={`w-full bg-card border-2 border-border rounded-xl shadow-[4px_4px_0_0_var(--color-border)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-border)] ${isSolved ? 'opacity-80' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {isSolved ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-foreground">{problem.title}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge 
                        variant="secondary"
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          problem.difficulty.toLowerCase() === 'hard' ? 'bg-red-500/10 text-red-500' : 
                          problem.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {problem.difficulty}
                      </Badge>
                      {problem.topics.slice(0, 3).map((topic: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs px-2.5 py-0.5 rounded-full text-muted-foreground border-border">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 mt-4 md:mt-0">
                  <Link href={`/find-problems?company=${company}&mode=static&problemIndex=${index}`}>
                    <Button variant={isSolved ? "secondary" : "default"} className={`w-full md:w-auto border-2 ${isSolved ? 'border-border' : 'border-transparent'} shadow-[2px_2px_0_0_rgba(0,0,0,0.1)] font-bold`}>
                      {isSolved ? 'Review' : 'Solve'} <Play className="ml-2 w-4 h-4 fill-current" />
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
