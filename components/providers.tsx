"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toast } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toast />
    </ThemeProvider>
  );
}