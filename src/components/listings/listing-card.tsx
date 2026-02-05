"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import { FRUIT_TYPES, PREFECTURES, PRICE_UNITS } from "@/lib/constants";
import { MapPin } from "lucide-react";
import type { Listing, User, ListingImage, FruitType, Prefecture, PriceUnit } from "@prisma/client";

interface ListingCardProps {
  listing: Listing & {
    user: Pick<User, "id" | "name" | "displayName" | "image">;
    images: Pick<ListingImage, "url">[];
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const t = useTranslations();
  const locale = useLocale() as "ja" | "en";

  const fruitType = FRUIT_TYPES[listing.fruitType as FruitType];
  const prefecture = PREFECTURES[listing.prefecture as Prefecture];
  const priceUnit = PRICE_UNITS[listing.priceUnit as PriceUnit];

  const imageUrl = listing.images[0]?.url || "/placeholder-fruit.jpg";
  const sellerName = listing.user.displayName || listing.user.name || "匿名";

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {fruitType?.emoji} {fruitType?.[locale] || listing.fruitType}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-semibold">{listing.title}</h3>
          <p className="mt-1 text-lg font-bold text-primary">
            {formatPrice(listing.price, locale === "ja" ? "ja-JP" : "en-US")}
            <span className="text-sm font-normal text-muted-foreground">
              /{priceUnit?.[locale]}
            </span>
          </p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {prefecture?.[locale]}
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={listing.user.image || undefined} />
                <AvatarFallback className="text-[10px]">
                  {sellerName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{sellerName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
