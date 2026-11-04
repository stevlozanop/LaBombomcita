"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Chip } from "@heroui/react";
import {
  ArrowRightFromSquare,
  ArrowUpRightFromSquare,
  ChartColumn,
  ChevronLeft,
  Clock,
  Database,
  Ellipsis,
  House,
  ListUl,
  Moon,
  Pulse,
  Receipt,
  Sun,
} from "@gravity-ui/icons";
import { logout } from "../(auth)/actions";

const P = "/superadmindev";

const sections = [
  {
    title: "Principal",
    items: [
      { title: "Resumen", href: `${P}/resumen`, icon: ChartColumn },
      { title: "Pedidos", href: `${P}/pedidos`, icon: Receipt, badge: "orders" as const },
      { title: "Carta", href: `${P}/carta`, icon: ListUl },
      { title: "Horario", href: `${P}/horario`, icon: Clock },
    ],
  },
  { title: "Negocio", items: [{ title: "Datos del local", href: `${P}/negocio`, icon: House }] },
  {
    title: "Sistema",
    items: [
      { title: "Actividad", href: `${P}/actividad`, icon: Pulse },
      { title: "Respaldo", href: `${P}/respaldo`, icon: Database },
    ],
  },
];
const all = sections.flatMap((s) => s.items);
const mobileMain = all.slice(0, 4);

// Preferencias guardadas en cookies (las lee el servidor: no hay parpadeo al cargar)
function savePref(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/superadmindev; max-age=31536000; samesite=lax`;
}

// Los diálogos y menús de HeroUI se dibujan fuera del panel (en <body>),
// así que el tema también se aplica a <html> mientras el panel está abierto.
function applyHtmlTheme(dark: boolean) {
  const h = document.documentElement;
  h.classList.toggle("dark", dark);
  h.classList.toggle("light", !dark);
  h.dataset.theme = dark ? "dark" : "light";
}

export default function AdminShell({
  children,
  user,
  newOrders,
  ordersOpen,
  initialOpen,
  initialDark,
}: {
  children: React.ReactNode;
  user: string;
  newOrders: number;
  ordersOpen: boolean;
  initialOpen: boolean;
  initialDark: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [more, setMore] = useState(false);
  const [dark, setDark] = useState(initialDark);

  const toggleTheme = () => {
    savePref("bm-theme", dark ? "light" : "dark");
    setDark(!dark);
  };
  const ThemeIcon = dark ? Sun : Moon;

  useEffect(() => {
    applyHtmlTheme(dark);
    return () => applyHtmlTheme(false); // al salir del panel, la web vuelve a claro
  }, [dark]);

  const toggle = () => {
    savePref("bm-sidebar", open ? "0" : "1");
    setOpen(!open);
  };

  // "En vivo": refresca datos cada 20 s para ver pedidos nuevos
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 20000);
    return () => clearInterval(t);
  }, [router]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const title = all.find((i) => isActive(i.href))?.title ?? "Resumen";

  const navItem = (item: (typeof all)[number]) => {
    const active = isActive(item.href);
    const badge = item.badge === "orders" && newOrders > 0 ? newOrders : null;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={!open ? item.title : undefined}
        className={`group relative flex items-center gap-3 rounded-xl transition-colors ${
          open ? "h-10 px-3" : "mx-auto size-10 justify-center"
        } ${active ? "bg-accent font-semibold text-accent-foreground" : "text-cream/70 hover:bg-cream/10 hover:text-cream"}`}
      >
        <item.icon className="size-4 shrink-0" />
        {open && <span className="truncate text-sm">{item.title}</span>}
        {badge !== null &&
          (open ? (
            <Chip size="sm" color="accent" variant="primary" className={`ml-auto ${active ? "bg-ink text-cream" : ""}`}>
              {badge}
            </Chip>
          ) : (
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-ink" />
          ))}
      </Link>
    );
  };

  const sideButton = (label: string, Icon: typeof Moon, onClick: () => void, rotate = false) => (
    <button
      key={label}
      onClick={onClick}
      title={!open ? label : undefined}
      className={`flex cursor-pointer items-center gap-3 rounded-xl text-cream/60 hover:bg-cream/10 hover:text-cream ${
        open ? "h-10 px-3" : "mx-auto size-10 justify-center"
      }`}
    >
      <Icon className={`size-4 shrink-0 transition-transform ${rotate ? "rotate-180" : ""}`} />
      {open && <span className="text-sm">{label}</span>}
    </button>
  );

  return (
    <div className={`flex h-dvh overflow-hidden bg-background text-foreground ${dark ? "dark" : ""}`}>
      {/* ── Barra lateral (escritorio) ── */}
      <aside
        className={`hidden shrink-0 flex-col bg-ink text-cream transition-[width] duration-200 dark:border-r dark:border-cream/10 dark:bg-[oklch(0.2_0.035_155)] md:flex ${
          open ? "w-64" : "w-[72px]"
        }`}
      >
        <div className={`flex h-16 shrink-0 items-center ${open ? "gap-3 px-5" : "justify-center"}`}>
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-lg font-black text-accent-foreground">
            B
          </span>
          {open && (
            <div className="min-w-0">
              <p className="truncate font-extrabold leading-tight">La Bomboncita</p>
              <p className="text-xs text-cream/50">Panel de control</p>
            </div>
          )}
        </div>

        <nav className={`flex flex-1 flex-col gap-5 overflow-y-auto py-4 ${open ? "px-3" : "px-2"}`}>
          {sections.map((s) => (
            <div key={s.title} className="flex flex-col gap-1">
              {open && <p className="eyebrow mb-1 px-3 text-cream/40">{s.title}</p>}
              {s.items.map(navItem)}
            </div>
          ))}
        </nav>

        <div className={`flex flex-col gap-1 border-t border-cream/10 py-3 ${open ? "px-3" : "px-2"}`}>
          {open && <p className="eyebrow mb-1 px-3 text-cream/40">Cuenta · {user}</p>}
          {sideButton(dark ? "Modo claro" : "Modo oscuro", ThemeIcon, toggleTheme)}
          {sideButton("Ver la web", ArrowUpRightFromSquare, () => window.open("/", "_blank"))}
          {sideButton("Plegar", ChevronLeft, toggle, !open)}
          {sideButton("Salir", ArrowRightFromSquare, () => logout())}
        </div>
      </aside>

      {/* ── Contenido ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="truncate text-xl font-extrabold tracking-tight">{title}</h1>
            <Chip size="sm" color="accent" variant="primary" className="hidden sm:inline-flex">
              Superadmin
            </Chip>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              onPress={toggleTheme}
              aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
            >
              <ThemeIcon />
            </Button>
            <Link href={`${P}/negocio`} title="Cambiar en Datos del local">
              <Chip color={ordersOpen ? "success" : "danger"} variant="soft">
                <span className={`size-1.5 rounded-full ${ordersOpen ? "animate-pulse bg-success" : "bg-danger"}`} />
                <Chip.Label>
                  <span className="hidden sm:inline">{ordersOpen ? "Pedidos abiertos" : "Pedidos cerrados"}</span>
                  <span className="sm:hidden">{ordersOpen ? "Abiertos" : "Cerrados"}</span>
                </Chip.Label>
              </Chip>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>

        {/* ── Navegación inferior (móvil) ── */}
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-cream/10 bg-ink text-cream dark:bg-[oklch(0.2_0.035_155)] md:hidden">
          {mobileMain.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 py-3 ${active ? "text-accent" : "text-cream/60"}`}
              >
                <item.icon className="size-5" />
                <span className="text-[10px]">{item.title}</span>
                {item.badge === "orders" && newOrders > 0 && (
                  <span className="absolute right-[28%] top-2 size-2 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
          <button onClick={() => setMore((m) => !m)} className="flex flex-col items-center gap-1 py-3 text-cream/60">
            <Ellipsis className="size-5" />
            <span className="text-[10px]">Más</span>
          </button>
        </nav>
        {more && (
          <div className="fixed inset-x-3 bottom-20 z-50 rounded-2xl border border-cream/10 bg-ink p-2 text-cream shadow-xl md:hidden">
            {all.slice(4).map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMore(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-cream/10">
                <item.icon className="size-4" /> {item.title}
              </Link>
            ))}
            <button onClick={() => { setMore(false); toggleTheme(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-cream/10">
              <ThemeIcon className="size-4" /> {dark ? "Modo claro" : "Modo oscuro"}
            </button>
            <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-cream/10">
              <ArrowUpRightFromSquare className="size-4" /> Ver la web
            </a>
            <button onClick={() => logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-cream/10">
              <ArrowRightFromSquare className="size-4" /> Salir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
