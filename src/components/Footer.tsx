"use client";

import { useI18n } from "@/lib/i18n/LanguageProvider";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border py-6">
      <div className="container text-sm text-muted-foreground text-center">
        {t("footer.rights")}
      </div>
    </footer>
  );
}
