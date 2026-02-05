"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🍎</span>
            <span className="text-lg font-semibold">{t("common.appName")}</span>
          </div>
          <div className="mt-8 md:mt-0">
            <nav className="flex flex-wrap gap-6 text-sm">
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("footer.about")}
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("footer.terms")}
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("footer.privacy")}
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("footer.contact")}
              </Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
