import { cva } from "class-variance-authority";

export const iconVariants = cva("", {
  variants: {
    size: {
      sm: "!h-3.5 !w-3.5 ",
      md: "!h-4 !w-4",
      lg: "!h-5 !w-5 ",
    },
  },
  defaultVariants: {},
});

export type typeColorVariant =
  | "default"
  | "danger"
  | "success"
  | "warning"
  | "info";

export const paletteColors = {
  default: [
    "[--color:theme(colors.primary.DEFAULT)]",
    "[--dark:theme(colors.primary.dark)]",
    "[--darker:theme(colors.primary.darker)]",
    "[--lighter:theme(colors.primary.lighter)]",
    "[--light:theme(colors.primary.light)]",
    "[--icon:theme(colors.foreground.icon)]",
  ],
  danger: [
    "[--color:theme(colors.danger.DEFAULT)]",
    "[--dark:theme(colors.danger.dark)]",
    "[--darker:theme(colors.danger.darker)]",
    "[--lighter:theme(colors.danger.lighter)]",
    "[--light:theme(colors.danger.light)]",
    "[--icon:theme(colors.danger.DEFAULT)]",
  ],
  success: [
    "[--color:theme(colors.success.DEFAULT)]",
    "[--dark:theme(colors.success.dark)]",
    "[--darker:theme(colors.success.darker)]",
    "[--lighter:theme(colors.success.lighter)]",
    "[--light:theme(colors.success.light)]",
    "[--icon:theme(colors.success.DEFAULT)]",
  ],
  warning: [
    "[--color:theme(colors.warning.DEFAULT)]",
    "[--dark:theme(colors.warning.dark)]",
    "[--darker:theme(colors.warning.darker)]",
    "[--lighter:theme(colors.warning.lighter)]",
    "[--light:theme(colors.warning.light)]",
    "[--icon:theme(colors.warning.DEFAULT)]",
  ],
  info: [
    "[--color:theme(colors.info.DEFAULT)]",
    "[--dark:theme(colors.info.dark)]",
    "[--darker:theme(colors.info.darker)]",
    "[--lighter:theme(colors.info.lighter)]",
    "[--light:theme(colors.info.light)]",
    "[--icon:theme(colors.info.DEFAULT)]",
  ],
};

export const inputVariant = cva(
  // " aria-expanded:border-primary [&>span]:line-clamp-1",

  "flex flex-row h-input w-full px-2 disabled:cursor-not-allowed whitespace-nowrap gap-1 rounded items-center justify-between ring-offset-background focus:outline-none focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-1 placeholder:!text-foreground-light placeholder:!text-base font-normal",
  {
    variants: {
      variant: {
        input: `bg-[var(--lighter)] border border-[var(--dark)] text-[var(--text)] hover:border-[var(--darker)]
				     focus:bg-[var(--lighter)] focus:border-primary focus:text-[var(--text)]
					 disabled:bg-background-dark disabled:text-foreground-disable disabled:border-background-darker placeholder:!text-foreground-light placeholder:!text-md`,
        "whitout-border": `bg-[var(--light)] text-[var(--darker)] hover:bg-[var(--dark)] hover:border-[var(--darker)]
				     focus:bg-[var(--light)] focus:border-[var(--darker)] focus:text-[var(--text)]
					 disabled:bg-background-dark disabled:text-foreground-disable disabled:border-background-darker`,
        "just-border": `border border-[var(--dark)] hover:border-[var(--darker)]
				     focus:border-[var(--darker)] focus:text-[var(--text)]
					 disabled:border-background-darker`,
      },
      size: {
        default: "text-sm",
      },
      color: {
        input: [
          "[--color:theme(colors.primary.DEFAULT)]",
          "[--dark:theme(colors.background.dark)]",
          "[--darker:theme(colors.background.darker)]",
          "[--lighter:theme(colors.background.lighter)]", //*
          "[--light:theme(colors.background.light)]",
          "[--text:theme(colors.foreground.dark)]",
        ],
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export const promptVariant = cva(
  // "  aria-expanded:border-primary [&>span]:line-clamp-1",

  "rounded p-2",
  {
    variants: {
      variant: {
        prompt:
          " outline-none ring-0 bg-[var(--light)] border  hover:border-[var(--darker)] focus-within:bg-[var(--lighter)] text-[var(--text)]  focus-within:!border-primary placeholder:!text-foreground-light placeholder:!text-base font-normal",
        "prompt-focus":
          "bg-[var(--light)] border border-[var(--darker)] text-[var(--text)]",
      },
      color: {
        input: [
          "[--color:theme(colors.primary.DEFAULT)]",
          "[--dark:theme(colors.background.dark)]",
          "[--darker:theme(colors.background.darker)]",
          "[--lighter:theme(colors.background.lighter)]", //*
          "[--light:theme(colors.background.light)]",
          "[--lighter:theme(colors.background.lighter)]",
          "[--text:theme(colors.foreground.DEFAULT)]",
        ],
      },
    },
  },
);
