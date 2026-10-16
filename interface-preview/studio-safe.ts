/* Public website adapters. Same-origin demo media only, never device URLs. */
export const studioBusy = (state?: string) => ['running','paused_game'].includes(state || '');
export function studioPreviewURL(value?: string) {
  if (!value) return undefined;
  try {
    const u = new URL(value, location.href), base = new URL('./', location.href);
    if (u.origin === base.origin && u.pathname.startsWith(base.pathname + 'studio-player/')) return u.href;
  } catch {}
  return undefined;
}
export function cinemaMediaURL(value?: string) {
  if (!value) return undefined;
  try {
    const u = new URL(value,location.href);
    if(u.origin === location.origin && /\.(jpg|png|webp|gif|webm|mp4)$/i.test(u.pathname)) return u.href;
  } catch {}
  return undefined;
}
