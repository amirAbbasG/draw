import React, { type FC } from "react";

import { cn } from "@/lib/utils";

interface ChatBackgroundProps {
  /**
   * The color applied to the SVG pattern via CSS mask.
   * Accepts any valid CSS color value (hex, rgb, hsl, css variable, etc.).
   * @default "hsl(var(--primary) / 0.12)"
   */
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A chat background that renders the SVG doodle pattern file
 * with a customizable color overlay. The SVG is used as a mask-image
 * so we can colorize it via a simple background-color on the layer.
 */
const ChatBackground: FC<ChatBackgroundProps> = ({
  color = "hsl(var(--primary) / 0.12)",
  className,
  children,
}) => {
  return (
    <div className={cn("relative flex-1 overflow-hidden", className)}>
      {/* Colored pattern layer using mask-image */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundColor: color,
          WebkitMaskImage: "url(/assets/chat-pattern.svg)",
          maskImage: "url(/assets/chat-pattern.svg)",
          WebkitMaskRepeat: "repeat",
          maskRepeat: "repeat",
          WebkitMaskSize: "420px auto",
          maskSize: "420px auto",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full">{children}</div>
    </div>
  );
};

export default ChatBackground;
