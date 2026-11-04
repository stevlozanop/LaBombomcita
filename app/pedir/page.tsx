import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "@gravity-ui/icons";
import { getPublicData } from "@/lib/public-data";
import { btn, card, chip } from "@/lib/ui";
import fachadaCarta from "@/public/img/local/fachada-carta.webp";
import Header from "../components/Header";
import OrderForm from "./OrderForm";

export const metadata: Metadata = {
  title: "Hacer pedido — La Bomboncita",
  description: "Arma tu pedido de ceviche y envíalo por WhatsApp.",
};

export default async function PedirPage() {
  const { settings, categories, dishes } = await getPublicData();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6">
        {/* Encabezado con foto del local */}
        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-ink text-cream">
          <Image src={fachadaCarta} alt="" placeholder="blur" className="absolute inset-0 size-full object-cover opacity-35" sizes="1280px" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink to-ink/40" />
          <div className="relative p-6 sm:p-10">
            <span className={`${chip({ color: "accent", variant: "primary" })} font-semibold`}>Delivery o recojo</span>
            <h1 className="display mt-4 text-4xl sm:text-6xl">Arma tu pedido</h1>
            <p className="mt-3 max-w-md text-cream/80">
              Elige tus platos, completa tus datos y envíanos el pedido por WhatsApp. Te confirmamos el
              tiempo de entrega por ahí.
            </p>
          </div>
        </section>

        {settings.ordersOpen ? (
          <OrderForm
            categories={categories}
            dishes={dishes.filter((d) => d.available)}
            currency={settings.currency}
            payments={settings.payments}
            address={settings.address}
          />
        ) : (
          <div className={`${card.base()} max-w-lg p-8`}>
            <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
              <Clock className="size-6" />
            </span>
            <p className="text-2xl font-extrabold">Por ahora no estamos recibiendo pedidos.</p>
            <p className="text-muted">Revisa nuestro horario y vuelve pronto.</p>
            <Link href="/#horario" className={`${btn({ variant: "primary" })} w-fit`}>
              Ver horario
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
