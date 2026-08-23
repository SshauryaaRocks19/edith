import Link from "next/link";
import { Code2, X, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t-4 border-border bg-card py-12 mt-auto relative z-10">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="font-heading font-black text-3xl tracking-tighter hover:text-primary transition-colors">
            EDITH.
          </Link>
          <p className="text-muted-foreground font-medium text-sm text-center md:text-left max-w-xs">
            Dynamic technical interview preparation powered by Bright Data and Gemini.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          <Link href="/" className="font-bold text-foreground hover:text-primary hover:underline underline-offset-4 transition-all">
            Home
          </Link>
          <Link href="/find-problems" className="font-bold text-foreground hover:text-primary hover:underline underline-offset-4 transition-all">
            Find Problems
          </Link>
          <Link href="#" className="font-bold text-foreground hover:text-primary hover:underline underline-offset-4 transition-all">
            Problem Sets
          </Link>
          <Link href="#" className="font-bold text-foreground hover:text-primary hover:underline underline-offset-4 transition-all">
            About
          </Link>
        </div>

        {/* Socials & Copyright */}
        <div className="flex flex-col items-center md:items-end gap-4">
          <div className="flex gap-4">
            <Link href="https://github.com/SshauryaaRocks19/edith" target="_blank" className="p-2 bg-muted rounded-md border-2 border-border shadow-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
              <Code2 size={20} />
            </Link>
            <Link href="#" className="p-2 bg-muted rounded-md border-2 border-border shadow-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
              <X size={20} />
            </Link>
            <Link href="#" className="p-2 bg-muted rounded-md border-2 border-border shadow-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
              <ExternalLink size={20} />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} Project Edith. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
