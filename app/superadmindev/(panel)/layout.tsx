import type { Metadata } from "next";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import AdminShell from "./AdminShell";
import { hasRedis } from "@/lib/redis";
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
      {process.env.VERCEL && !hasRedis && (
        <Alert status="warning" className="mb-6">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Los cambios no se pueden guardar todavía</Alert.Title>
            <Alert.Description>
              En Vercel hay que conectar Upstash Redis desde Storage para guardar pedidos, carta y ajustes.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      {children}
    </AdminShell>
  );
}
