import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";
import { FRUIT_TYPES, PREFECTURES, PRICE_UNITS, LISTING_STATUS } from "@/lib/constants";
import { MapPin, Calendar, Package, MessageSquare, ArrowLeft } from "lucide-react";
import { ContactSellerButton } from "@/components/listings/contact-seller-button";

interface ListingPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations();
  const session = await auth();
  const lang = locale as "ja" | "en";

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, displayName: true, image: true, bio: true, createdAt: true } },
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!listing || listing.status === "DELETED") {
    notFound();
  }

  // Increment view count
  await prisma.listing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  const fruitType = FRUIT_TYPES[listing.fruitType as keyof typeof FRUIT_TYPES];
  const prefecture = PREFECTURES[listing.prefecture as keyof typeof PREFECTURES];
  const priceUnit = PRICE_UNITS[listing.priceUnit as keyof typeof PRICE_UNITS];
  const status = LISTING_STATUS[listing.status as keyof typeof LISTING_STATUS];
  const sellerName = listing.user.displayName || listing.user.name || "匿名";
  const isOwner = session?.user?.id === listing.userId;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Link
        href="/listings"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
            <Image
              src={listing.images[0]?.url || "/placeholder-fruit.jpg"}
              alt={listing.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute left-4 top-4">
              <Badge
                variant={listing.status === "ACTIVE" ? "success" : "secondary"}
              >
                {status?.[lang]}
              </Badge>
            </div>
          </div>
          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.slice(1, 5).map((image, i) => (
                <div
                  key={image.id}
                  className="relative aspect-square overflow-hidden rounded-xl bg-muted"
                >
                  <Image
                    src={image.url}
                    alt={`${listing.title} ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {fruitType?.emoji} {fruitType?.[lang]}
              </Badge>
            </div>
            <h1 className="mt-2 text-3xl font-bold">{listing.title}</h1>
            <p className="mt-4 text-4xl font-bold text-primary">
              {formatPrice(listing.price, lang === "ja" ? "ja-JP" : "en-US")}
              <span className="text-lg font-normal text-muted-foreground">
                /{priceUnit?.[lang]}
              </span>
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("listing.location")}</p>
                  <p className="font-medium">{prefecture?.[lang]}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("listing.quantity")}</p>
                  <p className="font-medium">{listing.quantity} {listing.quantityUnit}</p>
                </div>
              </CardContent>
            </Card>
            {listing.harvestDate && (
              <Card className="col-span-2">
                <CardContent className="flex items-center gap-3 p-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("listing.harvestDate")}</p>
                    <p className="font-medium">
                      {formatDate(listing.harvestDate, lang === "ja" ? "ja-JP" : "en-US")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 font-semibold">{t("listing.description")}</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {listing.description}
            </p>
          </div>

          {/* Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">出品者</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.user.image || undefined} />
                    <AvatarFallback>{sellerName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{sellerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.memberSince")}: {formatDate(listing.user.createdAt, lang === "ja" ? "ja-JP" : "en-US")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {isOwner ? (
              <Link href={`/listings/${listing.id}/edit`} className="flex-1">
                <Button className="w-full" variant="outline">
                  {t("common.edit")}
                </Button>
              </Link>
            ) : session ? (
              <ContactSellerButton
                listingId={listing.id}
                sellerId={listing.userId}
                listingTitle={listing.title}
              />
            ) : (
              <Link href="/login" className="flex-1">
                <Button className="w-full gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t("messages.contactSeller")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
