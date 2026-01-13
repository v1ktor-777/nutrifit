"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function HelpPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-10 w-full max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("help.title")}</h1>
      </header>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">{t("help.introTitle")}</h2>
        <p className="text-sm text-muted">{t("help.introBody")}</p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">{t("help.dashboardTitle")}</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted">
          <li>{t("help.dashboardPoint1")}</li>
          <li>{t("help.dashboardPoint2")}</li>
          <li>{t("help.dashboardPoint3")}</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">{t("help.foodTitle")}</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted">
          <li>{t("help.foodPoint1")}</li>
          <li>{t("help.foodPoint2")}</li>
          <li>{t("help.foodPoint3")}</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">{t("help.programTitle")}</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted">
          <li>{t("help.programPoint1")}</li>
          <li>{t("help.programPoint2")}</li>
          <li>{t("help.programPoint3")}</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">{t("help.bodyStatsTitle")}</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted">
          <li>{t("help.bodyStatsPoint1")}</li>
          <li>{t("help.bodyStatsPoint2")}</li>
          <li>{t("help.bodyStatsPoint3")}</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">{t("help.settingsTitle")}</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted">
          <li>{t("help.settingsPoint1")}</li>
          <li>{t("help.settingsPoint2")}</li>
          <li>{t("help.settingsPoint3")}</li>
        </ul>
      </section>
    </div>
  );
}
