"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t, mounted: i18nMounted } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [themeMounted, setThemeMounted] = useState(false);
  useEffect(() => {
    setThemeMounted(true);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = session
    ? [
        { href: "/dashboard", label: t("nav.dashboard") },
        { href: "/food", label: t("nav.food") },
        { href: "/program", label: t("nav.program") },
        { href: "/progress", label: t("nav.progress") },
        { href: "/profile", label: t("nav.profile") },
      ]
    : [
        { href: "/login", label: t("nav.login") },
        { href: "/register", label: t("nav.register") },
      ];

  const isDark = themeMounted ? theme === "dark" : false;

  const toggleTheme = () => {
    if (!themeMounted) return;
    setTheme(isDark ? "light" : "dark");
  };

  const toggleLanguage = () => {
    if (!i18nMounted) return;
    setLang(lang === "bg" ? "en" : "bg");
  };

  const languageToggleLabel = i18nMounted
    ? lang === "bg"
      ? t("nav.languageToEn")
      : t("nav.languageToBg")
    : t("nav.languageToBg");

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
              disabled={!themeMounted}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 border border-border rounded-md hover:border-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={
                themeMounted
                  ? isDark
                    ? t("nav.switchToLight")
                    : t("nav.switchToDark")
                  : t("nav.theme")
              }
            >
              {themeMounted
                ? isDark
                  ? t("nav.lightMode")
                  : t("nav.darkMode")
                : t("nav.theme")}
            </button>

            <button
              onClick={toggleLanguage}
              disabled={!i18nMounted}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 border border-border rounded-md hover:border-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={t("nav.languageLabel")}
            >
              {languageToggleLabel}
            </button>

            <Link
              href="/help"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 border border-border rounded-md hover:border-foreground/30"
            >
              {t("help.nav")}
            </Link>

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.logout")}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Theme Toggle for mobile (outside menu) */}
            <button
              onClick={toggleTheme}
              disabled={!themeMounted}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border rounded-md hover:border-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={
                themeMounted
                  ? isDark
                    ? t("nav.switchToLight")
                    : t("nav.switchToDark")
                  : t("nav.theme")
              }
            >
              {themeMounted
                ? isDark
                  ? t("nav.light")
                  : t("nav.dark")
                : t("nav.theme")}
            </button>

            <button
              onClick={toggleLanguage}
              disabled={!i18nMounted}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border rounded-md hover:border-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label={t("nav.languageLabel")}
            >
              {languageToggleLabel}
            </button>

            <Link
              href="/help"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border rounded-md hover:border-foreground/30"
            >
              {t("help.nav")}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors"
              aria-label={t("nav.toggleMenu")}
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="py-4 flex flex-col gap-3">
              <Link
                href="/help"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                {t("help.nav")}
              </Link>
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
                  {t("nav.logout")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

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
