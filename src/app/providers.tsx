"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange={false}
        storageKey="nutrifit-theme"
      >
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
