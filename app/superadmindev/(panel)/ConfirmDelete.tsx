"use client";

import { AlertDialog, Button } from "@heroui/react";
import { TrashBin } from "@gravity-ui/icons";

/** Botón de papelera que pide confirmación antes de borrar. */
export default function ConfirmDelete({
  label,
  title,
  description,
  onConfirm,
  isDisabled,
}: {
  label: string;
  title: string;
  description: string;
  onConfirm: () => void;
  isDisabled?: boolean;
}) {
  return (
    <AlertDialog>
      <Button isIconOnly size="sm" variant="ghost" aria-label={label} isDisabled={isDisabled} className="text-muted hover:text-danger">
        <TrashBin />
      </Button>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>{description}</p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Cancelar
              </Button>
              <Button slot="close" variant="danger" onPress={onConfirm}>
                Eliminar
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
