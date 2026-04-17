import { prisma } from "@/lib/prisma";
import type { KommoAuthConfig, KommoTokenResponse } from "@/types/kommo";

export async function getAuthConfig(): Promise<KommoAuthConfig> {
  const configs = await prisma.appConfig.findMany({
    where: {
      key: {
        in: [
          "kommo_subdomain",
          "kommo_client_id",
          "kommo_client_secret",
          "kommo_redirect_uri",
          "kommo_access_token",
          "kommo_refresh_token",
          "kommo_expires_at",
        ],
      },
    },
  });

  const configMap = new Map(configs.map((c) => [c.key, c.value as string]));

  return {
    subdomain: configMap.get("kommo_subdomain") ?? process.env.KOMMO_SUBDOMAIN ?? "",
    clientId: configMap.get("kommo_client_id") ?? process.env.KOMMO_CLIENT_ID ?? "",
    clientSecret: configMap.get("kommo_client_secret") ?? process.env.KOMMO_CLIENT_SECRET ?? "",
    redirectUri: configMap.get("kommo_redirect_uri") ?? process.env.KOMMO_REDIRECT_URI ?? "",
    accessToken: configMap.get("kommo_access_token") ?? process.env.KOMMO_ACCESS_TOKEN,
    refreshToken: configMap.get("kommo_refresh_token") ?? process.env.KOMMO_REFRESH_TOKEN,
    expiresAt: configMap.get("kommo_expires_at")
      ? Number(configMap.get("kommo_expires_at"))
      : undefined,
  };
}

export async function saveAuthConfig(config: Partial<KommoAuthConfig>): Promise<void> {
  const entries: { key: string; value: string }[] = [];

  if (config.subdomain) entries.push({ key: "kommo_subdomain", value: config.subdomain });
  if (config.clientId) entries.push({ key: "kommo_client_id", value: config.clientId });
  if (config.clientSecret) entries.push({ key: "kommo_client_secret", value: config.clientSecret });
  if (config.redirectUri) entries.push({ key: "kommo_redirect_uri", value: config.redirectUri });
  if (config.accessToken) entries.push({ key: "kommo_access_token", value: config.accessToken });
  if (config.refreshToken) entries.push({ key: "kommo_refresh_token", value: config.refreshToken });
  if (config.expiresAt) entries.push({ key: "kommo_expires_at", value: String(config.expiresAt) });

  for (const entry of entries) {
    await prisma.appConfig.upsert({
      where: { key: entry.key },
      update: { value: entry.value },
      create: { key: entry.key, value: entry.value },
    });
  }
}

export async function exchangeCodeForTokens(code: string): Promise<KommoTokenResponse> {
  const config = await getAuthConfig();

  const response = await fetch(
    `https://${config.subdomain}.kommo.com/oauth2/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao trocar código: ${response.status} - ${body}`);
  }

  const tokens: KommoTokenResponse = await response.json();

  await saveAuthConfig({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  });

  return tokens;
}

export async function refreshAccessToken(): Promise<KommoTokenResponse> {
  const config = await getAuthConfig();

  if (!config.refreshToken) {
    throw new Error("Refresh token não disponível. Reconecte ao Kommo.");
  }

  const response = await fetch(
    `https://${config.subdomain}.kommo.com/oauth2/access_token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "refresh_token",
        refresh_token: config.refreshToken,
        redirect_uri: config.redirectUri,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Falha ao renovar token: ${response.status} - ${body}`);
  }

  const tokens: KommoTokenResponse = await response.json();

  await saveAuthConfig({
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  });

  return tokens;
}
