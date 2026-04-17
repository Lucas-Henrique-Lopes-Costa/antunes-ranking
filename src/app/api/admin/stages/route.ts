import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { StageType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { stageId, stageType } = body as { stageId: string; stageType: StageType };

    const stage = await prisma.stage.update({
      where: { id: stageId },
      data: { stageType },
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error("Erro ao atualizar stage:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
