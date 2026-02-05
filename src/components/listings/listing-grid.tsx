"use client";

import { useTranslations } from "next-intl";
import { ListingCard } from "./listing-card";
import type { Listing, User, ListingImage } from "@prisma/client";

interface ListingGridProps {
  listings: (Listing & {
    user: Pick<User, "id" | "name" | "displayName" | "image">;
    images: Pick<ListingImage, "url">[];
  })[];
}

export function ListingGrid({ listings }: ListingGridProps) {
  const t = useTranslations();

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">{t("listing.noListings")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
