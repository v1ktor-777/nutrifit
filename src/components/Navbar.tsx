"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import ToggleSwitch from "@/components/ToggleSwitch";

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
      ]
    : [
        { href: "/login", label: t("nav.login") },
        { href: "/register", label: t("nav.register") },
      ];

  const isDark = themeMounted ? theme === "dark" : false;
  const isBg = i18nMounted ? lang === "bg" : false;

  const themeStateLabel = themeMounted
    ? isDark
      ? t("nav.darkMode")
      : t("nav.lightMode")
    : t("nav.theme");

  const handleThemeChange = (checked: boolean) => {
    if (!themeMounted) return;
    setTheme(checked ? "dark" : "light");
  };

  const handleLanguageChange = (checked: boolean) => {
    if (!i18nMounted) return;
    setLang(checked ? "bg" : "en");
  };

  const languageLabel = t("nav.language");

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
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface/50 backdrop-blur-sm border border-white/5 transition-colors hover:bg-surface/70 group"
              onClick={closeMobileMenu}
            >
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
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border/50 bg-surface/50 backdrop-blur-sm hover:bg-surface hover:border-accent/30 transition-all group">
                  <ToggleSwitch
                    id="theme-toggle"
                    checked={isDark}
                    onCheckedChange={handleThemeChange}
                    disabled={!themeMounted}
                    label={themeStateLabel}
                    labelPosition="left"
                    labelClassName="text-muted-foreground group-hover:text-foreground"
                    ariaLabel={t("nav.theme")}
                  />
                </div>

                {/* Language Toggle Chip */}
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border/50 bg-surface/50 backdrop-blur-sm hover:bg-surface hover:border-accent/30 transition-all group">
                  <ToggleSwitch
                    id="language-toggle"
                    checked={isBg}
                    onCheckedChange={handleLanguageChange}
                    disabled={!i18nMounted}
                    label={languageLabel}
                    labelPosition="left"
                    labelClassName="text-muted-foreground group-hover:text-foreground"
                    leftLabel={t("nav.languageToEn")}
                    rightLabel={t("nav.languageToBg")}
                    ariaLabel={t("nav.languageLabel")}
                  />
                </div>

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
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border/50 bg-surface/50 backdrop-blur-sm hover:bg-surface hover:border-accent/30 transition-all group"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87M12 11a4 4 0 100-8 4 4 0 000 8z" />
                        </svg>
                      </div>
                      <span className="text-muted-foreground group-hover:text-foreground">
                        {t("nav.profile")}
                      </span>
                    </Link>
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
              <div className="px-2 py-1 rounded-full border border-border bg-surface/50 backdrop-blur-sm">
                <ToggleSwitch
                  id="theme-toggle-mobile"
                  checked={isDark}
                  onCheckedChange={handleThemeChange}
                  disabled={!themeMounted}
                  size="sm"
                  ariaLabel={t("nav.theme")}
                />
              </div>

              {/* Language Toggle for mobile */}
              <div className="px-2 py-1 rounded-full border border-border bg-surface/50 backdrop-blur-sm">
                <ToggleSwitch
                  id="language-toggle-mobile"
                  checked={isBg}
                  onCheckedChange={handleLanguageChange}
                  disabled={!i18nMounted}
                  size="sm"
                  leftLabel={t("nav.languageToEn")}
                  rightLabel={t("nav.languageToBg")}
                  ariaLabel={t("nav.languageLabel")}
                />
              </div>

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
            className="absolute inset-0 bg-white"
            onClick={closeMobileMenu}
          />
          <div className="relative glass-effect border-t border-white/10 animate-slide-in">
            <div className="container py-6">
              {/* Utility chips in mobile */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-border bg-surface/50 hover:bg-surface/80 transition-colors">
                  <ToggleSwitch
                    id="theme-toggle-menu"
                    checked={isDark}
                    onCheckedChange={handleThemeChange}
                    disabled={!themeMounted}
                    label={themeStateLabel}
                    labelPosition="left"
                    ariaLabel={t("nav.theme")}
                  />
                </div>

                <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-border bg-surface/50 hover:bg-surface/80 transition-colors">
                  <ToggleSwitch
                    id="language-toggle-menu"
                    checked={isBg}
                    onCheckedChange={handleLanguageChange}
                    disabled={!i18nMounted}
                    label={languageLabel}
                    labelPosition="left"
                    leftLabel={t("nav.languageToEn")}
                    rightLabel={t("nav.languageToBg")}
                    ariaLabel={t("nav.languageLabel")}
                  />
                </div>

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
                <div className="mt-8 pt-8 border-t border-border/50 space-y-3">
                  <Link
                    href="/profile"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-medium rounded-2xl border border-border text-foreground hover:bg-surface transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-3-3.87M4 21v-2a4 4 0 013-3.87M12 11a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                    <span>{t("nav.profile")}</span>
                  </Link>
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

