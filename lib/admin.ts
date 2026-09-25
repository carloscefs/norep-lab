/**
 * Usuários com acesso às telas administrativas (ex.: edição de links de vídeo).
 * Configurado por `ADMIN_USERNAMES` (lista separada por vírgula). Padrão: carloscefs.
 */
export function isAdminUsername(username: string | null | undefined): boolean {
  if (!username) return false;
  const list = (process.env.ADMIN_USERNAMES ?? "carloscefs")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(username.toLowerCase());
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Extrai o id de um link do YouTube (watch, youtu.be, shorts, embed) ou de um id puro. */
export function extractYoutubeId(input: string): string | null {
  const s = input.trim();
  if (YT_ID.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      return YT_ID.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v && YT_ID.test(v)) return v;
      const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {
    return null;
  }
  return null;
}
