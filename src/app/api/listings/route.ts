import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { FruitType, Prefecture, PriceUnit } from "@prisma/client";

const listingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  fruitType: z.string(),
  price: z.number().min(0),
  priceUnit: z.string().optional(),
  quantity: z.number().min(1),
  quantityUnit: z.string().optional(),
  prefecture: z.string(),
  city: z.string().optional(),
  harvestDate: z.string().optional(),
  images: z.array(z.object({
    url: z.string(),
    publicId: z.string(),
    order: z.number(),
  })).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = listingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { images, harvestDate, fruitType, prefecture, priceUnit, ...data } = parsed.data;

    const listing = await prisma.listing.create({
      data: {
        ...data,
        fruitType: fruitType as FruitType,
        prefecture: prefecture as Prefecture,
        priceUnit: (priceUnit || "PER_KG") as PriceUnit,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        userId: session.user.id,
        status: "ACTIVE",
        images: images
          ? {
              create: images.map((img) => ({
                url: img.url,
                publicId: img.publicId,
                order: img.order,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fruit = searchParams.get("fruit");
    const prefecture = searchParams.get("prefecture");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const limit = parseInt(searchParams.get("limit") || "24");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (fruit) where.fruitType = fruit;
    if (prefecture) where.prefecture = prefecture;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> = {};
    switch (sort) {
      case "price_asc":
        orderBy.price = "asc";
        break;
      case "price_desc":
        orderBy.price = "desc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, displayName: true, image: true } },
          images: { orderBy: { order: "asc" }, take: 1 },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({ listings, total });
  } catch (error) {
    console.error("Get listings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
