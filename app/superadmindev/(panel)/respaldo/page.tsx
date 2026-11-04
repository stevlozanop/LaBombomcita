import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Card, PageIntro, Stat, btnPrimary } from "../ui";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export default async function RespaldoPage() {
  await requireAdmin();
  const db = await getDb();
  return (
    <>
      <PageIntro title="Respaldo de datos" text="Descarga una copia de todo: carta, horario, datos del local, pedidos y actividad. Guárdala en un lugar seguro, contiene datos de clientes." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Platos" value={db.dishes.length} />
        <Stat label="Categorías" value={db.categories.length} />
        <Stat label="Pedidos guardados" value={db.orders.length} />
        <Stat label="Registros de actividad" value={db.activity.length} />
      </div>
      <Card title="Copia completa" className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
          <p className="text-sm text-muted">Archivo JSON con toda la información del panel.</p>
          <a href="/superadmindev/respaldo/descargar" className={btnPrimary}>Descargar respaldo ↓</a>
        </div>
      </Card>
    </>
  );
}
