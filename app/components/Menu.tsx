"use client";

import Link from "next/link";
import { Chip, Tabs } from "@heroui/react";
import { ArrowRight } from "@gravity-ui/icons";
import type { Category, Dish } from "@/lib/types";
import { btn, card } from "@/lib/ui";

export default function Menu({ categories, dishes, currency }: { categories: Category[]; dishes: Dish[]; currency: string }) {
  const visible = categories.filter((c) => dishes.some((d) => d.categoryId === c.id));
  if (!visible.length) return <p className="text-muted">La carta se está actualizando.</p>;

  return (
    <Tabs defaultSelectedKey={visible[0].id} className="w-full">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Categorías de la carta" className="w-fit">
          {visible.map((c) => (
            <Tabs.Tab key={c.id} id={c.id}>
              {c.name}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>

      {visible.map((c) => (
        <Tabs.Panel key={c.id} id={c.id} className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dishes
              .filter((d) => d.categoryId === c.id)
              .map((d) => (
                <article key={d.id} className={`${card.base()} ${d.available ? "" : "opacity-60"}`}>
                  <div className={card.header()}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`${card.title()} text-lg font-bold`}>{d.name}</h3>
                      {d.available ? (
                        <Chip color="accent" variant="primary" className="shrink-0 font-bold">
                          {currency} {d.price}
                        </Chip>
                      ) : (
                        <Chip color="danger" variant="soft" className="shrink-0">
                          Agotado
                        </Chip>
                      )}
                    </div>
                    <p className={card.description()}>{d.desc}</p>
                  </div>
                  {d.available && (
                    <div className={`${card.footer()} mt-auto`}>
                      <Link href="/pedir" className={btn({ variant: "tertiary", size: "sm" })}>
                        Pedir <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  )}
                </article>
              ))}
          </div>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
