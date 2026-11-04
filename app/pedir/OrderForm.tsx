"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Card,
  Chip,
  Input,
  Label,
  ListBox,
  Select,
  Separator,
  Spinner,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { ArrowRight, CircleCheck, Minus, Plus, ShoppingCart } from "@gravity-ui/icons";
import { WhatsAppIcon } from "../components/BrandIcons";
import { money as fmt } from "@/lib/format";
import type { Category, Dish } from "@/lib/types";
import { btn } from "@/lib/ui";
import { createOrder } from "./actions";

type Mode = "delivery" | "recojo";

export default function OrderForm({
  categories,
  dishes,
  currency,
  payments,
  address: shopAddress,
}: {
  categories: Category[];
  dishes: Dish[];
  currency: string;
  payments: string[];
  address: string;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<Mode>("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState(payments[0] ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ code: string; url: string } | null>(null);
  const [pending, start] = useTransition();

  const money = (n: number) => fmt(n, currency);
  const items = dishes.filter((d) => (qty[d.id] ?? 0) > 0).map((d) => ({ ...d, qty: qty[d.id] }));
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  const change = (id: string, delta: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, (q[id] ?? 0) + delta)) }));

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return setError("Agrega al menos un plato.");
    if (!name.trim()) return setError("Escribe tu nombre.");
    if (phone.replace(/\D/g, "").length < 9) return setError("Escribe tu número de celular.");
    if (mode === "delivery" && !address.trim()) return setError("Escribe la dirección de entrega.");
    setError("");

    start(async () => {
      const r = await createOrder({ items: items.map((i) => ({ id: i.id, qty: i.qty })), name, phone, mode, address, payment, notes });
      if (!r.ok) return setError(r.error);
      setDone({ code: r.code, url: r.url });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ── Pedido registrado ──
  if (done)
    return (
      <Card className="max-w-xl bg-ink p-6 text-cream sm:p-8">
        <Card.Header>
          <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <CircleCheck className="size-6" />
          </span>
          <Card.Title className="mt-3 text-sm font-semibold uppercase tracking-wider text-accent">Pedido registrado</Card.Title>
          <p className="text-6xl font-black text-cream">#{done.code}</p>
          <Card.Description className="text-cream/75">
            Último paso: envíanos el pedido por WhatsApp para confirmarlo. El mensaje ya está escrito.
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <a href={done.url} target="_blank" rel="noopener noreferrer" className={btn({ variant: "primary", size: "lg", fullWidth: true })}>
            <WhatsAppIcon /> Enviar por WhatsApp
          </a>
        </Card.Footer>
      </Card>
    );

  return (
    <form onSubmit={send} className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-10">
      {/* ── Paso 1: platos ── */}
      <div className="space-y-6">
        {categories.map((c) => {
          const list = dishes.filter((d) => d.categoryId === c.id);
          if (!list.length) return null;
          return (
            <Card key={c.id} className="p-0">
              <Card.Header className="px-5 pt-5">
                <Card.Title className="text-xl font-extrabold">{c.name}</Card.Title>
              </Card.Header>
              <ul className="divide-y divide-separator">
                {list.map((d) => {
                  const n = qty[d.id] ?? 0;
                  return (
                    <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="font-semibold leading-tight">{d.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{d.desc}</p>
                        <p className="mt-1 text-sm font-bold text-leaf">{currency} {d.price}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button isIconOnly size="sm" variant="tertiary" aria-label={`Quitar ${d.name}`} isDisabled={n === 0} onPress={() => change(d.id, -1)}>
                          <Minus />
                        </Button>
                        <span className="w-6 text-center font-bold tabular-nums" aria-live="polite">{n}</span>
                        <Button isIconOnly size="sm" variant="primary" aria-label={`Agregar ${d.name}`} onPress={() => change(d.id, 1)}>
                          <Plus />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* Barra fija en móvil para ver el total sin bajar */}
      {count > 0 && (
        <a href="#resumen" className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-2xl bg-ink px-5 py-4 text-cream shadow-xl lg:hidden">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingCart className="size-4" /> {count} {count === 1 ? "plato" : "platos"} ·{" "}
            <span className="text-accent">{money(total)}</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-accent">
            Continuar <ArrowRight className="size-4" />
          </span>
        </a>
      )}

      {/* ── Paso 2: resumen y datos ── */}
      <aside id="resumen" className="scroll-mt-20 space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="bg-ink p-5 text-cream">
          <Card.Header>
            <Card.Title className="flex items-center justify-between text-cream">
              <span className="font-extrabold">Tu pedido</span>
              <Chip color="accent" variant="primary" size="sm">{count} platos</Chip>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {items.length ? (
              <ul className="space-y-2">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4 text-sm">
                    <span><b className="text-accent">{i.qty}×</b> {i.name}</span>
                    <span className="shrink-0 tabular-nums">{money(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-cream/60">Aún no agregas platos.</p>
            )}
            <Separator className="my-4 bg-cream/15" />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-cream/70">Total</span>
              <span className="text-3xl font-black text-accent">{money(total)}</span>
            </div>
            {mode === "delivery" && <p className="mt-1 text-right text-xs text-cream/50">+ costo de delivery según zona</p>}
          </Card.Content>
        </Card>

        <Card className="p-5">
          <Card.Header>
            <Card.Title className="font-extrabold">Tus datos</Card.Title>
          </Card.Header>
          <Card.Content className="flex flex-col gap-4">
            <ToggleButtonGroup
              aria-label="Tipo de entrega"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[mode]}
              onSelectionChange={(keys) => setMode(([...keys][0] as Mode) ?? "delivery")}
              className="w-full"
            >
              <ToggleButton id="delivery" className="flex-1">Delivery</ToggleButton>
              <ToggleButton id="recojo" className="flex-1">
                <ToggleButtonGroup.Separator />
                Recojo en local
              </ToggleButton>
            </ToggleButtonGroup>

            <TextField value={name} onChange={setName} autoComplete="name">
              <Label>Nombre</Label>
              <Input placeholder="¿A nombre de quién?" />
            </TextField>

            <TextField value={phone} onChange={setPhone} type="tel" autoComplete="tel">
              <Label>Celular</Label>
              <Input placeholder="987 654 321" inputMode="tel" />
            </TextField>

            {mode === "delivery" ? (
              <TextField value={address} onChange={setAddress} autoComplete="street-address">
                <Label>Dirección de entrega</Label>
                <Input placeholder="Calle, número, referencia" />
              </TextField>
            ) : (
              <p className="rounded-xl bg-default px-4 py-3 text-sm">Recoges en: <b>{shopAddress}</b></p>
            )}

            <Select value={payment} onChange={(v) => setPayment(String(v ?? payments[0]))} fullWidth>
              <Label>Forma de pago</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {payments.map((p) => (
                    <ListBox.Item key={p} id={p} textValue={p}>
                      {p}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>

            <TextField value={notes} onChange={setNotes}>
              <Label>Notas (opcional)</Label>
              <TextArea rows={2} placeholder="Sin ají, extra cancha…" />
            </TextField>

            {error && (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                </Alert.Content>
              </Alert>
            )}

            <Button type="submit" size="lg" fullWidth isPending={pending}>
              {({ isPending }) => (
                <>
                  {isPending ? <Spinner color="current" size="sm" /> : <ShoppingCart />}
                  {isPending ? "Registrando…" : "Hacer pedido"}
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted">Después te pediremos enviarlo por WhatsApp para confirmarlo.</p>
          </Card.Content>
        </Card>
      </aside>
    </form>
  );
}
