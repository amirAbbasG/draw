import { type FC } from "react";

import { useTranslations } from "@/i18n";

import RenderIf from "@/components/shared/RenderIf";
import { cn } from "@/lib/utils";

interface IProps {
  fontClass?: string;
  rootClass?: string;
  svgClass?: string;
  showLabel?: boolean;
}

/**
 * loading component used for async action with loading state
 * can show or hide loading title by showLabel prop
 * @param svgClass extra classNames for svg icon
 * @param fontClass extra classNames for label
 * @param rootClass extra classNames for root dib
 * @param showLabel show loading... label or not default is false
 * @constructor
 */
const AppLoading: FC<IProps> = ({
  svgClass,
  fontClass,
  rootClass,
  showLabel = false,
}) => {
  const t = useTranslations("shared");

  return (
    <div className={cn("row gap-2 text-foreground ", rootClass)}>
      <div aria-label="Loading..." role="status">
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(" animate-spin ", svgClass)}
        >
          <path d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12"></path>
        </svg>
      </div>

      <RenderIf isTrue={showLabel}>
        <span
          className={cn("text-lg font-medium text-foreground-light", fontClass)}
        >
          {t("loading")}...
        </span>
      </RenderIf>
    </div>
  );
};

export default AppLoading;
