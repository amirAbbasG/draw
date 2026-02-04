import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getFirstLetter } from "@/lib/utils";

interface IProps {
  imageSrc?: string;
  name?: string;
  onClick?: () => void;
  className?: string;
  fallbackClassname?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  backgroundColor?: string;
}

/**
 * UserAvatar component show image with first later of firstname and lastname fallback
 * @param imageSrc - image source
 * @param className - extra class name
 * @param onClick - click event of avatar
 * @param name - name of user, if not passed will be "Nerd Studio"
 * @param children - children of avatar
 * @param style - custom styles
 * @param backgroundColor
 * @param fallbackClassname extra class for fallback
 *
 * @constructor
 */
export function UserAvatar({
  imageSrc,
  className,
  onClick,
  name = "Nemati AI",
  fallbackClassname,
  children,
  style,
  backgroundColor,
}: IProps) {
  const [firstname, lastname] = name.split(" ");

  return (
    <Avatar
      onClick={onClick}
      className={cn("h-10 aspect-square ", className)}
      style={style}
    >
      <AvatarImage src={imageSrc} className="w-full h-full" />
      <AvatarFallback
        className={cn("bg-primary-lighter", fallbackClassname)}
        style={{ backgroundColor }}
      >
        {name !== ""
          ? `${getFirstLetter(firstname)}${getFirstLetter(lastname)}`
          : ""}
      </AvatarFallback>
      {children}
    </Avatar>
  );
}
