"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "@gravity-ui/icons";
import { btn } from "@/lib/ui";

const links = [
  { href: "/#carta", label: "Carta" },
  { href: "/#local", label: "El local" },
  { href: "/#horario", label: "Horario y ubicación" },
];

export default function Header() {
  // Arriba de la página el navbar va integrado; al bajar se "despega"
  // y aparece como barra flotante con esquinas de 50px.
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        // Dos umbrales distintos para que no parpadee justo en el límite
        setFloating((f) => (f ? y > 16 : y > 80));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      {/* Espaciador: la barra es fija, así la página no salta al cambiar de forma */}
      <div aria-hidden className="h-16" />
      <header
        data-floating={floating}
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          floating ? "px-3 pt-3 sm:px-6 sm:pt-4" : "px-0 pt-0"
        }`}
      >
        <div
          className={`pointer-events-auto mx-auto flex h-16 items-center justify-between gap-4 border transition-[max-width,border-radius,background-color,border-color,box-shadow,padding] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            floating
              ? "navbar-drop max-w-5xl rounded-[50px] border-border/70 bg-background/85 pl-3 pr-2 shadow-xl shadow-ink/10 backdrop-blur-lg sm:pl-4"
              : "max-w-7xl rounded-none border-transparent bg-background px-4 shadow-none sm:px-6"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-lg font-black text-accent-foreground">
              B
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              La Bomboncita
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={btn({ variant: "ghost", size: "sm" })}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/pedir"
            className={btn({ variant: "primary", size: "md" })}
          >
            <ShoppingCart className="size-4" />
            Pedir
          </Link>
        </div>
      </header>
    </>
  );
}
