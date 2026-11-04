// Piezas compartidas del panel, con los estilos de HeroUI.
import Link from "next/link";
import { ChevronRight } from "@gravity-ui/icons";
import type { OrderStatus } from "@/lib/types";
import { btn, card, chip } from "@/lib/ui";

export function PageIntro({ title, text, children }: { title: React.ReactNode; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="display text-3xl sm:text-4xl">{title}</h2>
        {text && <p className="mt-2 max-w-xl text-sm text-muted">{text}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${card.base()} gap-0 overflow-hidden p-0 ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-separator px-5 py-4">
          <h3 className="font-bold">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: string; accent?: boolean }) {
  return (
    <div className={`${card.base()} gap-1 ${accent ? "bg-accent text-accent-foreground" : ""}`}>
      <p className={`text-sm font-medium ${accent ? "opacity-75" : "text-muted"}`}>{label}</p>
      <p className="text-3xl font-black tracking-tight sm:text-4xl">{value}</p>
      {hint && <p className={`text-xs ${accent ? "opacity-70" : "text-muted"}`}>{hint}</p>}
    </div>
  );
}

export function RowLink({ href, title, text, icon }: { href: string; title: string; text: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-default">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block truncate text-xs text-muted">{text}</span>
      </span>
      <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

const statusColor: Record<OrderStatus, Parameters<typeof chip>[0]> = {
  nuevo: { color: "accent", variant: "primary" },
  preparando: { color: "warning", variant: "soft" },
  "en camino": { color: "default", variant: "secondary" },
  entregado: { color: "success", variant: "soft" },
  cancelado: { color: "danger", variant: "soft" },
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`${chip(statusColor[status])} capitalize`}>{status}</span>;
}

export const inputCls = "input input--primary w-full";
export const btnPrimary = btn({ variant: "primary" });
export const btnGhost = btn({ variant: "tertiary" });
