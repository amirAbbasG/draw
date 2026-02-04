import RenderIf from "@/components/shared/RenderIf";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

interface ISettingItemProps {
  title?: string;
  className?: string;
}

/**
 * SettingItem component show the setting item with title, Action and children
 * @param title
 * @param className
 * @param children
 * @constructor
 */
export function SettingItem({
  title,
  className,
  children,
}: PropsWithChildren<ISettingItemProps>) {
  return (
    <div className={cn("col gap-2.5", className)}>
      <RenderIf isTrue={!!title}>
        <AppTypo className="w-full pb-2 border-b" variant="headingXXS">
          {title}
        </AppTypo>
      </RenderIf>

      {children}
    </div>
  );
}
