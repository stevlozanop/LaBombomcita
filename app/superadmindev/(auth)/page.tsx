import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { card, chip } from "@/lib/ui";
import salon from "@/public/img/local/salon.webp";
import LoginForm from "./LoginForm";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export const metadata: Metadata = {
  title: "Acceso — La Bomboncita",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getSession()) redirect("/superadmindev/resumen");

  return (
    <main className="grid min-h-screen gap-3 bg-background p-3 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden rounded-[2rem] bg-ink text-cream lg:block">
        <Image src={salon} alt="" placeholder="blur" className="absolute inset-0 size-full object-cover opacity-40" sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-full bg-accent text-lg font-black text-accent-foreground">B</span>
            <span className="text-lg font-extrabold">La Bomboncita</span>
          </div>
          <div>
            <span className={`${chip({ color: "accent", variant: "primary" })} font-semibold`}>Panel de control</span>
            <h1 className="display mt-4 text-5xl xl:text-6xl">Todo el local, en un solo lugar.</h1>
            <p className="mt-4 max-w-sm text-cream/75">Pedidos, carta, precios, horarios y datos del negocio.</p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-10">
        <div className={`${card.base()} w-full max-w-md p-8 shadow-xl`}>
          <span className="grid size-12 place-items-center rounded-full bg-accent text-xl font-black text-accent-foreground lg:hidden">B</span>
          <div>
            <p className="text-sm font-medium text-muted">Acceso restringido · Superadmin</p>
            <h2 className="display mt-1 text-3xl">Bienvenido</h2>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
