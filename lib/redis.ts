import "server-only";

// Cliente mínimo para Upstash Redis por su API REST (sin dependencias).
// Vercel crea estas variables al conectar Upstash desde "Storage";
// también se aceptan los nombres que usa Upstash directamente.
const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const hasRedis = Boolean(URL && TOKEN);

export async function redis<T = unknown>(...command: (string | number)[]): Promise<T> {
  if (!URL || !TOKEN) throw new Error("Redis no está configurado");
  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command.map(String)),
    cache: "no-store",
  });
  const data = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || data.error) throw new Error(`Redis: ${data.error ?? res.status}`);
  return data.result as T;
}

/** Suma 1 a un contador que se borra solo tras `seconds`. Devuelve el total. */
export async function hit(key: string, seconds: number): Promise<number> {
  const n = await redis<number>("INCR", key);
  if (n === 1) await redis("EXPIRE", key, seconds);
  return n;
}
