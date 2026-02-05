import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listings/listing-form";

export default async function NewListingPage() {
  const t = await getTranslations();
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("listing.createListing")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("common.tagline")}
        </p>
      </div>

      <ListingForm />
    </div>
  );
}
