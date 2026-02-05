import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";
import { FRUIT_TYPES, LISTING_STATUS, PRICE_UNITS } from "@/lib/constants";
import { Plus, Eye, MessageSquare, Package } from "lucide-react";
import type { FruitType, ListingStatus, PriceUnit } from "@prisma/client";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const session = await auth();
  const lang = locale as "ja" | "en";

  if (!session) {
    redirect("/login");
  }

  const [listings, conversationCount, totalViews] = await Promise.all([
    prisma.listing.findMany({
      where: { userId: session.user.id, status: { not: "DELETED" } },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        _count: { select: { conversations: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.conversation.count({
      where: {
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
      },
    }),
    prisma.listing.aggregate({
      where: { userId: session.user.id },
      _sum: { viewCount: true },
    }),
  ]);

  const activeListings = listings.filter((l) => l.status === "ACTIVE").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("nav.dashboard")}</h1>
          <p className="mt-2 text-muted-foreground">
            {locale === "ja" ? "出品と会話を管理" : "Manage your listings and conversations"}
          </p>
        </div>
        <Link href="/listings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("listing.createListing")}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("listing.myListings")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
            <p className="text-xs text-muted-foreground">
              {listings.length} {locale === "ja" ? "件の出品" : "total listings"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === "ja" ? "総閲覧数" : "Total Views"}
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews._sum.viewCount || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("messages.inbox")}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationCount}</div>
            <Link
              href="/messages"
              className="text-xs text-primary hover:underline"
            >
              {t("common.seeAll")}
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("listing.myListings")}</CardTitle>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">{t("listing.noListings")}</p>
              <Link href="/listings/new">
                <Button className="mt-4">{t("listing.createListing")}</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {listings.map((listing) => {
                const fruitType = FRUIT_TYPES[listing.fruitType as FruitType];
                const status = LISTING_STATUS[listing.status as ListingStatus];
                const priceUnit = PRICE_UNITS[listing.priceUnit as PriceUnit];

                return (
                  <div key={listing.id} className="flex items-center gap-4 py-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      {listing.images[0] && (
                        <img
                          src={listing.images[0].url}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-medium hover:underline"
                        >
                          {listing.title}
                        </Link>
                        <Badge
                          variant={listing.status === "ACTIVE" ? "success" : "secondary"}
                        >
                          {status?.[lang]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {fruitType?.emoji} {fruitType?.[lang]} •{" "}
                        {formatPrice(listing.price, lang === "ja" ? "ja-JP" : "en-US")}/
                        {priceUnit?.[lang]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {listing.viewCount} {locale === "ja" ? "閲覧" : "views"} •{" "}
                        {listing._count.conversations}{" "}
                        {locale === "ja" ? "件の問い合わせ" : "inquiries"}
                      </p>
                    </div>
                    <Link href={`/listings/${listing.id}/edit`}>
                      <Button variant="outline" size="sm">
                        {t("common.edit")}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
