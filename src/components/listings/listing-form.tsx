"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FRUIT_TYPES, PREFECTURES, PRICE_UNITS } from "@/lib/constants";
import { ImagePlus, X } from "lucide-react";
import type { Listing, ListingImage } from "@prisma/client";

interface ListingFormProps {
  listing?: Listing & { images: ListingImage[] };
}

export function ListingForm({ listing }: ListingFormProps) {
  const t = useTranslations();
  const locale = useLocale() as "ja" | "en";
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<{ url: string; publicId: string }[]>(
    listing?.images.map((img) => ({ url: img.url, publicId: img.publicId })) || []
  );

  const [formData, setFormData] = useState({
    title: listing?.title || "",
    description: listing?.description || "",
    fruitType: listing?.fruitType || "",
    price: listing?.price?.toString() || "",
    priceUnit: listing?.priceUnit || "PER_KG",
    quantity: listing?.quantity?.toString() || "",
    quantityUnit: listing?.quantityUnit || "",
    prefecture: listing?.prefecture || "",
    city: listing?.city || "",
    harvestDate: listing?.harvestDate
      ? new Date(listing.harvestDate).toISOString().split("T")[0]
      : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 5 - images.length;
    const filesToUpload = Array.from(files).slice(0, remaining);
    setUploading(true);

    try {
      const uploads = await Promise.all(
        filesToUpload.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: formData }
          );
          const data = await res.json();
          return { url: data.secure_url as string, publicId: data.public_id as string };
        })
      );
      setImages((prev) => [...prev, ...uploads]);
    } catch {
      setError(t("common.error"));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = listing ? `/api/listings/${listing.id}` : "/api/listings";
      const method = listing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          quantity: parseInt(formData.quantity),
          images: images.map((img, i) => ({ url: img.url, publicId: img.publicId, order: i })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("common.error"));
        return;
      }

      router.push(`/listings/${data.id}`);
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const fruitOptions = Object.entries(FRUIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${value[locale]}`,
  }));

  const prefectureOptions = Object.entries(PREFECTURES).map(([key, value]) => ({
    value: key,
    label: value[locale],
  }));

  const priceUnitOptions = Object.entries(PRICE_UNITS).map(([key, value]) => ({
    value: key,
    label: value[locale],
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Images */}
      <Card>
        <CardContent className="p-6">
          <Label className="mb-4 block">{t("listing.images")}</Label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 ${uploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}>
                {uploading ? (
                  <Spinner size="sm" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="mt-2 text-xs text-muted-foreground">
                  {uploading ? t("common.loading") : t("listing.addImages")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("listing.maxImages")}
          </p>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t("listing.title")}</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fruitType">{t("listing.fruitType")}</Label>
            <Select
              name="fruitType"
              value={formData.fruitType}
              onChange={handleChange}
              options={fruitOptions}
              placeholder={t("listing.selectFruit")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("listing.description")}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">{t("listing.price")} (¥)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceUnit">{t("listing.priceUnit")}</Label>
              <Select
                name="priceUnit"
                value={formData.priceUnit}
                onChange={handleChange}
                options={priceUnitOptions}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t("listing.quantity")}</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantityUnit">単位 / Unit</Label>
              <Input
                id="quantityUnit"
                name="quantityUnit"
                value={formData.quantityUnit}
                onChange={handleChange}
                placeholder="kg, 箱, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prefecture">{t("listing.prefecture")}</Label>
              <Select
                name="prefecture"
                value={formData.prefecture}
                onChange={handleChange}
                options={prefectureOptions}
                placeholder={t("listing.selectPrefecture")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t("listing.city")}</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harvestDate">{t("listing.harvestDate")}</Label>
            <Input
              id="harvestDate"
              name="harvestDate"
              type="date"
              value={formData.harvestDate}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" className="flex-1" disabled={loading || uploading}>
          {loading && <Spinner size="sm" className="mr-2" />}
          {listing ? t("common.save") : t("listing.publish")}
        </Button>
      </div>
    </form>
  );
}
