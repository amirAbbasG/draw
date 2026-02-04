import React, { useState } from "react";
import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";

interface IProps {
  Trigger?: ReactNode;
  title: string;
  description?: string;
  handleSubmit: (fn: () => void) => void;
  setOpen?: (bool: boolean) => void;
  labelButton?: string;
}

/**
 * DeleteAlertDialog Component
 *
 * A reusable component that displays a confirmation dialog for delete actions.
 * It provides a customizable trigger, title, description, and action buttons.
 *
 * @component
 * @param {Object} props - The props for the DeleteAlertDialog component.
 * @param {string} props.title - The title displayed in the dialog.
 * @param {string} [props.description] - The description text displayed in the dialog.
 * @param {ReactNode} [props.Trigger] - The custom trigger element to open the dialog.
 * @param {(fn: () => void) => void} props.handleSubmit - The function to handle the delete action.
 * It receives a callback to reset the dialog state.
 * @param {(bool: boolean) => void} [props.setOpen] - Optional callback to control the open state of the dialog.
 * @param {string} [props.labelButton] - The label for the delete button. Defaults to a localized "delete" string.
 *
 * @returns JSX.Element The rendered DeleteAlertDialog component.
 */
function DeleteAlertDialog({
  title,
  description,
  Trigger,
  handleSubmit,
  setOpen,
  labelButton,
}: IProps) {
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("shared");

  /**
   * Handles the delete action when the delete button is clicked.
   * Sets the pending state, prevents event propagation, and calls the handleSubmit function.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} e - The click event.
   */
  const onSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    {
      setIsPending(true);
      e.stopPropagation();
      handleSubmit(() => {
        setIsPending(false);
        setIsOpen(false);
        setOpen && setOpen(false);
      });
    }
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        {/*
        if Trigger is not provided, use default button
      */}
        <AlertDialogTrigger asChild>
          {Trigger ? (
            <span>{Trigger}</span>
          ) : (
            <Button size="sm" color="danger">
              {t("delete")}
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-md z-[51]">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/*
            cancel button that closes the dialog
          */}
            <AlertDialogCancel asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </AlertDialogCancel>
            {/*
                delete button that calls handleSubmit function
            */}
            <Button color="danger" onClick={onSubmit} isPending={isPending}>
              {labelButton || t("delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DeleteAlertDialog;
