import { getAuthConfig, refreshAccessToken } from "./auth";

class KommoApiError extends Error {
  constructor(
    public status: number,
    public body: string
  ) {
    super(`Kommo API Error ${status}: ${body}`);
    this.name = "KommoApiError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function kommoFetch<T>(
  path: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<T> {
  const config = await getAuthConfig();
  if (!config.accessToken) {
    throw new Error("Kommo não configurado: access token ausente");
  }

  const baseUrl = `https://${config.subdomain}.kommo.com`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let token = config.accessToken;

    // Refresh token if expired
    if (config.expiresAt && Date.now() >= config.expiresAt - 60_000) {
      const newTokens = await refreshAccessToken();
      token = newTokens.access_token;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Rate limited
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitMs = retryAfter
        ? parseInt(retryAfter) * 1000
        : Math.min(Math.pow(2, attempt) * 1000, 30_000);
      console.warn(`Kommo rate limit. Aguardando ${waitMs}ms...`);
      await sleep(waitMs);
      continue;
    }

    // Token expired — try refresh once (apenas se tiver refresh_token, ou seja, fluxo OAuth2)
    if (response.status === 401 && attempt === 0 && config.refreshToken) {
      console.warn("Token expirado, renovando...");
      await refreshAccessToken();
      continue;
    }

    // No content (empty result set)
    if (response.status === 204) {
      return { _embedded: { leads: [], users: [], pipelines: [] } } as T;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new KommoApiError(response.status, body);
    }

    return response.json() as Promise<T>;
  }

  throw new Error(`Kommo API: max retries (${maxRetries}) exceeded`);
}
