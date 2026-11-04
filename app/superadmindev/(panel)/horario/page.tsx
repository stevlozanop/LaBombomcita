import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { PageIntro } from "../ui";
import HoursEditor from "./HoursEditor";

// Depende de la sesión: se genera en cada visita
export const instant = false;

export default async function HorarioPage() {
  await requireAdmin();
  const db = await getDb();
  return (
    <>
      <PageIntro title="Horario de atención" text='Escribe "Cerrado" en el horario de los días que no abres.' />
      <HoursEditor initial={db.hours} />
    </>
  );
}
