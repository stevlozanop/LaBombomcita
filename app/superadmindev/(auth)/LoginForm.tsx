"use client";

import { useActionState } from "react";
import { Alert, Button, Input, Label, Spinner, TextField } from "@heroui/react";
import { ArrowRight } from "@gravity-ui/icons";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="mt-8 flex flex-col gap-5">
      <TextField name="user" isRequired autoComplete="username" defaultValue={state.user}>
        <Label>Usuario</Label>
        <Input />
      </TextField>
      <TextField name="password" type="password" isRequired autoComplete="current-password">
        <Label>Contraseña</Label>
        <Input />
      </TextField>
      {state.error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{state.error}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}
      <Button type="submit" size="lg" fullWidth isPending={pending}>
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : null}
            {isPending ? "Entrando…" : "Entrar al panel"}
            {!isPending && <ArrowRight />}
          </>
        )}
      </Button>
    </form>
  );
}
