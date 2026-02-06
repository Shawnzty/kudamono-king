"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { FRUIT_TYPES } from "@/lib/constants";

export function FruitCategories() {
  const locale = useLocale() as "ja" | "en";

  const categories = Object.entries(FRUIT_TYPES).filter(
    ([key]) => key !== "OTHER"
  );

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map(([key, value]) => (
        <Link
          key={key}
          href={`/listings?fruit=${key}`}
          className="flex items-center gap-2 rounded-full border border-green-100 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-green-200 dark:border-green-900 dark:bg-green-950/30 dark:hover:border-green-700"
        >
          <span className="text-lg">{value.emoji}</span>
          <span>{value[locale]}</span>
        </Link>
      ))}
    </div>
  );
}
