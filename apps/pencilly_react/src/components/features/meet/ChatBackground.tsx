import React, { type FC } from "react";

import { cn } from "@/lib/utils";

interface ChatBackgroundProps {
  /**
   * The stroke color for the SVG pattern lines.
   * Accepts any valid CSS color (hex, rgb, hsl, css variable, etc.).
   * @default "hsl(var(--primary) / 0.12)"
   */
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * A chat background with a decorative doodle-style SVG pattern.
 * The pattern color is customizable via the `color` prop.
 */
const ChatBackground: FC<ChatBackgroundProps> = ({
  color = "hsl(var(--primary) / 0.12)",
  className,
  children,
}) => {
  return (
    <div className={cn("relative flex-1 overflow-hidden", className)}>
      {/* Pattern layer */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 1125 2436"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 1 }}
        >
          <defs>
            <style>{`
              .chat-bg-s0{fill:none;stroke:${color};stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
              .chat-bg-s1{fill:none;stroke:${color};stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
              .chat-bg-s2{fill:none;stroke:${color};stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
              .chat-bg-s3{fill:none;stroke:${color};stroke-width:2.9;stroke-linecap:round;stroke-linejoin:round}
            `}</style>
          </defs>
          <g>
            {/* Pencil icon */}
            <path className="chat-bg-s0" d="M278.5,1298.6l-30.3,98.2l97.1-33.4" />
            <path className="chat-bg-s0" d="M345.3,1363.4l-67.5-64.1" />
            <path className="chat-bg-s0" d="M248.2,1396.8l-3,14.1l14.7-2.1" />
            <path className="chat-bg-s0" d="M259.9,1408.8l-11.7-12" />
            <path className="chat-bg-s0" d="M277.8,1298.6l67.5,64.8" />
            <line className="chat-bg-s0" x1="265" y1="1336.3" x2="331.8" y2="1400.4" />
            <line className="chat-bg-s0" x1="256.7" y1="1360.3" x2="323.5" y2="1424.4" />

            {/* Star / sparkle */}
            <path className="chat-bg-s1" d="M573,992.6l3,6.9v-6.9" />
            <path className="chat-bg-s1" d="M566.1,988.8l-3.2,8.6l5.8-7.1" />
            <circle className="chat-bg-s1" cx="576" cy="999.5" r="3" />

            {/* Heart */}
            <path className="chat-bg-s2" d="M392.6,1483.8c0.8,0,1.5-0.5,2.1-1.4c0.6-0.9,0.8-2.1,0.8-3.5c0-1.3-0.3-2.5-0.8-3.4c-0.6-1-1.3-1.5-2.1-1.5c-0.8,0-1.5,0.5-2,1.5c-0.6,1-0.9,2.1-0.9,3.4c0,1.4,0.3,2.5,0.9,3.5C391.2,1483.3,391.9,1483.8,392.6,1483.8z" />
            <path className="chat-bg-s2" d="M413.4,1470.1c-0.8,0-1.5,0.5-2,1.5c-0.6,1-0.9,2.1-0.9,3.4c0,1.4,0.3,2.5,0.9,3.4c0.5,1,1.2,1.5,2,1.5s1.5-0.5,2.1-1.5c0.6-0.9,0.8-2.1,0.8-3.4c0-1.3-0.3-2.5-0.8-3.4C414.9,1470.6,414.2,1470.1,413.4,1470.1z" />

            {/* Document / paper */}
            <path className="chat-bg-s0" d="M841.3,1054.4c-0.1-0.5,0-2.9,0.2-7.2c0.2-5-1.8-10.6-5.9-16.8c2.5,6.5,4,14.2,4.5,23.2" />
            <path className="chat-bg-s0" d="M937.2,1054.3c-0.8-2.8-1.3-6.3-1.3-10.6c0-4.3,0.5-7.4,1.6-9.3c-1.9,2-3.1,5.2-3.6,9.6c-0.5,4.4-0.3,8.1,0.6,11.2" />

            {/* Chat bubble shapes */}
            <path className="chat-bg-s1" d="M517.8,1154.7c-4.5,2.6-8,5.3-10.6,8.2c-3.2,3.4-4.1,6-2.8,7.8c0.9,2,3.7,2.5,8.2,1.5c3.7-0.9,7.8-2.6,12.3-5.2c4.5-2.6,8.1-5.3,10.7-8c3.2-3.4,4.2-6.1,2.9-7.9c-0.9-2-3.6-2.5-8.2-1.4C526.5,1150.4,522.3,1152.1,517.8,1154.7z" />

            {/* Envelope */}
            <path className="chat-bg-s2" d="M893,809.9c-0.4-0.3-0.7-0.6-0.7-1c0-0.4,0.2-0.7,0.7-1c0.4-0.3,0.9-0.4,1.5-0.4" />
            <circle className="chat-bg-s1" cx="893" cy="810" r="6" />

            {/* Camera */}
            <rect className="chat-bg-s1" x="850" y="2070" width="70" height="40" rx="8" />
            <circle className="chat-bg-s1" cx="903" cy="2087" r="6" />
            <circle className="chat-bg-s1" cx="882" cy="2090" r="6" />

            {/* Flower / nature element */}
            <path className="chat-bg-s1" d="M291.3,1621c-2.7,1.6-4.1,3.7-4.3,6.3c-0.3,2.5,0.6,4.9,2.5,7.3c2,2.5,4.7,3.5,7.9,2.8c3.5-0.8,5-2.7,4.5-5.7c-0.4-2.9-1.9-4.5-4.5-4.8" />
            <path className="chat-bg-s1" d="M347.5,1645.8c-5.4,3.7-10.3,8.8-14.5,15.3c5.9-5.5,11.2-9.9,16-13.1c5.2-3.5,11-5.5,17.4-5.8c6.3-0.4,11.4,1.1,15.4,4.3c3.7,3.1,5.5,6.6,5.5,10.7c0,4-1.5,6.9-4.6,8.8" />

            {/* Magnifying glass */}
            <circle className="chat-bg-s2" cx="170" cy="1170" r="15" />
            <line className="chat-bg-s2" x1="181" y1="1181" x2="195" y2="1195" />

            {/* WiFi / connection symbol */}
            <path className="chat-bg-s1" d="M899.2,1672.3c0.2-0.1,2.3-0.5,6.3-1.3c3.9-0.8,7.3-0.3,10.3,1.4c3,1.8,5.2,4,6.6,6.5c1.4,2.5,2.3,6.6,2.8,12.2" />
            <path className="chat-bg-s1" d="M858.3,1706.5c-0.2-3.2,0.3-6.1,1.3-8.7c1.2,1.3,4.6,2.2,10.3,2.9" />

            {/* Brush / paint */}
            <path className="chat-bg-s0" d="M409.7,865c-0.2,0.1-0.4,0.2-0.6,0.4c-2.7,2.8-5,6.6-7.1,11.4" />
            <path className="chat-bg-s0" d="M415.7,876.8c0.1,0.1,0.2,0.3,0.3,0.4c-0.2,0.5-0.7,1.6-1.5,3.5" />

            {/* Book */}
            <path className="chat-bg-s1" d="M559,711.4c-0.4,0.1-0.9,0.3-1.5,0.6c-2.2,1.1-5.6,3.5-10.4,7.5c-7.3,5.9-10.9,10.5-10.8,14" />
            <path className="chat-bg-s1" d="M577.7,718.8c-0.1,0-0.3,0-0.5,0c-0.4,0.1-0.6,0.4-0.8,0.8c-0.4,0.8-1,1.8-1.8,3c-0.8,1.2-1.2,2.1-1.1,2.9c-0.2,2.9,2.2,4.4,7.1,4.4" />

            {/* Globe circle */}
            <circle className="chat-bg-s3" cx="288" cy="1347" r="65" />
            <ellipse className="chat-bg-s1" cx="288" cy="1347" rx="30" ry="65" />
            <line className="chat-bg-s1" x1="223" y1="1330" x2="353" y2="1330" />
            <line className="chat-bg-s1" x1="223" y1="1365" x2="353" y2="1365" />

            {/* Cloud */}
            <path className="chat-bg-s1" d="M120,856c1.7,3,7.2,4.5,16.3,4.4c9.4-0.1,20.4-1.8,32.9-5.2" />
            <path className="chat-bg-s1" d="M210,829.7c0.9,1.1,1.8,2.1,2.6,3" />

            {/* Sun rays */}
            <circle className="chat-bg-s2" cx="173" cy="790" r="35" />
            <line className="chat-bg-s1" x1="173" y1="745" x2="173" y2="755" />
            <line className="chat-bg-s1" x1="218" y1="790" x2="208" y2="790" />
            <line className="chat-bg-s1" x1="173" y1="835" x2="173" y2="825" />
            <line className="chat-bg-s1" x1="128" y1="790" x2="138" y2="790" />

            {/* Music note */}
            <path className="chat-bg-s1" d="M690.7,1470.1c0.4,0.2,0.8,0.2,1.1,0.1c0.4-0.1,3.2-4.7,8.5-13.7c5.3-9,16.8-26.9,34.6-53.7" />

            {/* Scissors */}
            <path className="chat-bg-s1" d="M434.7,1135.3c0,0.4,0.2,0.7,0.5,0.8c0.3,0.2,0.6,0.3,1,0.3c0.4-0.1,0.6-0.3,0.9-0.6c2.6-4,8.7-8.8,18.3-14.7" />
            <path className="chat-bg-s1" d="M428.8,1138.2c-0.3-0.2-0.7-0.2-1-0.1c-0.3,0.1-0.5,0.2-0.8,0.3c-4.9,1.5-9.6,4.6-14.3,9.2c-5.4,5.3-6.9,9.7-4.3,13.3" />

            {/* Palette / color wheel */}
            <path className="chat-bg-s1" d="M950.7,1038.4c1.7-7.1,5.4-12.1,10.9-14.9c5.1-2.6,10.2-3.7,15.4-3.1" />
            <path className="chat-bg-s1" d="M991.3,1075.2l-0.7,0.7c4.7,5.4,10.2,9.1,16.4,11.3" />

            {/* Rocket */}
            <path className="chat-bg-s2" d="M631.7,1506c0.3,0.2,0.5,0.6,0.5,1.1c0,0.5,7.4-10.4,22.3-32.8c14.9-22.4,41.8-52.7,80.8-90.9" />

            {/* Crown */}
            <path className="chat-bg-s1" d="M868.8,1627.3c-1.4-1.4-3.4-1.7-5.8-0.9c-3.8,1.1-9.3,4.1-16.5,8.8" />

            {/* User / person */}
            <path className="chat-bg-s1" d="M709.9,1942.8c-0.2-0.3-0.4-0.5-0.8-0.6c-0.3-0.1-0.6,0-0.9,0.2c-0.3,0.2-0.4,0.4-0.5,0.8c0,0.3,0,0.6,0.2,0.9c1.2,1.7,4,4.2,8.2,7.4" />

            {/* Decorative dots and circles scattered */}
            <circle className="chat-bg-s1" cx="500" cy="400" r="4" />
            <circle className="chat-bg-s1" cx="800" cy="500" r="3" />
            <circle className="chat-bg-s1" cx="300" cy="600" r="5" />
            <circle className="chat-bg-s1" cx="700" cy="800" r="3" />
            <circle className="chat-bg-s1" cx="200" cy="1000" r="4" />
            <circle className="chat-bg-s1" cx="900" cy="1200" r="3" />
            <circle className="chat-bg-s1" cx="400" cy="1800" r="4" />
            <circle className="chat-bg-s1" cx="600" cy="2000" r="3" />
            <circle className="chat-bg-s1" cx="100" cy="2200" r="5" />
            <circle className="chat-bg-s1" cx="800" cy="1600" r="4" />
          </g>
        </svg>
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};

export default ChatBackground;
