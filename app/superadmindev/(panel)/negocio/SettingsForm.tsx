"use client";

import { useActionState } from "react";
import { Alert, Button, Card, Chip, Description, Input, Label, Spinner, TextField } from "@heroui/react";
import { Check } from "@gravity-ui/icons";
import type { Settings } from "@/lib/types";
import { saveSettings, type Result } from "../actions";

const fields: { name: keyof Settings; label: string; hint?: string; type?: string; wide?: boolean }[] = [
  { name: "name", label: "Nombre del local" },
  { name: "whatsapp", label: "WhatsApp para pedidos", hint: "Con código de país, sin espacios. Ej: 51987654321" },
  { name: "phone", label: "Teléfono visible en la web" },
  { name: "currency", label: "Moneda", hint: "Ej: S/" },
  { name: "address", label: "Dirección", wide: true },
  { name: "mapsUrl", label: "Enlace de Google Maps", type: "url", wide: true },
  { name: "instagram", label: "Instagram", type: "url", wide: true },
];

export default function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<Result | null, FormData>((_, f) => saveSettings(f), null);

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <form action={action}>
        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
          {fields.map((f) => (
            <TextField
              key={f.name}
              name={f.name}
              type={f.type ?? "text"}
              defaultValue={String(settings[f.name] ?? "")}
              className={f.wide ? "md:col-span-2" : ""}
            >
              <Label>{f.label}</Label>
              <Input />
              {f.hint && <Description>{f.hint}</Description>}
            </TextField>
          ))}
          <TextField name="payments" defaultValue={settings.payments.join(", ")} className="md:col-span-2">
            <Label>Formas de pago</Label>
            <Input />
            <Description>Separadas por coma. Aparecen en la página de pedidos.</Description>
          </TextField>
        </div>
        {state?.error && (
          <div className="px-5 pb-4 sm:px-6">
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{state.error}</Alert.Title>
              </Alert.Content>
            </Alert>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-separator px-5 py-4">
          {state?.ok && (
            <Chip color="success" variant="soft">
              <Check /> Guardado
            </Chip>
          )}
          <Button type="submit" isPending={pending}>
            {({ isPending }) => (
              <>
                {isPending && <Spinner color="current" size="sm" />}
                {isPending ? "Guardando…" : "Guardar cambios"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
