"use server";

// Acciones del panel. Cada una vuelve a comprobar la sesión: las acciones
// del servidor son accesibles por URL, no basta con proteger la página.

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { PUBLIC_TAG } from "@/lib/public-data";
import { newId, ORDER_STATUSES, updateDb, type Hour, type OrderStatus } from "@/lib/db";

export type Result = { ok: boolean; error?: string };

const text = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
// Refresca la web pública (caché) y las pantallas del panel
const refresh = () => {
  updateTag(PUBLIC_TAG);
  revalidatePath("/superadmindev", "layout");
};

// ── Pedidos ────────────────────────────────────────
export async function setOrderStatus(id: string, status: OrderStatus): Promise<Result> {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "Estado no válido." };
  await updateDb((db) => {
    const o = db.orders.find((x) => x.id === id);
    if (!o) throw new Error("Pedido no encontrado");
    o.status = status;
    return o.code;
  }, (code) => `Pedido #${code} → ${status}`);
  refresh();
  return { ok: true };
}

export async function deleteOrder(id: string): Promise<Result> {
  await requireAdmin();
  await updateDb((db) => {
    const o = db.orders.find((x) => x.id === id);
    db.orders = db.orders.filter((x) => x.id !== id);
    return o?.code;
  }, (code) => `Pedido #${code} eliminado`);
  refresh();
  return { ok: true };
}

// ── Carta ──────────────────────────────────────────
export async function saveDish(input: {
  id?: string;
  categoryId: string;
  name: string;
  desc: string;
  price: number;
  available: boolean;
}): Promise<Result> {
  await requireAdmin();
  const name = text(input.name, 80);
  const desc = text(input.desc, 200);
  const price = Math.round(Number(input.price) * 100) / 100;
  if (!name) return { ok: false, error: "El plato necesita un nombre." };
  if (!Number.isFinite(price) || price < 0 || price > 10000) return { ok: false, error: "Precio no válido." };

  await updateDb((db) => {
    if (!db.categories.some((c) => c.id === input.categoryId)) throw new Error("Categoría no existe");
    const data = { categoryId: input.categoryId, name, desc, price, available: !!input.available };
    const d = input.id && db.dishes.find((x) => x.id === input.id);
    if (d) Object.assign(d, data);
    else db.dishes.push({ id: newId(), ...data });
  }, `${input.id ? "Plato editado" : "Plato creado"}: ${name}`);
  refresh();
  return { ok: true };
}

export async function toggleDish(id: string): Promise<Result> {
  await requireAdmin();
  await updateDb((db) => {
    const d = db.dishes.find((x) => x.id === id);
    if (!d) throw new Error("Plato no encontrado");
    d.available = !d.available;
    return `${d.name} ${d.available ? "disponible" : "agotado"}`;
  }, (text) => text);
  refresh();
  return { ok: true };
}

export async function deleteDish(id: string): Promise<Result> {
  await requireAdmin();
  await updateDb((db) => {
    db.dishes = db.dishes.filter((x) => x.id !== id);
  }, "Plato eliminado");
  refresh();
  return { ok: true };
}

export async function saveCategory(input: { id?: string; name: string }): Promise<Result> {
  await requireAdmin();
  const name = text(input.name, 40);
  if (!name) return { ok: false, error: "La categoría necesita un nombre." };
  await updateDb((db) => {
    const c = input.id && db.categories.find((x) => x.id === input.id);
    if (c) c.name = name;
    else db.categories.push({ id: newId(), name });
  }, `Categoría guardada: ${name}`);
  refresh();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireAdmin();
  return updateDb((db) => {
    if (db.dishes.some((d) => d.categoryId === id))
      return { ok: false, error: "Primero elimina o mueve los platos de esta categoría." };
    db.categories = db.categories.filter((c) => c.id !== id);
    return { ok: true };
  }, "Categoría eliminada").then((r) => {
    refresh();
    return r;
  });
}

// ── Horario ────────────────────────────────────────
export async function saveHours(rows: Hour[]): Promise<Result> {
  await requireAdmin();
  const clean = rows
    .slice(0, 14)
    .map((r) => ({ id: r.id || newId(), day: text(r.day, 40), time: text(r.time, 40) }))
    .filter((r) => r.day);
  await updateDb((db) => {
    db.hours = clean;
  }, "Horario actualizado");
  refresh();
  return { ok: true };
}

// ── Datos del local ────────────────────────────────
export async function saveSettings(form: FormData): Promise<Result> {
  await requireAdmin();
  const whatsapp = text(form.get("whatsapp"), 20).replace(/\D/g, "");
  if (whatsapp.length < 8) return { ok: false, error: "WhatsApp: escribe el número con código de país (ej. 51987654321)." };
  const url = (v: unknown) => {
    const s = text(v, 300);
    return s === "" || /^https:\/\//.test(s) ? s : null;
  };
  const mapsUrl = url(form.get("mapsUrl"));
  const instagram = url(form.get("instagram"));
  if (mapsUrl === null || instagram === null) return { ok: false, error: "Los enlaces deben empezar con https://" };
  const payments = text(form.get("payments"), 300)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);

  await updateDb((db) => {
    Object.assign(db.settings, {
      name: text(form.get("name"), 60) || db.settings.name,
      phone: text(form.get("phone"), 30),
      address: text(form.get("address"), 150),
      currency: text(form.get("currency"), 5) || "S/",
      whatsapp,
      mapsUrl,
      instagram,
      payments: payments.length ? payments : ["Efectivo"],
    });
  }, "Datos del local actualizados");
  refresh();
  return { ok: true };
}

export async function setOrdersOpen(open: boolean): Promise<Result> {
  await requireAdmin();
  await updateDb((db) => {
    db.settings.ordersOpen = !!open;
  }, open ? "Pedidos abiertos" : "Pedidos cerrados");
  refresh();
  return { ok: true };
}
