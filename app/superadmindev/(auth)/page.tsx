import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CircleQuestion, Clock, Database, ListUl, Lock, Receipt, Shield } from "@gravity-ui/icons";
import { getSession } from "@/lib/auth";
import { getPublicData } from "@/lib/public-data";
import { btn, chip } from "@/lib/ui";
import salon from "@/public/img/local/salon.webp";
import LoginForm from "./LoginForm";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export const metadata: Metadata = {
  title: "Acceso — La Bomboncita",
  robots: { index: false, follow: false },
};

const features = [
  { icon: Receipt, title: "Pedidos en vivo", text: "Recibe, prepara y entrega cada pedido de la web." },
  { icon: ListUl, title: "Carta y precios", text: "Cambia platos, precios y marca lo que se agotó." },
  { icon: Clock, title: "Horario y datos", text: "Actualiza horario, dirección y WhatsApp." },
  { icon: Database, title: "Respaldo", text: "Descarga una copia de toda la información." },
];

const security = [
  { icon: Lock, text: "La sesión es privada y se cierra sola después de 12 horas." },
  { icon: Shield, text: "Tras 5 intentos fallidos, el acceso se bloquea 10 minutos." },
  { icon: CircleQuestion, text: "¿Olvidaste la contraseña? Está en la configuración del servidor del local." },
];

export default async function LoginPage() {
  if (await getSession()) redirect("/superadmindev/resumen");
  const { settings } = await getPublicData();

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* ── Lado izquierdo: foto del local y qué se gestiona ── */}
      <section className="relative hidden overflow-hidden bg-ink text-cream lg:flex">
        <Image src={salon} alt="" placeholder="blur" priority className="absolute inset-0 size-full object-cover opacity-45" sizes="55vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />

        <div className="relative flex w-full flex-col justify-between gap-10 p-10 xl:p-14">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-accent text-xl font-black text-accent-foreground">B</span>
            <div>
              <p className="text-lg font-extrabold leading-tight">{settings.name}</p>
              <p className="text-sm text-cream/60">Cevichería · Restaurant</p>
            </div>
          </div>

          <div>
            <span className={`${chip({ color: "accent", variant: "primary" })} font-semibold`}>Panel de control</span>
            <h1 className="display mt-4 max-w-lg text-5xl xl:text-6xl">Todo el local, en un solo lugar.</h1>

            <ul className="mt-10 grid max-w-xl gap-x-8 gap-y-6 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream/10 text-accent">
                    <f.icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-sm text-cream/65">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-cream/50">{settings.address}</p>
        </div>
      </section>

      {/* ── Lado derecho: el formulario ocupa toda la columna ── */}
      <section className="flex min-h-dvh flex-col">
        {/* Foto pequeña solo en móvil */}
        <div className="relative h-36 overflow-hidden bg-ink lg:hidden">
          <Image src={salon} alt="" placeholder="blur" className="absolute inset-0 size-full object-cover opacity-50" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
          <div className="absolute bottom-4 left-5 flex items-center gap-2.5 text-cream">
            <span className="grid size-9 place-items-center rounded-full bg-accent font-black text-accent-foreground">B</span>
            <span className="font-extrabold">{settings.name}</span>
          </div>
        </div>

        <header className="flex items-center justify-between gap-3 px-5 py-5 sm:px-10">
          <Link href="/" className={btn({ variant: "ghost", size: "sm" })}>
            <ArrowLeft className="size-4" /> Volver a la web
          </Link>
          <span className={`${chip({ color: "default", variant: "secondary" })} gap-1.5`}>
            <Shield className="size-3.5" /> Acceso restringido
          </span>
        </header>

        <div className="flex flex-1 items-center px-5 py-8 sm:px-10 xl:px-20">
          <div className="w-full max-w-md">
            <p className="text-sm font-semibold text-muted">Superadmin</p>
            <h2 className="display mt-1 text-4xl sm:text-5xl">Inicia sesión</h2>
            <p className="mt-3 text-muted">Ingresa con tu cuenta de administrador para gestionar el local.</p>

            <div className="mt-8">
              <LoginForm />
            </div>

            <ul className="mt-10 space-y-3 border-t border-separator pt-6">
              {security.map((s) => (
                <li key={s.text} className="flex items-start gap-3 text-sm text-muted">
                  <s.icon className="mt-0.5 size-4 shrink-0" />
                  <span>{s.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-muted sm:px-10">
          <span>© 2026 {settings.name}</span>
          <span>Panel de administración</span>
        </footer>
      </section>
    </main>
  );
}
