import { cn } from "@/lib/utils";

interface IProps {
  isOpen: boolean;
  className?: string;
  openClassName?: string;
}

/**
 * Collapsible div by passed stated
 * @param isOpen - state to open or close collapsible div
 * @param className - extra class name
 * @param openClassName - extra class name when open
 * @param children - children
 * @constructor
 */
export function AppCollapsible({
  isOpen,
  className,
  openClassName,
  children,
}: PropsWithChildren<IProps>) {
  return (
    <div
      className={cn(
        "max-h-0 overflow-hidden transition-all duration-300",
        isOpen && "max-h-dvh",
        className,
        isOpen && openClassName,
      )}
    >
      {children}
    </div>
  );
}
