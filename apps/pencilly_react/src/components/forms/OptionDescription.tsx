import React, { useState } from "react";

import AppIcon from "@/components/ui/custom/app-icon";
import { AppTooltip } from "@/components/ui/custom/app-tooltip";

const OptionDescription = ({ text }: { text: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <AppTooltip
      title={text}
      open={open}
      setOpen={setOpen}
      arrow
      contentClass="max-w-60"
    >
      <button className="z-50" onClick={() => setOpen(!open)}>
        <AppIcon
          icon="material-symbols:info-outline"
          className="w-3.5 h-3.5 relative mt-0.5  text-blue-400"
        />
      </button>
    </AppTooltip>
  );
};

export default OptionDescription;
