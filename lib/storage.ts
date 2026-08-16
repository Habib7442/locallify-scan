const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function getPublicAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/page-assets/${path}`;
}
