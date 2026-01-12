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
  const [scrolled, setScrolled] = useState(false);

  const [themeMounted, setThemeMounted] = useState(false);
  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <>
      {/* Premium Navbar with glass effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "glass-effect border-b border-white/10 shadow-lg" 
          : "bg-transparent"
      }`}>
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            {/* Premium Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              onClick={closeMobileMenu}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">NF</span>
              </div>
              <span className="text-lg font-semibold tracking-tight group-hover:text-accent transition-colors">
                NutriFit
              </span>
            </Link>

            {/* Desktop Navigation - Premium style */}
            <div className="hidden md:flex items-center gap-4">
              {/* Main navigation links with subtle indicators */}
              <div className="flex items-center gap-1 px-4 py-2 bg-surface/50 backdrop-blur-sm rounded-2xl border border-white/5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-1.5 text-sm font-medium rounded-xl transition-all ${
                      pathname === link.href
                        ? "text-accent bg-white/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/2"
                    }`}
                  >
                    {link.label}
                    {pathname === link.href && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-accent to-primary rounded-full" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Separator */}
              <div className="h-6 w-px bg-border/50" />

              {/* Utility chips - Premium style */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle Chip */}
                <button
                  onClick={toggleTheme}
                  disabled={!themeMounted}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border/50 bg-surface/50 backdrop-blur-sm hover:bg-surface hover:border-accent/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                  aria-label={
                    themeMounted
                      ? isDark
                        ? t("nav.switchToLight")
                        : t("nav.switchToDark")
                      : t("nav.theme")
                  }
                >
                  {themeMounted ? (
                    <>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isDark 
                          ? "bg-amber-100 text-amber-900" 
                          : "bg-slate-800 text-slate-200"
                      }`}>
                        {isDark ? "☀️" : "🌙"}
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground">
                        {isDark ? t("nav.lightMode") : t("nav.darkMode")}
                      </span>
                    </>
                  ) : (
                    <span>{t("nav.theme")}</span>
                  )}
                </button>

                {/* Language Toggle Chip */}
                <button
                  onClick={toggleLanguage}
                  disabled={!i18nMounted}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border/50 bg-surface/50 backdrop-blur-sm hover:bg-surface hover:border-accent/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
                  aria-label={t("nav.languageLabel")}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {lang === "bg" ? "БГ" : "EN"}
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground">
                    {languageToggleLabel}
                  </span>
                </button>

                {/* Help Chip */}
                <Link
                  href="/help"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border/50 bg-surface/50 backdrop-blur-sm hover:bg-surface hover:border-accent/30 transition-all group"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                    ?
                  </div>
                  <span className="text-muted-foreground group-hover:text-foreground">
                    {t("help.nav")}
                  </span>
                </Link>

                {/* User Profile/Logout */}
                {session ? (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-px bg-border/50" />
                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border/50 bg-surface/50 backdrop-blur-sm hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all group"
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span>{t("nav.logout")}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              {/* Theme Toggle for mobile */}
              <button
                onClick={toggleTheme}
                disabled={!themeMounted}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={t("nav.theme")}
              >
                {themeMounted ? (
                  isDark ? (
                    <span className="text-lg">☀️</span>
                  ) : (
                    <span className="text-lg">🌙</span>
                  )
                ) : (
                  <span className="text-sm">⚪</span>
                )}
              </button>

              {/* Language Toggle for mobile */}
              <button
                onClick={toggleLanguage}
                disabled={!i18nMounted}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface/80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={t("nav.languageLabel")}
              >
                <span className="text-xs font-bold">{lang === "bg" ? "БГ" : "EN"}</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface/80 transition-colors"
                aria-label={t("nav.toggleMenu")}
              >
                {mobileMenuOpen ? (
                  <XIcon className="w-5 h-5" />
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu - Premium style */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden pt-16">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <div className="relative glass-effect border-t border-white/10 animate-slide-in">
            <div className="container py-6">
              {/* Utility chips in mobile */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <button
                  onClick={toggleTheme}
                  disabled={!themeMounted}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-border bg-surface hover:bg-surface/80 transition-colors disabled:opacity-60"
                >
                  {themeMounted ? (
                    isDark ? (
                      <>
                        <span>☀️</span>
                        <span>{t("nav.lightMode")}</span>
                      </>
                    ) : (
                      <>
                        <span>🌙</span>
                        <span>{t("nav.darkMode")}</span>
                      </>
                    )
                  ) : (
                    <span>{t("nav.theme")}</span>
                  )}
                </button>

                <button
                  onClick={toggleLanguage}
                  disabled={!i18nMounted}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-border bg-surface hover:bg-surface/80 transition-colors disabled:opacity-60"
                >
                  <span className="font-bold">{lang === "bg" ? "БГ" : "EN"}</span>
                  <span>{languageToggleLabel}</span>
                </button>

                <Link
                  href="/help"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-border bg-surface hover:bg-surface/80 transition-colors"
                  onClick={closeMobileMenu}
                >
                  <span>?</span>
                  <span>{t("help.nav")}</span>
                </Link>
              </div>

              {/* Navigation links */}
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-6 py-4 text-base font-medium rounded-2xl transition-all ${
                      pathname === link.href
                        ? "bg-accent/10 text-accent border border-accent/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    <span>{link.label}</span>
                    {pathname === link.href && (
                      <div className="w-2 h-2 bg-accent rounded-full" />
                    )}
                  </Link>
                ))}
              </div>

              {/* Logout in mobile */}
              {session && (
                <div className="mt-8 pt-8 border-t border-border/50">
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/login" });
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-medium rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{t("nav.logout")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16" />
    </>
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

function XIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}