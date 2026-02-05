import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [{ user1Id: userId }, { user2Id: userId }],
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
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Verify user is part of conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { content } = parsed.data;

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        conversationId: id,
      },
      include: {
        sender: { select: { id: true, name: true, displayName: true, image: true } },
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
