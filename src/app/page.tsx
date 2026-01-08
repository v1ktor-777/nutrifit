"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import GuardLink from "@/components/GuardLink";
import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function Home() {
  const { status } = useSession();
  const { t } = useI18n();
  const isAuthed = status === "authenticated";
  const isLoading = status === "loading";

  const features = [
    {
      title: t("home.featureFitnessTitle"),
      description: t("home.featureFitnessDescription"),
      href: "/program",
      guarded: true,
    },
    {
      title: t("home.featureFoodTitle"),
      description: t("home.featureFoodDescription"),
      href: "/food",
      guarded: true,
    },
    {
      title: t("home.featureProgressTitle"),
      description: t("home.featureProgressDescription"),
      href: "/progress",
      guarded: true,
    },
  ];

  return (
    <div className="space-y-20">
      <section className="container max-w-4xl mx-auto px-4 pt-12 md:pt-20">
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              {t("home.brandNutri")}
              <span className="text-accent">{t("home.brandFit")}</span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto leading-relaxed">
              {t("home.heroSubtitle")}
            </p>
          </div>

          {!isLoading && !isAuthed && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2" />
          )}

          {!isLoading && isAuthed && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="btn-primary w-full sm:w-auto px-10 py-3.5 text-base font-medium"
              >
                {t("home.ctaAuthedDashboard")}
              </Link>
              <Link
                href="/food"
                className="btn-secondary w-full sm:w-auto px-10 py-3.5 text-base font-medium"
              >
                {t("home.ctaAuthedAddFood")}
              </Link>
            </div>
          )}
        </div>
      </section>

      {!isLoading && isAuthed && (
        <section className="container max-w-6xl mx-auto px-4">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold">{t("home.quickActionsTitle")}</h2>
              <p className="text-muted text-sm">{t("home.quickActionsSubtitle")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/dashboard"
                className="card p-6 border border-border hover:border-accent/30 transition-all duration-300"
              >
                <p className="font-semibold text-lg">{t("home.quickDashboardTitle")}</p>
                <p className="text-sm text-muted mt-2">
                  {t("home.quickDashboardDescription")}
                </p>
              </Link>

              <Link
                href="/program"
                className="card p-6 border border-border hover:border-accent/30 transition-all duration-300"
              >
                <p className="font-semibold text-lg">{t("home.quickProgramTitle")}</p>
                <p className="text-sm text-muted mt-2">
                  {t("home.quickProgramDescription")}
                </p>
              </Link>

              <Link
                href="/progress"
                className="card p-6 border border-border hover:border-accent/30 transition-all duration-300"
              >
                <p className="font-semibold text-lg">{t("home.quickProgressTitle")}</p>
                <p className="text-sm text-muted mt-2">
                  {t("home.quickProgressDescription")}
                </p>
              </Link>
            </div>
          </div>
        </section>
      )}

      {!isLoading && !isAuthed && (
        <>
          <section className="container max-w-6xl mx-auto px-4">
            <div className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-semibold">{t("home.featuresTitle")}</h2>
                <p className="text-muted max-w-xl mx-auto text-lg">
                  {t("home.featuresSubtitle")}
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {features.map((feature) => {
                  const Wrapper = feature.guarded ? GuardLink : Link;

                  return (
                    <Wrapper key={feature.href} href={feature.href} className="group">
                      <div className="card h-full p-6 transition-all duration-300 hover:shadow-lg border border-border">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-muted leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="container max-w-3xl mx-auto px-4 pb-16">
            <div className="card text-center p-8 md:p-10 space-y-6 border border-border">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{t("home.ctaTitle")}</h2>
                <p className="text-muted max-w-xl mx-auto leading-relaxed">
                  {t("home.ctaDescription")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="btn-primary w-full sm:w-auto px-10 py-3.5 font-medium"
                >
                  {t("home.ctaCreateAccount")}
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary w-full sm:w-auto px-10 py-3.5 font-medium"
                >
                  {t("home.ctaSignIn")}
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
