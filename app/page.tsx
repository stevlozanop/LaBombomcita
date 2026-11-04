import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, Clock, MapPin, ShoppingCart } from "@gravity-ui/icons";
import Header from "./components/Header";
import Menu from "./components/Menu";
import { InstagramIcon, WhatsAppIcon } from "./components/BrandIcons";
import { whatsappUrl } from "@/lib/db";
import { getPublicData } from "@/lib/public-data";
import { btn, card, chip } from "@/lib/ui";
import fachadaCarta from "@/public/img/local/fachada-carta.webp";
import fachada from "@/public/img/local/fachada.webp";
import salon from "@/public/img/local/salon.webp";
import mural from "@/public/img/local/mural.webp";

export default async function Home() {
  const { settings: site, hours, categories, dishes } = await getPublicData();
  const consulta = whatsappUrl(site.whatsapp, "Hola, quiero hacer una consulta");
  const abierto = hours.find((h) => !/cerrado/i.test(h.time));

  return (
    <>
      <Header />
      <main>
        {/* ── Portada con foto del local ── */}
        <section className="px-3 pt-3 sm:px-6 sm:pt-6">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-ink">
            <Image
              src={fachadaCarta}
              alt="Fachada de la cevichería con su carta en la vereda"
              priority
              placeholder="blur"
              className="absolute inset-0 size-full object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
            <div className="relative flex min-h-[560px] flex-col justify-end gap-6 p-6 pb-20 text-cream sm:p-12 lg:min-h-[620px] lg:max-w-2xl lg:justify-center">
              <span className={`${chip({ color: "accent", variant: "primary" })} w-fit font-semibold`}>
                Cevichería · Restaurant
              </span>
              <h1 className="display text-5xl sm:text-7xl">
                El sabor del mar, <span className="text-accent">en tu mesa.</span>
              </h1>
              <p className="max-w-md text-lg text-cream/85">
                Ceviches, menú marino y platos a la carta, preparados al momento. Ven al local o
                pide delivery.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pedir" className={btn({ variant: "primary", size: "lg" })}>
                  <ShoppingCart className="size-4" /> Hacer mi pedido
                </Link>
                <a href="#carta" className={`${btn({ variant: "outline", size: "lg" })} border-cream/40 text-cream hover:bg-cream/10`}>
                  Ver la carta
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Datos rápidos ── */}
        <section className="mx-auto -mt-10 max-w-6xl px-6 sm:-mt-12">
          <div className="relative grid gap-3 sm:grid-cols-3">
            {[
              { icon: Car, title: "Delivery", text: "Pide por WhatsApp y te lo llevamos.", href: "/pedir", cta: "Pedir ahora" },
              { icon: Clock, title: "Horario", text: abierto ? `${abierto.day}: ${abierto.time}` : "Consulta nuestro horario", href: "#horario", cta: "Ver horario" },
              { icon: MapPin, title: "Ubicación", text: site.address, href: site.mapsUrl, cta: "Cómo llegar" },
            ].map((i) => (
              <div key={i.title} className={`${card.base()} shadow-lg`}>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <i.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold">{i.title}</p>
                    <p className="truncate text-sm text-muted">{i.text}</p>
                  </div>
                </div>
                <a
                  href={i.href}
                  {...(i.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-1 text-sm font-semibold hover:underline"
                >
                  {i.cta} <ArrowRight className="size-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Carta ── */}
        <section id="carta" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-muted">Nuestra carta</p>
              <h2 className="display mt-2 text-4xl sm:text-5xl">Ceviches y más</h2>
              <p className="mt-3 max-w-lg text-muted">
                Precios en soles. La carta puede cambiar según el pescado del día.
              </p>
            </div>
            <Link href="/pedir" className={btn({ variant: "primary" })}>
              Armar pedido <ArrowRight className="size-4" />
            </Link>
          </div>
          <Menu categories={categories} dishes={dishes} currency={site.currency} />
        </section>

        {/* ── El local (fotos) ── */}
        <section id="local" className="scroll-mt-20 bg-ink py-20 text-cream lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-10 max-w-xl">
              <p className="eyebrow text-accent">El local</p>
              <h2 className="display mt-2 text-4xl sm:text-5xl">Ven a comer con nosotros</h2>
              <p className="mt-3 text-cream/75">
                Un espacio fresco y familiar, con mesas adentro y en la vereda. Te esperamos.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
              <figure className="relative overflow-hidden rounded-3xl md:row-span-2">
                <Image src={salon} alt="Salón con mesas y la barra de bebidas" placeholder="blur" className="size-full min-h-80 object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                <figcaption className={`${chip({ color: "default", variant: "secondary" })} absolute bottom-4 left-4`}>El salón</figcaption>
              </figure>
              <figure className="relative overflow-hidden rounded-3xl md:col-span-2">
                <Image src={fachada} alt="Fachada de la cevichería vista desde la calle" placeholder="blur" className="aspect-[16/10] size-full object-cover object-[center_70%]" sizes="(max-width: 768px) 100vw, 66vw" />
                <figcaption className={`${chip({ color: "default", variant: "secondary" })} absolute bottom-4 left-4`}>Nuestra fachada</figcaption>
              </figure>
              <figure className="relative overflow-hidden rounded-3xl">
                <Image src={mural} alt="Mural con los platos de la casa en la entrada" placeholder="blur" className="aspect-[4/3] size-full object-cover object-[center_45%]" sizes="(max-width: 768px) 100vw, 33vw" />
                <figcaption className={`${chip({ color: "default", variant: "secondary" })} absolute bottom-4 left-4`}>La entrada</figcaption>
              </figure>
              <div className="flex flex-col justify-between gap-6 rounded-3xl bg-accent p-6 text-accent-foreground">
                <p className="text-2xl font-extrabold leading-tight">Ceviches · Menú marino · Platos a la carta</p>
                <Link href="/pedir" className={`${btn({ variant: "primary" })} w-fit bg-ink text-cream hover:bg-ink/90`}>
                  Pedir delivery <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Horario y ubicación ── */}
        <section id="horario" className="mx-auto grid max-w-7xl scroll-mt-20 gap-6 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div className={`${card.base()} p-6 sm:p-8`}>
            <div className={card.header()}>
              <p className="eyebrow text-muted">Horario</p>
              <h2 className="display text-3xl sm:text-4xl">¿Cuándo abrimos?</h2>
            </div>
            <ul className="divide-y divide-separator">
              {hours.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-4 py-4">
                  <span className="font-semibold">{h.day}</span>
                  {/cerrado/i.test(h.time) ? (
                    <span className={chip({ color: "danger", variant: "soft" })}>Cerrado</span>
                  ) : (
                    <span className={chip({ color: "success", variant: "soft" })}>{h.time}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${card.base()} overflow-hidden p-0`}>
            <Image src={fachadaCarta} alt="Fachada del local" placeholder="blur" className="aspect-[16/9] w-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              <div>
                <p className="eyebrow text-muted">Ubicación</p>
                <h2 className="display mt-1 text-3xl sm:text-4xl">Visítanos</h2>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted">Dirección</dt>
                  <dd className="font-semibold">{site.address}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Teléfono / delivery</dt>
                  <dd className="font-semibold">
                    <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:underline">{site.phone}</a>
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-3">
                <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className={btn({ variant: "secondary" })}>
                  <MapPin className="size-4" /> Cómo llegar
                </a>
                <a href={consulta} target="_blank" rel="noopener noreferrer" className={btn({ variant: "tertiary" })}>
                  <WhatsAppIcon /> Escríbenos
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Llamado a la acción ── */}
        <section className="px-3 pb-6 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-accent p-8 text-accent-foreground sm:p-12 md:flex-row md:items-center">
            <div>
              <h2 className="display text-4xl sm:text-5xl">¿Antojo de ceviche?</h2>
              <p className="mt-2 text-lg opacity-80">Arma tu pedido en un minuto y envíalo por WhatsApp.</p>
            </div>
            <Link href="/pedir" className={`${btn({ variant: "primary", size: "lg" })} bg-ink text-cream hover:bg-ink/90`}>
              Hacer mi pedido <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-full bg-accent font-black text-accent-foreground">B</span>
          <div>
            <p className="font-extrabold">{site.name}</p>
            <p className="text-sm text-muted">{site.address}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {site.instagram && (
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className={btn({ variant: "ghost", size: "sm" })}>
              <InstagramIcon /> Instagram
            </a>
          )}
          <a href={consulta} target="_blank" rel="noopener noreferrer" className={btn({ variant: "ghost", size: "sm" })}>
            <WhatsAppIcon /> WhatsApp
          </a>
          <Link href="/pedir" className={btn({ variant: "ghost", size: "sm" })}>Pedidos</Link>
        </div>
        <p className="text-sm text-muted">© 2026 {site.name}</p>
      </footer>
    </>
  );
}
