import "./globals.css";
import { Public_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";

const publicSans = Public_Sans({subsets:['latin'],variable:'--font-sans'});


import { GlobalNavbar } from "@/components/GlobalNavbar";

import { ThemeProvider } from "@/components/ThemeProvider";

import { Footer } from "@/components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={cn("font-sans flex flex-col min-h-screen", publicSans.variable)} suppressHydrationWarning>
        <body className="flex flex-col min-h-screen">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <GlobalNavbar />
            <div className="flex-1 flex flex-col w-full relative z-0">
              {children}
            </div>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
