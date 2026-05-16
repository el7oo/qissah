import { createClient } from '@insforge/sdk';

function createInsforgeServerClient() {
  const baseUrl =
    process.env.INSFORGE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_INSFORGE_BASE_URL?.trim();
  const anonKey =
    process.env.INSFORGE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY?.trim();
  if (!baseUrl || !anonKey) {
    throw new Error('InsForge env vars are not configured for server verification.');
  }
  return createClient({
    baseUrl,
    anonKey,
    isServerMode: true,
  });
}

export async function verifyInsforgeBearerToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const client = createInsforgeServerClient();
  client.getHttpClient().setAuthToken(token);
  const { data, error } = await client.auth.getCurrentUser();
  if (error || !data?.user) {
    return null;
  }
  return data.user;
}
