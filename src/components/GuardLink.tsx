"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export default function GuardLink({ href, className, children }: Props) {
  const { status } = useSession();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const isAuthed = status === "authenticated";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {isAuthed ? (
        <Link href={href} className={className}>
          {children}
        </Link>
      ) : (
        <button type="button" className={className} onClick={() => setOpen(true)}>
          {children}
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 animate-[modalIn_.12s_ease-out]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("guard.ariaLabel")}
          >
            <div className="p-5 md:p-6 border-b border-border bg-gradient-to-r from-black/5 to-transparent dark:from-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl border border-border flex items-center justify-center bg-white/70 dark:bg-neutral-800">
                    <span className="text-lg">🔒</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{t("guard.title")}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      {t("guard.subtitle")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                  aria-label={t("common.close")}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 md:p-6 space-y-4">
              <div className="rounded-xl border border-border bg-white/60 dark:bg-neutral-800/50 p-4">
                <p className="font-medium mb-2">{t("guard.benefitsTitle")}</p>
                <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-200">
                  <li className="flex gap-2">
                    <span>✅</span>
                    <span>{t("guard.benefitDashboard")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✅</span>
                    <span>{t("guard.benefitBodyStats")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span>✅</span>
                    <span>{t("guard.benefitProgram")}</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                {t("guard.helperText")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href="/login"
                  className="btn-primary px-5 py-2 w-full sm:w-auto text-center"
                  onClick={() => setOpen(false)}
                >
                  {t("guard.login")}
                </Link>

                <Link
                  href="/register"
                  className="btn-secondary px-5 py-2 w-full sm:w-auto text-center"
                  onClick={() => setOpen(false)}
                >
                  {t("guard.register")}
                </Link>
              </div>

              <button
                type="button"
                className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                onClick={() => setOpen(false)}
              >
                {t("guard.guest")}
              </button>
            </div>
          </div>

          <style jsx>{`
            @keyframes modalIn {
              from {
                opacity: 0;
                transform: translateY(6px) scale(0.98);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
