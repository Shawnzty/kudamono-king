"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FRUIT_TYPES, PREFECTURES } from "@/lib/constants";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface ListingFiltersProps {
  currentFruit?: string;
  currentPrefecture?: string;
  currentSort?: string;
}

export function ListingFilters({
  currentFruit,
  currentPrefecture,
  currentSort,
}: ListingFiltersProps) {
  const t = useTranslations();
  const locale = useLocale() as "ja" | "en";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search || null);
  };

  const clearFilters = () => {
    setSearch("");
    router.push(pathname);
  };

  const hasFilters = currentFruit || currentPrefecture || searchParams.get("search");

  const fruitOptions = [
    { value: "", label: t("listing.selectFruit") },
    ...Object.entries(FRUIT_TYPES).map(([key, value]) => ({
      value: key,
      label: `${value.emoji} ${value[locale]}`,
    })),
  ];

  const prefectureOptions = [
    { value: "", label: t("listing.selectPrefecture") },
    ...Object.entries(PREFECTURES).map(([key, value]) => ({
      value: key,
      label: value[locale],
    })),
  ];

  const sortOptions = [
    { value: "newest", label: t("listing.newest") },
    { value: "price_asc", label: t("listing.priceAsc") },
    { value: "price_desc", label: t("listing.priceDesc") },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("common.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">{t("common.search")}</Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select
          options={fruitOptions}
          value={currentFruit || ""}
          onChange={(e) => updateFilter("fruit", e.target.value || null)}
          className="w-full sm:w-48"
        />
        <Select
          options={prefectureOptions}
          value={currentPrefecture || ""}
          onChange={(e) => updateFilter("prefecture", e.target.value || null)}
          className="w-full sm:w-48"
        />
        <Select
          options={sortOptions}
          value={currentSort || "newest"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="w-full sm:w-48"
        />
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            {t("common.cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}
