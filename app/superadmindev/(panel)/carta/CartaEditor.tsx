"use client";

import { useState, useTransition } from "react";
import {
  Alert,
  Button,
  Card,
  Chip,
  Input,
  Label,
  ListBox,
  Select,
  Switch,
  TextField,
} from "@heroui/react";
import { Pencil, Plus } from "@gravity-ui/icons";
import type { Category, Dish } from "@/lib/types";
import { deleteCategory, deleteDish, saveCategory, saveDish, toggleDish, type Result } from "../actions";
import ConfirmDelete from "../ConfirmDelete";

type Editing = { dish?: Dish; categoryId: string } | null;

export default function CartaEditor({ categories, dishes, currency }: { categories: Category[]; dishes: Dish[]; currency: string }) {
  const [editing, setEditing] = useState<Editing>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newCat, setNewCat] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<Result>, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) setError(r.error ?? "No se pudo guardar.");
      else {
        setError("");
        after?.();
      }
    });

  return (
    <div className={`space-y-6 ${pending ? "opacity-80" : ""}`}>
      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{error}</Alert.Title>
          </Alert.Content>
        </Alert>
      )}

      {categories.map((c) => {
        const list = dishes.filter((d) => d.categoryId === c.id);
        return (
          <Card key={c.id} className="gap-0 overflow-hidden p-0">
            <Card.Header className="flex-row flex-wrap items-center justify-between gap-3 border-b border-separator px-5 py-4">
              {renaming === c.id ? (
                <form
                  className="flex flex-1 flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = new FormData(e.currentTarget).get("name") as string;
                    run(() => saveCategory({ id: c.id, name }), () => setRenaming(null));
                  }}
                >
                  <Input name="name" aria-label="Nombre de la categoría" defaultValue={c.name} autoFocus className="max-w-xs" />
                  <Button type="submit" size="sm">Guardar</Button>
                  <Button size="sm" variant="tertiary" onPress={() => setRenaming(null)}>Cancelar</Button>
                </form>
              ) : (
                <>
                  <Card.Title className="flex items-center gap-2 text-xl font-extrabold">
                    {c.name}
                    <Chip size="sm" variant="secondary">{list.length} platos</Chip>
                  </Card.Title>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onPress={() => setRenaming(c.id)}>
                      <Pencil /> Renombrar
                    </Button>
                    <ConfirmDelete
                      label={`Eliminar categoría ${c.name}`}
                      title={`¿Eliminar la categoría "${c.name}"?`}
                      description="Solo se puede eliminar si no tiene platos."
                      onConfirm={() => run(() => deleteCategory(c.id))}
                    />
                  </div>
                </>
              )}
            </Card.Header>

            <ul className="divide-y divide-separator">
              {list.map((d) =>
                editing?.dish?.id === d.id ? (
                  <li key={d.id}>
                    <DishForm editing={editing} categories={categories} pending={pending} onCancel={() => setEditing(null)} onSave={(v) => run(() => saveDish(v), () => setEditing(null))} />
                  </li>
                ) : (
                  <li key={d.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold leading-tight ${d.available ? "" : "text-muted line-through"}`}>{d.name}</p>
                      <p className="truncate text-sm text-muted">{d.desc}</p>
                    </div>
                    <Chip color="accent" variant="primary" className="font-bold">
                      {currency} {d.price}
                    </Chip>
                    <Switch isSelected={d.available} onChange={() => run(() => toggleDish(d.id))} size="sm" aria-label={`Disponibilidad de ${d.name}`} className="flex-row items-center gap-2">
                      <Switch.Control>
                        <Switch.Thumb />
                      </Switch.Control>
                      <Switch.Content className={`w-20 text-sm ${d.available ? "text-success" : "text-danger"}`}>
                        {d.available ? "Disponible" : "Agotado"}
                      </Switch.Content>
                    </Switch>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="tertiary" onPress={() => setEditing({ dish: d, categoryId: d.categoryId })}>
                        <Pencil /> Editar
                      </Button>
                      <ConfirmDelete
                        label={`Eliminar ${d.name}`}
                        title={`¿Eliminar "${d.name}"?`}
                        description="El plato desaparecerá de la carta y de la página de pedidos."
                        onConfirm={() => run(() => deleteDish(d.id))}
                      />
                    </div>
                  </li>
                ),
              )}
              <li>
                {editing && !editing.dish && editing.categoryId === c.id ? (
                  <DishForm editing={editing} categories={categories} pending={pending} onCancel={() => setEditing(null)} onSave={(v) => run(() => saveDish(v), () => setEditing(null))} />
                ) : (
                  <div className="px-5 py-3">
                    <Button variant="ghost" size="sm" onPress={() => setEditing({ categoryId: c.id })}>
                      <Plus /> Agregar plato en {c.name}
                    </Button>
                  </div>
                )}
              </li>
            </ul>
          </Card>
        );
      })}

      <Card className="border-2 border-dashed border-border bg-transparent shadow-none">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => saveCategory({ name: newCat }), () => setNewCat(""));
          }}
        >
          <TextField value={newCat} onChange={setNewCat} className="min-w-56 max-w-sm flex-1">
            <Label>Nueva categoría</Label>
            <Input placeholder="Ej. Postres" />
          </TextField>
          <Button type="submit" isDisabled={!newCat.trim()}>
            <Plus /> Crear categoría
          </Button>
        </form>
      </Card>
    </div>
  );
}

function DishForm({
  editing,
  categories,
  onSave,
  onCancel,
  pending,
}: {
  editing: NonNullable<Editing>;
  categories: Category[];
  onSave: (v: Parameters<typeof saveDish>[0]) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const d = editing.dish;
  const [name, setName] = useState(d?.name ?? "");
  const [price, setPrice] = useState(d ? String(d.price) : "");
  const [desc, setDesc] = useState(d?.desc ?? "");
  const [categoryId, setCategoryId] = useState(editing.categoryId);
  const [available, setAvailable] = useState(d?.available ?? true);

  return (
    <form
      className="grid gap-4 bg-background/70 px-5 py-5 sm:grid-cols-[1fr_130px_200px]"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: d?.id, name, desc, price: Number(price), categoryId, available });
      }}
    >
      <TextField value={name} onChange={setName} isRequired autoFocus>
        <Label>Nombre</Label>
        <Input />
      </TextField>
      <TextField value={price} onChange={setPrice} isRequired type="number">
        <Label>Precio</Label>
        <Input min="0" step="0.5" />
      </TextField>
      <Select value={categoryId} onChange={(v) => v && setCategoryId(String(v))} fullWidth>
        <Label>Categoría</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {categories.map((c) => (
              <ListBox.Item key={c.id} id={c.id} textValue={c.name}>
                {c.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>
      <TextField value={desc} onChange={setDesc} className="sm:col-span-3">
        <Label>Descripción</Label>
        <Input placeholder="Ingredientes, porción…" />
      </TextField>
      <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-3">
        <Switch isSelected={available} onChange={setAvailable} className="flex-row items-center gap-2">
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
          <Switch.Content>
            <Label>Disponible</Label>
          </Switch.Content>
        </Switch>
        <div className="flex gap-2">
          <Button variant="tertiary" onPress={onCancel}>Cancelar</Button>
          <Button type="submit" isDisabled={pending}>{d ? "Guardar cambios" : "Agregar plato"}</Button>
        </div>
      </div>
    </form>
  );
}
