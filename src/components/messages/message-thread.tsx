"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { formatPrice, formatRelativeTime, cn } from "@/lib/utils";
import { PRICE_UNITS } from "@/lib/constants";
import { ArrowLeft, Send } from "lucide-react";
import type { Conversation, Listing, Message, User, ListingImage, PriceUnit } from "@prisma/client";

type MessageWithSender = Message & {
  sender: Pick<User, "id" | "name" | "displayName" | "image">;
};

type ConversationWithDetails = Conversation & {
  user1: Pick<User, "id" | "name" | "displayName" | "image">;
  user2: Pick<User, "id" | "name" | "displayName" | "image">;
  listing: Pick<Listing, "id" | "title" | "price" | "priceUnit"> & {
    images: Pick<ListingImage, "url">[];
  };
  messages: MessageWithSender[];
};

interface MessageThreadProps {
  conversation: ConversationWithDetails;
  currentUserId: string;
  otherUser: Pick<User, "id" | "name" | "displayName" | "image">;
}

export function MessageThread({
  conversation: initialConversation,
  currentUserId,
  otherUser,
}: MessageThreadProps) {
  const t = useTranslations();
  const locale = useLocale() as "ja" | "en";
  const [messages, setMessages] = useState(initialConversation.messages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserName = otherUser.displayName || otherUser.name || "User";
  const priceUnit = PRICE_UNITS[initialConversation.listing.priceUnit as PriceUnit];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Poll for new messages
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/conversations/${initialConversation.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [initialConversation.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
    const tempMessage: MessageWithSender = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUserId,
      conversationId: initialConversation.id,
      isRead: false,
      readAt: null,
      createdAt: new Date(),
      sender: {
        id: currentUserId,
        name: "You",
        displayName: null,
        image: null,
      },
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch(`/api/messages/conversations/${initialConversation.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? message : m))
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href="/messages">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser.image || undefined} />
          <AvatarFallback>{otherUserName[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{otherUserName}</p>
          <Link
            href={`/listings/${initialConversation.listing.id}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            {initialConversation.listing.title}
          </Link>
        </div>
      </div>

      {/* Listing Preview */}
      <Card className="my-4">
        <Link href={`/listings/${initialConversation.listing.id}`}>
          <CardContent className="flex items-center gap-4 p-4">
            {initialConversation.listing.images[0] && (
              <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                <Image
                  src={initialConversation.listing.images[0].url}
                  alt={initialConversation.listing.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-medium">{initialConversation.listing.title}</p>
              <p className="text-lg font-bold text-primary">
                {formatPrice(initialConversation.listing.price, locale === "ja" ? "ja-JP" : "en-US")}
                <span className="text-sm font-normal text-muted-foreground">
                  /{priceUnit?.[locale]}
                </span>
              </p>
            </div>
          </CardContent>
        </Link>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 py-4">
          {messages.map((message) => {
            const isMine = message.senderId === currentUserId;
            const senderName = message.sender.displayName || message.sender.name || "User";

            return (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  isMine ? "flex-row-reverse" : "flex-row"
                )}
              >
                {!isMine && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender.image || undefined} />
                    <AvatarFallback>{senderName[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2",
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {formatRelativeTime(
                      new Date(message.createdAt),
                      locale === "ja" ? "ja-JP" : "en-US"
                    )}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2 border-t pt-4">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t("messages.typeMessage")}
          className="min-h-[44px] resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
          {sending ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
