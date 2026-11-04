"use client";

import { useState, useTransition } from "react";
import { Button, Card, Chip, Input, Spinner } from "@heroui/react";
import { Check, Plus, TrashBin } from "@gravity-ui/icons";
import type { Hour } from "@/lib/types";
import { saveHours } from "../actions";

export default function HoursEditor({ initial }: { initial: Hour[] }) {
  const [rows, setRows] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const update = (i: number, key: "day" | "time", v: string) => {
    setSaved(false);
    setRows((r) => r.map((row, k) => (k === i ? { ...row, [key]: v } : row)));
  };

  return (
    <Card className="max-w-2xl gap-0 overflow-hidden p-0">
      <div className="grid grid-cols-[1fr_1fr_40px] gap-3 border-b border-separator px-5 py-3 text-sm font-medium text-muted">
        <span>Día</span>
        <span>Horario</span>
      </div>
      <ul className="divide-y divide-separator">
        {rows.map((r, i) => (
          <li key={r.id || i} className="grid grid-cols-[1fr_1fr_40px] items-center gap-3 px-5 py-3">
            <Input aria-label="Día" value={r.day} onChange={(e) => update(i, "day", e.target.value)} placeholder="Ej. Lunes" />
            <Input aria-label="Horario" value={r.time} onChange={(e) => update(i, "time", e.target.value)} placeholder="Ej. 11:00 — 17:00" />
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={`Quitar ${r.day || "fila"}`}
              className="text-muted hover:text-danger"
              onPress={() => {
                setSaved(false);
                setRows((x) => x.filter((_, k) => k !== i));
              }}
            >
              <TrashBin />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-separator px-5 py-4">
        <Button variant="tertiary" onPress={() => setRows((r) => [...r, { id: "", day: "", time: "" }])}>
          <Plus /> Agregar fila
        </Button>
        <div className="flex items-center gap-3">
          {saved && (
            <Chip color="success" variant="soft">
              <Check /> Guardado
            </Chip>
          )}
          <Button isPending={pending} onPress={() => start(async () => { await saveHours(rows); setSaved(true); })}>
            {({ isPending }) => (
              <>
                {isPending && <Spinner color="current" size="sm" />}
                {isPending ? "Guardando…" : "Guardar horario"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
