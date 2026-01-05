"use client";

import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 border border-border rounded-md hover:border-foreground/30"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
}