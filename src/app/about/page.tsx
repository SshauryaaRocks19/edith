import { ThemedBackground } from "@/components/ThemedBackground";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full relative flex flex-col items-center overflow-x-hidden pb-32">
      {/* Theme-aware GradientWaves background */}
      <ThemedBackground />

      {/* Main Content Container */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-12 flex flex-col items-center gap-12">
        
        {/* Header */}
        <div className="max-w-4xl flex flex-col items-center text-center gap-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight font-heading text-foreground">
            About <span className="text-primary drop-shadow-sm">Edith</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mt-2">
            The next generation of dynamic interview preparation, powered by real-time data and AI synthesis.
          </p>
        </div>

        {/* Content Blocks */}
        <div className="w-full max-w-4xl flex flex-col gap-10 mt-8">
          
          {/* Section 1 */}
          <div className="bg-card border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] p-8 md:p-10 text-left">
            <h2 className="text-3xl font-black font-heading mb-6 text-foreground">
              The Broken Loop
            </h2>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed">
              Every prep platform out there works off the same model. Someone submits a question, it goes into a bank, thousands of people solve it, and it becomes common knowledge within a couple of weeks. Companies know this. So they change what they ask. Then candidates find out about the new questions, post them on Blind or Reddit, and the whole thing gets folded back into the bank. It's a loop that never actually ends, and it means the questions you're practicing are usually a step behind whatever the company has already moved on to.
              <br /><br />
              We got tired of watching people memorize solutions instead of learning how to solve problems, so we built Edith to skip the bank entirely.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-primary/10 border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] p-8 md:p-10 text-left">
            <h2 className="text-3xl font-black font-heading mb-6 text-foreground">
              Dynamic Generation
            </h2>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed">
              Here's the actual difference. When you tell Edith you've got a Staff interview at Stripe next week, it doesn't pull something from a shelf. It goes out and checks what people have actually been asked at Stripe recently, based on real interview reports posted right after the interview happened. 
              <br /><br />
              If three out of the last five reports mention graph traversal and rate limiting, that tells us something about what's currently being tested. We take that signal and generate a brand new question around it, one that didn't exist an hour ago and isn't sitting in anyone's memorized list.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-secondary/20 border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] p-8 md:p-10 text-left">
            <h2 className="text-3xl font-black font-heading mb-6 text-foreground">
              Raw Data and Scraper Studio
            </h2>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed">
              That's also why getting the raw data matters so much. Interview report threads live on sites that actively don't want to be scraped. Rate limits, CAPTCHAs, IP bans, the works. So we're not just writing prompts and hoping an AI knows what's trending. We're pulling from what people are saying right now, this week, about their actual interviews.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-accent/20 border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] p-8 md:p-10 text-left">
            <h2 className="text-3xl font-black font-heading mb-6 text-foreground">
              Who Edith Is For
            </h2>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed">
              We still keep a set of pre-scraped questions organized by company and role, for people who want to browse instead of generating something live. But the core of Edith isn't the bank. It's the fact that there doesn't have to be one.
              <br /><br />
              If you're prepping for a specific company and you're tired of solving problems that everyone else has already memorized, this is what Edith is for.
            </p>
          </div>

        </div>

        {/* Call to Action */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <Link href="/find-problems">
            <Button size="lg" className="h-16 px-10 text-xl border-4 border-border shadow-[4px_4px_0_0_var(--color-border)] font-black hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_var(--color-border)] transition-all">
              Try Edith Now
            </Button>
          </Link>
        </div>

      </div>
    </main>
  );
}
