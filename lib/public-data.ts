import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "./db";

export const PUBLIC_TAG = "public-data";

/**
 * Datos que ve el público (en caché). Nunca incluye pedidos ni actividad.
 * El panel invalida esta caché con updateTag(PUBLIC_TAG) al guardar.
 */
export async function getPublicData() {
  "use cache";
  cacheLife("max");
  cacheTag(PUBLIC_TAG);
  const { settings, categories, dishes, hours } = await getDb();
  return { settings, categories, dishes, hours };
}
