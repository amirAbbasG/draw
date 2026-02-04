import * as React from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

import { inputVariant } from "./variants";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  error?: string;
  wrapperClassName?: string;
  variant?: "input" | "just-border" | "whitout-border"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "input", type, icon, wrapperClassName, error, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col w-full gap-1", wrapperClassName)}>
        <div className="relative w-full">
          {icon ? (
            <AppIcon
              icon={icon}
              width={18}
              className="absolute text-foreground pb-0.5 left-2.5 top-1/2 -translate-y-1/2"
            />
          ) : null}
          <input
            type={type}
            className={cn(
              `${inputVariant({ variant, color: "input" })} ${icon ? "pl-8" : ""}`,
              className,
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error ? (
          <AppTypo variant="small" color="danger" className="italic">
            {error}
          </AppTypo>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
