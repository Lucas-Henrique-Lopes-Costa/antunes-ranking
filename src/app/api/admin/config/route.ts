import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveAuthConfig, exchangeCodeForTokens } from "@/lib/kommo/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configs = await prisma.appConfig.findMany({
      where: {
        key: {
          in: [
            "kommo_subdomain",
            "kommo_client_id",
            "kommo_redirect_uri",
            "kommo_expires_at",
          ],
        },
      },
    });

    const configMap: Record<string, unknown> = {};
    for (const c of configs) {
      configMap[c.key] = c.value;
    }

    // Check if connected
    const hasToken = await prisma.appConfig.findUnique({
      where: { key: "kommo_access_token" },
    });

    return NextResponse.json({
      ...configMap,
      isConnected: !!hasToken,
    });
  } catch (error) {
    console.error("Erro ao buscar config:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subdomain, clientId, clientSecret, redirectUri, authorizationCode, accessToken } = body;

    await saveAuthConfig({
      subdomain,
      clientId,
      clientSecret,
      redirectUri,
    });

    if (accessToken) {
      await saveAuthConfig({ accessToken });
      await prisma.appConfig.deleteMany({
        where: { key: { in: ["kommo_expires_at", "kommo_refresh_token"] } },
      });
      return NextResponse.json({ success: true, message: "Token salvo" });
    }

    if (authorizationCode) {
      await exchangeCodeForTokens(authorizationCode);
      return NextResponse.json({ success: true, message: "Conectado ao Kommo com sucesso!" });
    }

    return NextResponse.json({ success: true, message: "Configurações salvas" });
  } catch (error) {
    console.error("Erro ao salvar config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao salvar" },
      { status: 500 }
    );
  }
}
