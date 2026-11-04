"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { newId, updateDb, whatsappUrl, type Order } from "@/lib/db";
import { money } from "@/lib/format";

export type OrderInput = {
  items: { id: string; qty: number }[];
  name: string;
  phone: string;
  mode: "delivery" | "recojo";
  address: string;
  payment: string;
  notes: string;
};
export type OrderResult = { ok: true; code: string; url: string } | { ok: false; error: string };

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

// Límite simple: máx. 8 pedidos cada 10 minutos por IP
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  recent.set(ip, list);
  return list.length > 8;
}

export async function createOrder(input: OrderInput): Promise<OrderResult> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooMany(ip)) return { ok: false, error: "Hiciste muchos pedidos seguidos. Intenta en unos minutos." };

  const name = text(input.name, 60);
  const phone = text(input.phone, 20).replace(/[^\d+]/g, "");
  const mode = input.mode === "recojo" ? "recojo" : "delivery";
  const address = mode === "delivery" ? text(input.address, 150) : "";
  const notes = text(input.notes, 300);

  if (!name) return { ok: false, error: "Escribe tu nombre." };
  if (phone.replace(/\D/g, "").length < 9) return { ok: false, error: "Escribe un celular válido." };
  if (mode === "delivery" && !address) return { ok: false, error: "Escribe la dirección de entrega." };
  if (!Array.isArray(input.items) || !input.items.length) return { ok: false, error: "Agrega al menos un plato." };

  try {
    const { order, settings } = await updateDb((db) => {
      if (!db.settings.ordersOpen) throw new Error("closed");
      // Los precios se toman de la carta guardada, nunca del navegador
      const items = input.items.slice(0, 40).flatMap(({ id, qty }) => {
        const d = db.dishes.find((x) => x.id === id && x.available);
        const n = Math.floor(Number(qty));
        return d && n >= 1 && n <= 20 ? [{ name: d.name, price: d.price, qty: n }] : [];
      });
      if (!items.length) throw new Error("empty");
      const payment = db.settings.payments.includes(input.payment) ? input.payment : db.settings.payments[0];

      const order: Order = {
        id: newId(),
        code: String(db.nextOrder++).padStart(4, "0"),
        createdAt: new Date().toISOString(),
        items,
        total: items.reduce((s, i) => s + i.price * i.qty, 0),
        name,
        phone,
        mode,
        address,
        payment,
        notes,
        status: "nuevo",
      };
      db.orders.unshift(order);
      db.orders = db.orders.slice(0, 2000);
      db.activity.unshift({ at: order.createdAt, text: `Nuevo pedido #${order.code} de ${name}` });
      return { order, settings: db.settings };
    });

    revalidatePath("/superadmindev", "layout");

    const c = settings.currency;
    const lines = [
      `Hola ${settings.name}, acabo de hacer el pedido #${order.code}:`,
      "",
      ...order.items.map((i) => `• ${i.qty} x ${i.name} — ${money(i.price * i.qty, c)}`),
      "",
      `Total: ${money(order.total, c)}${mode === "delivery" ? " (+ delivery)" : ""}`,
      "",
      `Nombre: ${name}`,
      `Celular: ${phone}`,
      mode === "delivery" ? `Entrega: Delivery a ${address}` : "Entrega: Recojo en local",
      `Pago: ${order.payment}`,
      ...(notes ? [`Notas: ${notes}`] : []),
    ];
    return { ok: true, code: order.code, url: whatsappUrl(settings.whatsapp, lines.join("\n")) };
  } catch (e) {
    const m = (e as Error).message;
    if (m === "closed") return { ok: false, error: "En este momento no estamos recibiendo pedidos." };
    if (m === "empty") return { ok: false, error: "Los platos elegidos ya no están disponibles. Recarga la página." };
    return { ok: false, error: "No se pudo registrar el pedido. Intenta otra vez." };
  }
}
