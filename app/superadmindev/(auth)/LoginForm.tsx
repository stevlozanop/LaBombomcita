"use client";

import { useActionState, useState } from "react";
import { Alert, Button, InputGroup, Label, Spinner, TextField } from "@heroui/react";
import { ArrowRight, Eye, EyeSlash, Lock, Person } from "@gravity-ui/icons";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [showPass, setShowPass] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const checkCaps = (e: React.KeyboardEvent) => setCapsLock(e.getModifierState("CapsLock"));

  return (
    <form action={action} className="flex w-full flex-col gap-5">
      <TextField name="user" isRequired autoComplete="username" defaultValue={state.user} fullWidth>
        <Label>Usuario</Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <Person className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="Tu usuario de administrador" className="h-12" />
        </InputGroup>
      </TextField>

      <TextField name="password" isRequired autoComplete="current-password" fullWidth>
        <Label>Contraseña</Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <Lock className="size-4 text-muted" />
          </InputGroup.Prefix>
          <InputGroup.Input
            type={showPass ? "text" : "password"}
            placeholder="Tu contraseña"
            className="h-12"
            onKeyUp={checkCaps}
            onKeyDown={checkCaps}
          />
          <InputGroup.Suffix className="pe-1">
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              onPress={() => setShowPass((v) => !v)}
            >
              {showPass ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </InputGroup.Suffix>
        </InputGroup>
      </TextField>

      {capsLock && <p className="-mt-2 text-sm font-medium text-warning">Bloq Mayús está activado.</p>}

      {state.error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{state.error}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      <Button type="submit" size="lg" fullWidth isPending={pending} className="mt-1 h-12">
        {({ isPending }) => (
          <>
            {isPending ? <Spinner color="current" size="sm" /> : null}
            {isPending ? "Verificando…" : "Entrar al panel"}
            {!isPending && <ArrowRight />}
          </>
        )}
      </Button>
    </form>
  );
}
