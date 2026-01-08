"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
};

export default function GuardLink({ href, className, children }: Props) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  const isAuthed = status === "authenticated";

  return (
    <>
      {isAuthed ? (
        <Link href={href} className={className}>
          {children}
        </Link>
      ) : (
        <button
          type="button"
          className={className}
          onClick={() => setOpen(true)}
        >
          {children}
        </button>
      )}

      {open && (
        // ✅ overlay (клик извън модала -> затваря)
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4"
          onClick={() => setOpen(false)}
        >
          {/* ✅ modal card */}
          <div
            className="w-full max-w-md rounded-xl border border-border shadow-2xl p-6 space-y-4
                       bg-white text-neutral-900
                       dark:bg-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <p className="text-lg font-semibold">Достъп само с профил</p>

              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Имаш профил? Впиши се в профила ти, за да следиш своя прогрес от
                тренировки и режим на хранене.
              </p>

              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Нямаш профил? Създай своя профил тук.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="btn-primary px-5 py-2"
                onClick={() => setOpen(false)}
              >
                Вход
              </Link>
              <Link
                href="/register"
                className="btn-secondary px-5 py-2"
                onClick={() => setOpen(false)}
              >
                Регистрация
              </Link>
            </div>

            <button
              type="button"
              className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
              onClick={() => setOpen(false)}
            >
              Затвори
            </button>
          </div>
        </div>
      )}
    </>
  );
}
