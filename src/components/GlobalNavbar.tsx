"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative z-20 p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
};

const CustomLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black dark:text-white"
    >
      <span className="font-bold text-lg tracking-tight">Edith</span>
    </Link>
  );
};

export function GlobalNavbar() {
  const { isLoaded, isSignedIn } = useAuth();
  
  const navItems = [
    {
      name: "Get Problems",
      link: "/find-problems",
    },
    {
      name: "Problem Sets",
      link: "/problem-sets",
    },
    {
      name: "About",
      link: "/about",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Navbar className="top-4">
      {/* Desktop Navigation */}
      <NavBody className="bg-background/80 dark:bg-background/80 border border-border">
        <CustomLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoaded ? null : isSignedIn ? (
            <div className="ml-2 mt-1">
              <UserButton />
            </div>
          ) : (
            <>
              <SignInButton mode="modal">
                <NavbarButton variant="secondary">Login</NavbarButton>
              </SignInButton>
              <SignUpButton mode="modal">
                <NavbarButton variant="dark" className="bg-primary hover:bg-primary/90 text-primary-foreground border-none">Sign Up</NavbarButton>
              </SignUpButton>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav className="bg-background/80 dark:bg-background/80 border border-border">
        <MobileNavHeader>
          <CustomLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          className="bg-background dark:bg-background border border-border"
        >
          {navItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-foreground hover:text-primary transition-colors"
            >
              <span className="block text-lg font-medium">{item.name}</span>
            </Link>
          ))}
          <div className="flex w-full flex-col gap-4 mt-4">
            {!isLoaded ? null : isSignedIn ? (
              <div className="flex justify-center py-2">
                <UserButton />
              </div>
            ) : (
              <>
                <SignInButton mode="modal">
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="secondary"
                    className="w-full text-foreground border border-border"
                  >
                    Login
                  </NavbarButton>
                </SignInButton>
                <SignUpButton mode="modal">
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="dark"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-none"
                  >
                    Sign Up
                  </NavbarButton>
                </SignUpButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
