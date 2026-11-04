import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import OrdersToggle from "../OrdersToggle";
import { Card, PageIntro } from "../ui";
import SettingsForm from "./SettingsForm";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export default async function NegocioPage() {
  await requireAdmin();
  const db = await getDb();
  return (
    <>
      <PageIntro title="Datos del local" text="Contacto, dirección y formas de pago que se muestran en la web." />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <SettingsForm settings={db.settings} />
        <Card title="Recepción de pedidos" className="self-start">
          <div className="px-5 py-4">
            <OrdersToggle open={db.settings.ordersOpen} />
          </div>
        </Card>
      </div>
    </>
  );
}
