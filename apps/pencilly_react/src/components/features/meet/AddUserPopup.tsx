import React, {useState, type FC, useEffect} from "react";



import { DotLoading } from "@/components/features/meet/chat/TypingIndicator";
import { useSearchUser } from "@/components/features/meet/hooks/useSearchUser";
import { MeetUser } from "@/components/features/meet/types";
import { UserAvatar } from "@/components/features/user/UserAvatar";
import PopupHeader from "@/components/shared/PopupHeader";
import RenderIf from "@/components/shared/RenderIf";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounceEffect } from "@/hooks/useDebounceEffect";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import {PopoverAnchor} from "@radix-ui/react-popover";





const HISTORY_OPTIONS = [
  { value: 0, label: "no_history_access" },
  { value: 1, label: "one_day"},
  { value: 7, label: "one_week"},
  { value: 30, label: "one_month"},
  { value: 90, label: "three_months" },
  { value: 365, label: "one_year" },
  { value: -1, label: "all_history" },
] as const;

// ─── Component ──────────────────────────────────────────────────────────────

interface AddUserPopupProps {
  onInvite: (user: MeetUser, historyAccessDays?: number) => void;
  className?: string;
  children?: React.ReactNode;
  triggerProps?: Omit<
    React.ComponentProps<typeof AppIconButton>,
    "icon" | "title" | "element"
  >;
}

const AddUserPopup: FC<AddUserPopupProps> = ({
  onInvite,
  className,
  children,
  triggerProps,
}) => {
  const t = useTranslations("meet.call");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [historyDays, setHistoryDays] = useState<number>(0);
  const { data, isLoading, setQ } = useSearchUser();
  const [isOpenList, setIsOpenList] = useState(false)


  useDebounceEffect(
    () => {
      setQ(search);
    },
    search,
    300,
  );

  const handleInvite = (user: MeetUser) => {
    onInvite(
      {
        isCurrentUser: false,
        id: String(user.id),
        username: user.username,
        convesation_id: null,
        commen_convesations: [],
        name: user.username,
        avatarUrl: user.avatarUrl,
      } as MeetUser,
      historyDays,
    );
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpenList(isLoading || (data && data.length > 0) || search.length > 0)
  }, [isLoading, data, search])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger>
        {children ?? (
          <AppIconButton
            icon={sharedIcons.user_add}
            title={t("add_user")}
            element="div"
            className={cn("", triggerProps?.className)}
            {...(triggerProps ?? {})}
          />
        )}
      </PopoverTrigger>
      <PopoverContent
        className={cn(" p-3.5 col gap-2 z-100", className)}
        sideOffset={10}
      >
        {/* Header */}
        <PopupHeader
          title={t("add_user")}
          icon={sharedIcons.user_add}
          subtitle={t("add_user_desc")}
          onClose={() => setIsOpen(false)}
        />

        {/* ── Invite via email ── */}
        <AppTypo>{t("email_invite")}</AppTypo>
        <div className="relative w-64">
          <Input
              onClick={() => {
                if (data && data.length > 0) {
                  setIsOpenList(true)
                }
              }}
            placeholder={t("email_invite_placeholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.stopPropagation()}
            onKeyUp={e => e.stopPropagation()}
            className={cn("h-8 text-xs", isOpenList && "!rounded-b-none shadow-lg border-b-0")}
            type="email"
            autoComplete="new-password"
          />
          <Popover open={isOpenList} onOpenChange={setIsOpenList}>
            <PopoverAnchor className="w-full absolute inset-0 top-full" />
            <PopoverContent
              sideOffset={0}
              // Prevent Radix from auto-focusing the popover content when it opens.
              // This avoids stealing focus from the input field.
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="z-[200] col gap-1 w-64 rounded-t-none"
            >
               <RenderIf isTrue={isLoading}>
                 <DotLoading className="mx-auto" />
               </RenderIf>
              {data?.map(user => (
                  <div
                      role="button"
                      key={user.id}
                      className="cursor-pointer row gap-2 w-full px-3 py-2 hover:bg-muted transition-colors text-start"
                      onClick={() =>
                          handleInvite({
                            id: String(user.id),
                            username: user.username,
                            name: user.username,
                            avatarUrl: user.profile_image_url,
                          } as MeetUser)
                      }
                  >
                    <UserAvatar
                        imageSrc={user.profile_image_url}
                        name={user.username}
                        className="size-7 text-xs shrink-0"
                    />
                    <div className="col">
                      <AppTypo variant="small" className="truncate flex-1">
                        {user.email}
                      </AppTypo>
                      <AppTypo
                          variant="small"
                          color="secondary"
                          className="truncate flex-1"
                      >
                        {user.username}
                      </AppTypo>
                    </div>
                  </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        <AppTypo variant="small" color="secondary">
          {t("chat_history_access")}
        </AppTypo>
        <Select
          onValueChange={value => setHistoryDays(Number(value))}
          value={String(historyDays)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("select_history_access")} />
          </SelectTrigger>
          <SelectContent portal={false}>
            {HISTORY_OPTIONS.map(opt => (
              <SelectItem value={String(opt.value)} key={opt.value}>
                {t(opt.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
};

export default AddUserPopup;
