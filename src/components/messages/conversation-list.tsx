"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime, truncate } from "@/lib/utils";
import type { Conversation, User, Listing, Message, ListingImage } from "@prisma/client";

type ConversationWithDetails = Conversation & {
  user1: Pick<User, "id" | "name" | "displayName" | "image">;
  user2: Pick<User, "id" | "name" | "displayName" | "image">;
  listing: Pick<Listing, "id" | "title"> & { images: Pick<ListingImage, "url">[] };
  messages: Message[];
  unreadCount: number;
};

export function ConversationList() {
  const t = useTranslations();
  const locale = useLocale() as "ja" | "en";
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">{t("messages.noConversations")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        const otherUser =
          session?.user?.id === conversation.user1Id
            ? conversation.user2
            : conversation.user1;
        const otherUserName = otherUser.displayName || otherUser.name || "User";
        const lastMessage = conversation.messages[0];
        const listingImage = conversation.listing.images[0]?.url;

        return (
          <Link key={conversation.id} href={`/messages/${conversation.id}`}>
            <Card className="p-4 transition-colors hover:bg-accent/50">
              <div className="flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={otherUser.image || undefined} />
                  <AvatarFallback>{otherUserName[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{otherUserName}</span>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="default" className="h-5 min-w-5 rounded-full px-1.5 text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(
                          new Date(lastMessage.createdAt),
                          locale === "ja" ? "ja-JP" : "en-US"
                        )}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {listingImage && (
                      <img
                        src={listingImage}
                        alt=""
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">
                        {t("messages.about")}: {truncate(conversation.listing.title, 30)}
                      </p>
                      {lastMessage && (
                        <p className="truncate text-sm">
                          {truncate(lastMessage.content, 50)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
