"use client";

import { useTransition } from "react";
import { Description, Label, Switch } from "@heroui/react";
import { setOrdersOpen } from "./actions";

export default function OrdersToggle({ open }: { open: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Switch
      isSelected={open}
      isDisabled={pending}
      onChange={(v) => start(() => setOrdersOpen(v).then(() => {}))}
      className="w-full flex-row items-center justify-between gap-4"
    >
      <Switch.Content className="flex flex-col items-start gap-0.5">
        <Label>{open ? "Recibiendo pedidos" : "Pedidos pausados"}</Label>
        <Description>{open ? "La página /pedir está activa." : "La web muestra que no se reciben pedidos."}</Description>
      </Switch.Content>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
    </Switch>
  );
}
