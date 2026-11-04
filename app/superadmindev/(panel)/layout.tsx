import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { getDb, isTemporaryStorage } from "@/lib/db";
import AdminShell from "./AdminShell";
import { Alert } from "@heroui/react";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export const metadata: Metadata = {
  title: "Panel — La Bomboncita",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  const db = await getDb();
  const jar = await cookies();
  const initialOpen = jar.get("bm-sidebar")?.value !== "0";
  const initialDark = jar.get("bm-theme")?.value === "dark";
  const newOrders = db.orders.filter((o) => o.status === "nuevo").length;

  return (
    <AdminShell user={user} newOrders={newOrders} ordersOpen={db.settings.ordersOpen} initialOpen={initialOpen} initialDark={initialDark}>
      {isTemporaryStorage && (
        <Alert status="warning" className="mb-6">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Guardado temporal</Alert.Title>
            <Alert.Description>
              Los cambios y pedidos se guardan en un JSON temporal del servidor y se borran cuando Vercel lo
              reinicia. Para guardarlos para siempre, conecta Upstash Redis en Storage.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      {children}
    </AdminShell>
  );
}
