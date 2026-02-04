import React from "react";

import { Icon } from "@iconify/react";
import type { IconProps } from "@iconify/react";

import { AppTooltip } from "@/components/ui/custom/app-tooltip";

interface AppIconProps extends IconProps {
  tooltip?: string; // A new prop for the tooltip text
}

function AppIcon({ tooltip, ...props }: AppIconProps) {
  const IconJsx = (
    <abbr className="leading-[0]">
      {" "}
      {/* Using abbr tag with title attribute */}
      <Icon {...props} />
    </abbr>
  );

  return tooltip ? (
    <AppTooltip title={tooltip ?? ""}>{IconJsx}</AppTooltip>
  ) : (
    IconJsx
  );
}

export default AppIcon;
