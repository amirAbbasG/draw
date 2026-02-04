import React from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { cva } from "class-variance-authority";

import { paletteColors } from "../variants";

type variantTypes = "ghost" | "primary" | "light";

const variant: Record<variantTypes, string> = {
  primary: "bg-(--color) text-(--lighter)",
  light: "bg-(--lighter) text-(--color) border-(--color)",
  ghost: "text-(--color)",
};

const font: Record<"light" | "bold", string> = {
  light: "font-extralight",
  bold: "font-semibold",
};

type props = {
  children: ReactNode;
  variant?: keyof typeof variant;
  color?: keyof typeof paletteColors;
  font?: keyof typeof font;
} & HTMLAttributes<HTMLDivElement>;

const classVariance = cva(
  "flex flex-row rounded py-1 px-2 text-sm items-center justify-center",
  { variants: { variant, color: paletteColors, font } },
);

function AppBadge(props: props) {
  const {
    children,
    variant = "primary",
    color = "default",
    font = "bold",
  } = props;
  return (
    <span {...props} className={classVariance({ variant, color, font })}>
      {children}
    </span>
  );
}

export default AppBadge;
