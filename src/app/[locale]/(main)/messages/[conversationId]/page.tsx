import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { MessageThread } from "@/components/messages/message-thread";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const t = await getTranslations();
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
    },
    include: {
      user1: { select: { id: true, name: true, displayName: true, image: true } },
      user2: { select: { id: true, name: true, displayName: true, image: true } },
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          priceUnit: true,
          images: { orderBy: { order: "asc" }, take: 1 },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, displayName: true, image: true } },
        },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  const otherUser =
    session.user.id === conversation.user1Id
      ? conversation.user2
      : conversation.user1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <MessageThread
        conversation={conversation}
        currentUserId={session.user.id}
        otherUser={otherUser}
      />
    </div>
  );
}
