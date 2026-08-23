"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import GradientWaves from "@/components/GradientWaves";

export function ThemedBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  const colors = isDark
    ? { horizon: "#1e1b4b", wave: "#312e81", crest: "#818cf8", opacity: 0.9 }
    : { horizon: "#1e40af", wave: "#2563eb", crest: "#93c5fd", opacity: 1.0 };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <GradientWaves
        horizonColor={colors.horizon}
        waveColor={colors.wave}
        crestColor={colors.crest}
        opacity={colors.opacity}
      />
    </div>
  );
}
