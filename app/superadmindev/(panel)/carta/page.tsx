import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { PageIntro } from "../ui";
import CartaEditor from "./CartaEditor";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export default async function CartaPage() {
  await requireAdmin();
  const db = await getDb();
  return (
    <>
      <PageIntro
        title="La carta"
        text="Lo que cambies aquí se ve al instante en la web y en la página de pedidos. Marca como agotado lo que se acabó hoy."
      />
      <CartaEditor categories={db.categories} dishes={db.dishes} currency={db.settings.currency} />
    </>
  );
}
