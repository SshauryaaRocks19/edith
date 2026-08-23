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
              Dynamic Generation, Not Static Banks
            </h2>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed">
              Edith generates original interview questions on demand, based on what a specific company is actually asking right now, instead of pulling from a static bank. You tell it the company and role, it pulls recent interview reports from forums where engineers post about their loops, figures out the pattern (say, three of the last five Amazon interviews leaned on graph problems), and writes a new question around that pattern. You get a full IDE next to it to actually solve it and test your real knowledge.
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-primary/10 border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] p-8 md:p-10 text-left">
            <h2 className="text-3xl font-black font-heading mb-6 text-foreground">
              Breaking the Memorization Loop
            </h2>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed">
              Every prep platform right now runs on the same old broken loop: platform adds question, candidates memorize it, company drops it and asks something new, platform scrambles to catch up. Candidates end up pattern-matching instead of actually solving anything, and the questions are always a few months behind what companies have moved on to. 
              <br /><br />
              Edith skips the memorization step entirely by not having a fixed bank in the first place, there's nothing to leak because every question is generated at the moment you ask for it. It's built for people prepping for a specific company loop in the next week or two, or someone with a dream company in mind are leveling up with how the trend in questions has changes for that company.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-secondary/20 border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] p-8 md:p-10 text-left">
            <h2 className="text-3xl font-black font-heading mb-6 text-foreground">
              Powered by Scraper Studio
            </h2>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed">
              Scraper Studio is what actually gets us the raw material - the interview reports people post on places like Blind, 1point3acres, and Reddit right after their interviews. These sites don't want to be scraped and throw up rate limits, CAPTCHAs, IP bans, all of it. Scraper Studio handles that side so our requests come through real residential IPs instead of getting flagged as a bot. 
              <br /><br />
              Once we've got the raw posts, we run them through our own layer to pull out the actual signal (what topics keep coming up, what difficulty, what format) before handing that off to the model that writes the new question.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-accent/20 border-4 border-border rounded-xl shadow-[8px_8px_0_0_var(--color-border)] p-8 md:p-10 text-left">
            <h2 className="text-3xl font-black font-heading mb-6 text-foreground">
              Accessing the Unreachable
            </h2>
            <p className="text-lg text-foreground/80 font-medium leading-relaxed">
              We're scraping recent interview experience posts, the threads where someone writes up exactly what they got asked at a specific company, usually within days of the interview. Without Scraper Studio, that data is out of our reach, these forums actively block automated access, so a normal scraper gets banned within a few requests. 
              <br /><br />
              Scraper Studio sits right after our intent layer figures out what to look for (company, role, sometimes round) and does the actual fetching, it's the piece that makes it possible to get fresh data instead of relying on something scraped once and left to go stale, which isnt helpful to our clients as the trends in question levels keep changing.
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
