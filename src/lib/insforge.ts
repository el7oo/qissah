import { createClient } from '@insforge/sdk';

const baseUrlRaw = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL?.trim().replace(/\/+$/, '') ?? '';
const anonKeyRaw = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY?.trim() ?? '';

if (process.env.NODE_ENV === 'production') {
  if (!baseUrlRaw) {
    throw new Error(
      '[InsForge] NEXT_PUBLIC_INSFORGE_BASE_URL is required in production. Remove any hardcoded keys from source and set env (rotate keys that were previously committed).'
    );
  }
  if (!anonKeyRaw) {
    throw new Error('[InsForge] NEXT_PUBLIC_INSFORGE_ANON_KEY is required in production.');
  }
}

export const insforge = createClient({
  baseUrl: baseUrlRaw || 'https://configure-insforge-base-url.invalid',
  anonKey: anonKeyRaw || 'configure-insforge-anon-key',
});

export function getInsforgeAccessToken(): string | null {
  const headers = insforge.getHttpClient().getHeaders();
  const auth = headers.Authorization || headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim() || null;
}
