"use client";

import React, { useState, type FC } from "react";

import { UserAvatar } from "@/components/features/user/UserAvatar";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { MeetUser } from "../types";

interface AddUserPopupProps {
  friends: MeetUser[];
  onInvite?: (userId: string) => void;
  onSendEmailInvite?: (email: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const AddUserPopup: FC<AddUserPopupProps> = ({
  friends,
  onInvite,
  onSendEmailInvite,
  className,
  children,
}) => {
  const t = useTranslations("meet.call");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSendEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed) {
      onSendEmailInvite?.(trimmed);
      setEmailInput("");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <AppIconButton
            icon={sharedIcons.user_add}
            size="default"
            variant="outline"
            title={t("add_user")}
            element="div"
            className={cn("rounded-lg bg-transparent", className)}
          />
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="center"
        side="top"
        sideOffset={8}
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <AppTypo variant="small" className="font-semibold">
              {t("add_user")}
            </AppTypo>
            <AppIconButton
              icon={sharedIcons.close}
              size="xs"
              onClick={() => setIsOpen(false)}
            />
          </div>

          {/* Search */}
          <div className="px-3 py-2 border-b">
            <Input
              placeholder={t("search_friends")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {/* Friends list */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted transition-colors text-start"
                  onClick={() => {
                    onInvite?.(friend.id);
                  }}
                >
                  <UserAvatar
                    imageSrc={friend.avatarUrl}
                    name={friend.name}
                    className="size-7 text-xs shrink-0"
                  />
                  <AppTypo variant="small" className="truncate flex-1">
                    {friend.name}
                  </AppTypo>
                  <AppIcon
                    icon={sharedIcons.plus}
                    className="size-4 text-primary shrink-0"
                  />
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center">
                <AppTypo variant="xs" color="secondary">
                  {t("no_friends_found")}
                </AppTypo>
              </div>
            )}
          </div>

          {/* Email invite */}
          <div className="px-3 py-2 border-t flex gap-2">
            <Input
              placeholder={t("invite_email_placeholder")}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="h-8 text-xs flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendEmail();
              }}
            />
            <Button
              size="sm"
              onClick={handleSendEmail}
              disabled={!emailInput.trim()}
              className="h-8 text-xs px-3"
            >
              {t("send")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AddUserPopup;
