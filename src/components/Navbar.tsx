"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Затваряме мобилното меню при смяна на страница
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = session
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/food", label: "Food" },       

        { href: "/program", label: "Program" },
        { href: "/profile", label: "Profile" },
      ]
    : [
        { href: "/login", label: "Login" },
        { href: "/register", label: "Register" },
      ];

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-(--background)">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight hover:text-accent transition-colors"
            onClick={closeMobileMenu}
          >
            NutriFit
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Separator */}
            <div className="h-4 w-px bg-border" />

            {/* Theme Toggle Button - Desktop */}
            <button
              onClick={toggleTheme}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 border border-border rounded-md hover:border-foreground/30"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            {/* Theme Toggle for mobile (outside menu) */}
            <button
              onClick={toggleTheme}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 border border-border rounded-md hover:border-foreground/30"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  } rounded-md`}
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              {session && (
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/login" });
                    closeMobileMenu();
                  }}
                  className="px-4 py-2 text-left text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// SVG иконка за мобилното меню
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}