import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ListingGrid } from "@/components/listings/listing-grid";
import { FruitCategories } from "@/components/shared/fruit-categories";
import prisma from "@/lib/prisma";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations();

  // Fetch recent listings
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { id: true, name: true, displayName: true, image: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-background dark:from-green-950/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="whitespace-pre-line text-4xl font-bold tracking-tight sm:text-6xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/listings">
                <Button size="lg" className="gap-2">
                  {t("home.hero.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/listings/new">
                <Button size="lg" variant="outline">
                  {t("home.hero.secondaryCta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative fruit elements */}
        <div className="absolute -left-4 top-20 text-6xl opacity-20">🍎</div>
        <div className="absolute -right-4 bottom-20 text-6xl opacity-20">🍊</div>
        <div className="absolute left-1/4 bottom-10 text-4xl opacity-10">🍇</div>
        <div className="absolute right-1/3 top-10 text-4xl opacity-10">🍑</div>
      </section>

      {/* Categories Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-semibold">{t("home.categories")}</h2>
        <FruitCategories />
      </section>

      {/* Recent Listings Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t("home.recent")}</h2>
          <Link
            href="/listings"
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {t("common.seeAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ListingGrid listings={listings} />
      </section>
    </div>
  );
}
