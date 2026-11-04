import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

const COOKIE = "bm_admin";
const MAX_AGE = 60 * 60 * 12; // 12 horas
export const LOGIN_PATH = "/superadmindev";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("Falta SESSION_SECRET (mín. 32 caracteres) en .env.local");
  return s;
}

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

// Compara en tiempo constante para no filtrar información por tiempos de respuesta
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(user: string, password: string) {
  const u = process.env.ADMIN_USER;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p) throw new Error("Faltan ADMIN_USER / ADMIN_PASSWORD en .env.local");
  // Se evalúan ambas siempre (sin cortocircuito)
  const okUser = safeEqual(user, u);
  const okPass = safeEqual(password, p);
  return okUser && okPass;
}

export async function createSession(user: string) {
  const payload = Buffer.from(JSON.stringify({ u: user, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<{ user: string } | null> {
  await connection(); // siempre en el momento de la visita, nunca prerenderizado
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || !safeEqual(sig, sign(payload))) return null;
  try {
    const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof u !== "string" || typeof exp !== "number" || exp < Date.now()) return null;
    return { user: u };
  } catch {
    return null;
  }
}

/** Úsalo al inicio de cada página y acción del panel. */
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect(LOGIN_PATH);
  return s;
}

// ── Freno de intentos fallidos (en memoria, por IP) ──
const attempts = new Map<string, { count: number; until: number }>();
const MAX_TRIES = 5;
const LOCK_MS = 10 * 60 * 1000;

export function isLocked(ip: string) {
  const a = attempts.get(ip);
  return !!a && a.count >= MAX_TRIES && a.until > Date.now();
}
export function registerFail(ip: string) {
  const a = attempts.get(ip);
  const count = a && a.until > Date.now() ? a.count + 1 : 1;
  attempts.set(ip, { count, until: Date.now() + LOCK_MS });
}
export function clearFails(ip: string) {
  attempts.delete(ip);
}
