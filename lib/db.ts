import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { hasRedis, redis } from "./redis";
import { seed } from "./seed";

import type { Db } from "./types";
export * from "./types";

// ── Dónde se guardan los datos ─────────────────────
// · Con Upstash Redis configurado (Vercel): en la base de datos.
// · Sin Redis (tu computadora o un VPS): en el archivo data/db.json.

type Loaded = { db: Db; version: string };

const withSeed = (data: Partial<Db>): Db => ({ ...structuredClone(seed), ...data });

// ── Archivo JSON ──
const FILE = path.join(process.cwd(), "data", "db.json");

const file = {
  async load(): Promise<Loaded> {
    try {
      return { db: withSeed(JSON.parse(await readFile(FILE, "utf8"))), version: "file" };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
      // En Vercel no se puede escribir en disco: se muestran los datos iniciales
      // (solo lectura) hasta que se conecte Upstash Redis.
      if (process.env.VERCEL) return { db: structuredClone(seed), version: "file" };
      const db = structuredClone(seed);
      await file.save(db);
      return { db, version: "file" };
    }
  },
  async save(db: Db): Promise<boolean> {
    if (process.env.VERCEL) {
      throw new Error("Para guardar cambios en Vercel hay que conectar Upstash Redis (Storage).");
    }
    await mkdir(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(db, null, 2));
    await rename(tmp, FILE); // escritura atómica: nunca queda un archivo a medias
    return true;
  },
};

// ── Upstash Redis ──
const KEY = "bomboncita:db";
const VERSION = "bomboncita:version";

// Guarda solo si nadie cambió los datos desde que se leyeron (evita que dos
// cambios a la vez se pisen). Devuelve 1 si guardó, 0 si hubo conflicto.
const SAVE_IF_SAME = `
if (redis.call('GET', KEYS[2]) or '0') ~= ARGV[2] then return 0 end
redis.call('SET', KEYS[1], ARGV[1])
redis.call('INCR', KEYS[2])
return 1`;

const db_redis = {
  async load(): Promise<Loaded> {
    const [raw, version] = await redis<(string | null)[]>("MGET", KEY, VERSION);
    if (!raw) {
      const fresh = structuredClone(seed);
      await redis("SET", KEY, JSON.stringify(fresh), "NX");
      return db_redis.load();
    }
    return { db: withSeed(JSON.parse(raw)), version: version ?? "0" };
  },
  async save(db: Db, version: string): Promise<boolean> {
    const ok = await redis<number>("EVAL", SAVE_IF_SAME, 2, KEY, VERSION, JSON.stringify(db), version);
    return ok === 1;
  },
};

const store = hasRedis ? db_redis : file;

// En el mismo servidor, las escrituras van en fila (una a la vez)
let queue: Promise<unknown> = Promise.resolve();

export function getDb(): Promise<Db> {
  return queue.then(() => store.load()).then((l) => l.db);
}

/** Cambia los datos de forma segura. `fn` puede repetirse si hubo un conflicto. */
export function updateDb<T>(fn: (db: Db) => T, activity?: string | ((result: T) => string)): Promise<T> {
  const run = queue.then(async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { db, version } = await store.load();
      const result = fn(db);
      const text = typeof activity === "function" ? activity(result) : activity;
      if (text) {
        db.activity.unshift({ at: new Date().toISOString(), text });
        db.activity = db.activity.slice(0, 300);
      }
      if (await store.save(db, version)) return result;
    }
    throw new Error("No se pudo guardar: demasiados cambios al mismo tiempo. Intenta otra vez.");
  });
  queue = run.catch(() => {});
  return run;
}

export const newId = () => randomUUID().slice(0, 8);

export const whatsappUrl = (number: string, text: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
