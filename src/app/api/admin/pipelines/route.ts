import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pipelines = await prisma.pipeline.findMany({
      include: {
        stages: { orderBy: { kommoStatusId: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(pipelines);
  } catch (error) {
    console.error("Erro ao buscar pipelines:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pipelineId, monitored } = body;

    const pipeline = await prisma.pipeline.update({
      where: { id: pipelineId },
      data: { monitored },
    });

    return NextResponse.json(pipeline);
  } catch (error) {
    console.error("Erro ao atualizar pipeline:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
