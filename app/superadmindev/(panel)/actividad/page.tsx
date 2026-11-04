import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { dateTime } from "@/lib/format";
import { Card, PageIntro } from "../ui";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export default async function ActividadPage() {
  await requireAdmin();
  const db = await getDb();
  return (
    <>
      <PageIntro title="Registro de actividad" text="Cada cambio hecho en el panel y cada pedido recibido queda anotado aquí (últimos 300)." />
      <Card>
        {db.activity.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">Sin actividad todavía.</p>
        ) : (
          <ol className="divide-y divide-separator">
            {db.activity.map((a, i) => (
              <li key={i} className="flex gap-4 px-5 py-3 text-sm">
                <span className="w-32 shrink-0 pt-0.5 text-xs tabular-nums text-muted">{dateTime(a.at)}</span>
                <span>{a.text}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </>
  );
}
