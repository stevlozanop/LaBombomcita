import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { dayKey, lastDays, money, time, weekday } from "@/lib/format";
import { Clock, Database, House, ListUl } from "@gravity-ui/icons";
import OrdersToggle from "../OrdersToggle";
import { Card, PageIntro, RowLink, Stat, StatusPill } from "../ui";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export default async function ResumenPage() {
  const { user } = await requireAdmin();
  const db = await getDb();
  const cur = db.settings.currency;

  const today = dayKey(lastDays(1)[0]);
  const valid = db.orders.filter((o) => o.status !== "cancelado");
  const todays = valid.filter((o) => dayKey(o.createdAt) === today);
  const pending = db.orders.filter((o) => o.status === "nuevo" || o.status === "preparando");
  const available = db.dishes.filter((d) => d.available).length;

  // Ventas de los últimos 7 días
  const days = lastDays(7).map((d) => {
    const key = dayKey(d);
    return { label: weekday(d), total: valid.filter((o) => dayKey(o.createdAt) === key).reduce((s, o) => s + o.total, 0) };
  });
  const max = Math.max(1, ...days.map((d) => d.total));

  return (
    <>
      <PageIntro title={`Hola, ${user}`} text="Así va el local hoy." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat accent label="Ventas hoy" value={money(todays.reduce((s, o) => s + o.total, 0), cur)} hint="Sin contar cancelados" />
        <Stat label="Pedidos hoy" value={todays.length} />
        <Stat label="Por atender" value={pending.length} hint="Nuevos y en preparación" />
        <Stat label="Platos disponibles" value={`${available}/${db.dishes.length}`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card title="Últimos pedidos" action={<Link href="/superadmindev/pedidos" className="text-sm font-semibold hover:underline">Ver todos →</Link>}>
            {db.orders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted">Todavía no hay pedidos. Aparecerán aquí cuando un cliente pida desde la web.</p>
            ) : (
              <ul className="divide-y divide-separator">
                {db.orders.slice(0, 6).map((o) => (
                  <li key={o.id} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="w-14 shrink-0 font-bold tabular-nums">#{o.code}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{o.name}</span>
                      <span className="block text-xs text-muted">
                        {time(o.createdAt)} · {o.mode === "delivery" ? "Delivery" : "Recojo"}
                      </span>
                    </span>
                    <span className="hidden text-sm font-semibold tabular-nums sm:block">{money(o.total, cur)}</span>
                    <StatusPill status={o.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Ventas · últimos 7 días">
            <div className="flex h-44 items-end gap-2 px-5 pb-4 pt-6">
              {days.map((d, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs text-muted">{d.total ? Math.round(d.total) : ""}</span>
                  <div
                    className={`w-full rounded-lg ${i === 6 ? "bg-accent" : "bg-default"}`}
                    style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }}
                    title={money(d.total, cur)}
                  />
                  <span className="text-xs font-medium capitalize text-muted">{d.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Estado del local">
            <div className="px-5 py-4">
              <OrdersToggle open={db.settings.ordersOpen} />
            </div>
          </Card>

          <Card title="Accesos rápidos">
            <div className="divide-y divide-separator">
              <RowLink href="/superadmindev/carta" title="Carta y precios" text={`${db.dishes.length} platos · ${db.categories.length} categorías`} icon={<ListUl />} />
              <RowLink href="/superadmindev/horario" title="Horario" text={db.hours.map((h) => h.day).join(", ")} icon={<Clock />} />
              <RowLink href="/superadmindev/negocio" title="Datos del local" text={db.settings.address} icon={<House />} />
              <RowLink href="/superadmindev/respaldo" title="Respaldo" text="Descargar copia de los datos" icon={<Database />} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
