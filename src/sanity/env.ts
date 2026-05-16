export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-05-03';

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

if (!projectId) {
  throw new Error(
    '[Sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is required. Catalog cannot run without live Sanity configuration.'
  );
}
