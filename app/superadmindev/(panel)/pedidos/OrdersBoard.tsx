"use client";

import { useState, useTransition } from "react";
import { Button, Card, Chip, ListBox, Select, Separator, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { ArrowRight, Receipt } from "@gravity-ui/icons";
import { WhatsAppIcon } from "@/app/components/BrandIcons";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { dateTime, money } from "@/lib/format";
import { btn } from "@/lib/ui";
import { deleteOrder, setOrderStatus } from "../actions";
import ConfirmDelete from "../ConfirmDelete";
import { StatusPill } from "../ui";

const tabs = ["activos", ...ORDER_STATUSES, "todos"] as const;
type Tab = (typeof tabs)[number];

const nextStep: Partial<Record<OrderStatus, OrderStatus>> = {
  nuevo: "preparando",
  preparando: "en camino",
  "en camino": "entregado",
};
const nextLabel: Partial<Record<OrderStatus, string>> = {
  nuevo: "Empezar a preparar",
  preparando: "Salió / listo",
  "en camino": "Marcar entregado",
};

export default function OrdersBoard({ orders, currency }: { orders: Order[]; currency: string }) {
  const [tab, setTab] = useState<Tab>("activos");
  const [pending, start] = useTransition();

  const filter = (t: Tab) =>
    t === "todos"
      ? orders
      : t === "activos"
        ? orders.filter((o) => ["nuevo", "preparando", "en camino"].includes(o.status))
        : orders.filter((o) => o.status === t);
  const list = filter(tab);

  const run = (fn: () => Promise<unknown>) => start(async () => void (await fn()));

  return (
    <div>
      <div className="mb-6 overflow-x-auto pb-1">
        <ToggleButtonGroup
          aria-label="Filtrar pedidos"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[tab]}
          onSelectionChange={(k) => setTab(([...k][0] as Tab) ?? "activos")}
        >
          {tabs.map((t, i) => (
            <ToggleButton key={t} id={t} size="sm" className="capitalize">
              {i > 0 && <ToggleButtonGroup.Separator />}
              {t}
              <span className="text-xs opacity-60">{filter(t).length}</span>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      {list.length === 0 ? (
        <Card className="items-center py-14 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-default text-muted">
            <Receipt className="size-6" />
          </span>
          <p className="text-muted">No hay pedidos en esta lista.</p>
        </Card>
      ) : (
        <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${pending ? "opacity-70" : ""}`}>
          {list.map((o) => (
            <Card key={o.id} className={o.status === "nuevo" ? "ring-2 ring-accent" : ""}>
              <Card.Header className="flex-row items-start justify-between gap-3">
                <div>
                  <Card.Title className="text-2xl font-black">#{o.code}</Card.Title>
                  <Card.Description>{dateTime(o.createdAt)}</Card.Description>
                </div>
                <StatusPill status={o.status} />
              </Card.Header>

              <Card.Content className="gap-3 text-sm">
                <div>
                  <p className="font-semibold">{o.name}</p>
                  <p className="text-muted">{o.mode === "delivery" ? `Delivery · ${o.address}` : "Recoge en el local"}</p>
                  <p className="text-muted">Pago: {o.payment}</p>
                </div>
                <Separator />
                <ul className="space-y-1">
                  {o.items.map((i, k) => (
                    <li key={k} className="flex justify-between gap-3">
                      <span><b>{i.qty}×</b> {i.name}</span>
                      <span className="shrink-0 tabular-nums text-muted">{money(i.price * i.qty, currency)}</span>
                    </li>
                  ))}
                </ul>
                {o.notes && (
                  <Chip color="warning" variant="soft" className="h-auto whitespace-normal py-1.5">
                    Nota: {o.notes}
                  </Chip>
                )}
                <Separator />
                <p className="flex items-baseline justify-between">
                  <span className="text-muted">Total</span>
                  <span className="text-xl font-black">{money(o.total, currency)}</span>
                </p>
              </Card.Content>

              <Card.Footer className="mt-auto flex-col items-stretch gap-2">
                {nextStep[o.status] && (
                  <Button fullWidth isDisabled={pending} onPress={() => run(() => setOrderStatus(o.id, nextStep[o.status]!))}>
                    {nextLabel[o.status]} <ArrowRight />
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Select
                    aria-label="Cambiar estado"
                    value={o.status}
                    isDisabled={pending}
                    onChange={(v) => v && run(() => setOrderStatus(o.id, v as OrderStatus))}
                    className="min-w-0 flex-1"
                  >
                    <Select.Trigger>
                      <Select.Value className="capitalize" />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {ORDER_STATUSES.map((s) => (
                          <ListBox.Item key={s} id={s} textValue={s} className="capitalize">
                            {s}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {o.phone && (
                    <a
                      href={`https://wa.me/${o.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Escribir al cliente por WhatsApp"
                      title="Escribir al cliente"
                      className={btn({ variant: "tertiary", size: "sm", isIconOnly: true })}
                    >
                      <WhatsAppIcon />
                    </a>
                  )}
                  <ConfirmDelete
                    label="Eliminar pedido"
                    title={`¿Eliminar el pedido #${o.code}?`}
                    description="Se borrará del historial. Esta acción no se puede deshacer."
                    isDisabled={pending}
                    onConfirm={() => run(() => deleteOrder(o.id))}
                  />
                </div>
              </Card.Footer>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
