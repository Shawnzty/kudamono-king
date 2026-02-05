import { getTranslations } from "next-intl/server";
import { ListingGrid } from "@/components/listings/listing-grid";
import { ListingFilters } from "@/components/listings/listing-filters";
import prisma from "@/lib/prisma";
import { FruitType, Prefecture } from "@prisma/client";

interface ListingsPageProps {
  searchParams: Promise<{
    fruit?: string;
    prefecture?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const t = await getTranslations();
  const params = await searchParams;

  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (params.fruit && Object.keys(FruitType).includes(params.fruit)) {
    where.fruitType = params.fruit as FruitType;
  }

  if (params.prefecture && Object.keys(Prefecture).includes(params.prefecture)) {
    where.prefecture = params.prefecture as Prefecture;
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, string> = {};
  switch (params.sort) {
    case "price_asc":
      orderBy.price = "asc";
      break;
    case "price_desc":
      orderBy.price = "desc";
      break;
    default:
      orderBy.createdAt = "desc";
  }

  const listings = await prisma.listing.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, displayName: true, image: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy,
    take: 24,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("nav.browse")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("common.tagline")}
        </p>
      </div>

      <div className="mb-8">
        <ListingFilters
          currentFruit={params.fruit}
          currentPrefecture={params.prefecture}
          currentSort={params.sort}
        />
      </div>

      <ListingGrid listings={listings} />
    </div>
  );
}
