import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { seed } from "./seed";

import type { Db } from "./types";
export * from "./types";

// ── Almacenamiento en archivo JSON ─────────────────
// Funciona en local o en un servidor propio (VPS). En hosting sin disco
// persistente (ej. Vercel) habría que cambiar esto por una base de datos.
const FILE = path.join(process.cwd(), "data", "db.json");

let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<Db> {
  try {
    return { ...structuredClone(seed), ...JSON.parse(await readFile(FILE, "utf8")) };
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    const db = structuredClone(seed);
    await save(db);
    return db;
  }
}

async function save(db: Db) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(db, null, 2));
  await rename(tmp, FILE); // escritura atómica: nunca queda un archivo a medias
}

export function getDb(): Promise<Db> {
  return queue.then(load);
}

/** Cambia los datos de forma segura (una escritura a la vez). */
export function updateDb<T>(fn: (db: Db) => T, activity?: string | ((result: T) => string)): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = fn(db);
    const text = typeof activity === "function" ? activity(result) : activity;
    if (text) {
      db.activity.unshift({ at: new Date().toISOString(), text });
      db.activity = db.activity.slice(0, 300);
    }
    await save(db);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}

export const newId = () => randomUUID().slice(0, 8);

export const whatsappUrl = (number: string, text: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
