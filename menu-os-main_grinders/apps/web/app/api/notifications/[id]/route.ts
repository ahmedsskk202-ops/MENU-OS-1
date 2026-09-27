import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions, type SessionUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notification = await prisma.notification.updateMany({
    where: { id: params.id, tenantId: user.tenantId },
    data: { isRead: true },
  });
  return NextResponse.json({ updated: notification.count });
}
