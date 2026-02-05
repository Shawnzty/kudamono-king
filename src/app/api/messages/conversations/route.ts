import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const createConversationSchema = z.object({
  listingId: z.string(),
  sellerId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { listingId, sellerId } = parsed.data;
    const buyerId = session.user.id;

    // Can't message yourself
    if (buyerId === sellerId) {
      return NextResponse.json(
        { error: "Cannot message yourself" },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        listingId,
        OR: [
          { user1Id: buyerId, user2Id: sellerId },
          { user1Id: sellerId, user2Id: buyerId },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        user1Id: buyerId,
        user2Id: sellerId,
        listingId,
      },
      include: {
        user1: { select: { id: true, name: true, displayName: true, image: true } },
        user2: { select: { id: true, name: true, displayName: true, image: true } },
        listing: { select: { id: true, title: true, images: { take: 1 } } },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, name: true, displayName: true, image: true } },
        user2: { select: { id: true, name: true, displayName: true, image: true } },
        listing: {
          select: {
            id: true,
            title: true,
            images: { orderBy: { order: "asc" }, take: 1 },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        });
        return { ...conv, unreadCount };
      })
    );

    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
