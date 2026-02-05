"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquare } from "lucide-react";

interface ContactSellerButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
}

export function ContactSellerButton({
  listingId,
  sellerId,
  listingTitle,
}: ContactSellerButtonProps) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, sellerId }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/messages/${data.id}`);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleContact} disabled={loading} className="flex-1 gap-2">
      {loading ? <Spinner size="sm" /> : <MessageSquare className="h-4 w-4" />}
      {t("messages.contactSeller")}
    </Button>
  );
}
