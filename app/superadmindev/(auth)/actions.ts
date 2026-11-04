"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkCredentials,
  clearFails,
  createSession,
  destroySession,
  isLocked,
  registerFail,
} from "@/lib/auth";
import { updateDb } from "@/lib/db";

export type LoginState = { error?: string; user?: string };

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";

  if (isLocked(ip)) return { error: "Demasiados intentos. Espera 10 minutos." };

  const user = String(form.get("user") ?? "").trim().slice(0, 100);
  const password = String(form.get("password") ?? "").slice(0, 200);

  if (!checkCredentials(user, password)) {
    registerFail(ip);
    await new Promise((r) => setTimeout(r, 600)); // frena ataques de fuerza bruta
    return { error: "Usuario o contraseña incorrectos.", user };
  }

  clearFails(ip);
  await createSession(user);
  await updateDb(() => {}, `Inicio de sesión de ${user}`);
  redirect("/superadmindev/resumen");
}

export async function logout() {
  await destroySession();
  redirect("/superadmindev");
}
