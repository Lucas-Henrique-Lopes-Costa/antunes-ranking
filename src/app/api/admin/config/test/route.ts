import { NextResponse } from "next/server";
import { getAuthConfig } from "@/lib/kommo/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getAuthConfig();

    if (!config.subdomain) {
      return NextResponse.json({ error: "Subdomínio não configurado" }, { status: 400 });
    }
    if (!config.accessToken) {
      return NextResponse.json({ error: "Access token não configurado" }, { status: 400 });
    }

    const response = await fetch(
      `https://${config.subdomain}.kommo.com/api/v4/account`,
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        {
          error: `Kommo retornou ${response.status}: ${body.slice(0, 200)}`,
        },
        { status: 400 }
      );
    }

    const data = (await response.json()) as { name?: string; subdomain?: string; id?: number };
    return NextResponse.json({
      ok: true,
      account: data.name ?? data.subdomain ?? String(data.id ?? "desconhecido"),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao testar" },
      { status: 500 }
    );
  }
}
