import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const users = await prisma.kommoUser.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { leads: true } },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body as { userId: string; role: UserRole };

    const user = await prisma.kommoUser.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
