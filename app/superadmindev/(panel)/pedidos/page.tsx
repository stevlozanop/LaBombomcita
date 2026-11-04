import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { PageIntro } from "../ui";
import OrdersBoard from "./OrdersBoard";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export default async function PedidosPage() {
  await requireAdmin();
  const db = await getDb();
  return (
    <>
      <PageIntro title="Pedidos en vivo" text="Se actualiza solo cada 20 segundos. Cambia el estado a medida que avanzas." />
      <OrdersBoard orders={db.orders} currency={db.settings.currency} />
    </>
  );
}
