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
          className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
        >
          <span className="text-lg">{value.emoji}</span>
          <span>{value[locale]}</span>
        </Link>
      ))}
    </div>
  );
}
