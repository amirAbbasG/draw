import React from "react";
import type { FC } from "react";

import { Button } from "@/components/ui/button";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { useCopyTextInClipBoard } from "@/hooks/useCopyTextInClipBoard";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

interface IProps {
  text: string;
  className?: string;
  size?: "xs" | "sm" | "lg" | "xl" | "default";
  title?: string;
  copiedTitle?: string;
  variant?: "button" | "icon-button";
  titleClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost" | "link";
}

/**
 * CopyButton Component
 *
 * A reusable button component that allows users to copy a given text to the clipboard.
 * It supports two variants: a standard button with text and an icon button.
 *
 * @component
 * @param  props - The props for the CopyButton component.
 * @param {string} props.text - The text to be copied to the clipboard.
 * @param {string} [props.className] - Additional CSS classes for styling the button.
 * @param {"xs" | "sm" | "lg" | "xl" | "default"} [props.size="xs"] - The size of the button (used for the icon button variant).
 * @param {"button" | "icon-button"} [props.variant="minimalButton"] - The variant of the button (either a full button or an icon button).
 * @param {string} [props.title] - The title or label for the button. Defaults to a localized "copy" string.
 *
 * @returns JSX.Element The rendered CopyButton component.
 */
const CopyButton: FC<IProps> = ({
  text,
  className,
  size = "xs",
  variant = "minimalButton",
  title,
    copiedTitle,
  titleClassName,
  buttonVariant,
}) => {
  // Hook for handling translations
  const t = useTranslations("shared");

  // Custom hook for copying text to the clipboard and tracking the copy state
  const [handleCopy, isCopied] = useCopyTextInClipBoard(); // for copy value

  /**
   * Handles the copy action when the button is clicked.
   * Prevents default behavior and stops event propagation.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} e - The click event.
   */
  const copy = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleCopy(text);
  };

  // Render a full button variant
  if (variant === "button") {
    return (
      <Button
        size={size === "xs" ? "sm" : size}
        onClick={copy}
        className={cn("row gap-2", className)}
        variant={buttonVariant}
        icon={
          isCopied ? "solar:check-square-linear" : "solar:copy-outline"
        }
      >
        <span className={titleClassName}>
          {isCopied ? (copiedTitle || t("copied")) : (title || t("copy"))}
        </span>
      </Button>
    );
  }

  // Render an icon button variant
  return (
    <AppIconButton
      icon={isCopied ? "mdi:tick" : "fluent:copy-16-regular"}
      title={title || t("copy")}
      onClick={copy}
      size={size}
      className={className}
    />
  );
};

export default CopyButton;
