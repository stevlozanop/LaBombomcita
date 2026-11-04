import { getSession } from "@/lib/auth";
import { getDb, updateDb } from "@/lib/db";
import { dayKey } from "@/lib/format";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  await updateDb(() => {}, "Respaldo descargado");
  const db = await getDb();
  return new Response(JSON.stringify(db, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="bombomcita-respaldo-${dayKey(new Date())}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
