import React, { useState, type FC } from "react";

import ActionBox from "@/components/features/share/ActionBox";
import { OrDivider } from "@/components/shared/OrDivider";
import { Button } from "@/components/ui/button";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  onClose: () => void;
  onStartSession: (roomId?: string) => void;
  username: string;
  setUsername: (name: string) => void;
}

const LiveShare: FC<IProps> = ({
  onClose,
  onStartSession,
  setUsername,
  username,
}) => {
  const t = useTranslations("share");
  const [roomIdInput, setRoomIdInput] = useState("");

  return (
    <>
      <DialogHeader className="px-6 py-4 border-b ">
        <div className="row gap-3">
          <AppIconButton icon={sharedIcons.arrow_left} onClick={onClose} />

          <DialogTitle className="text-xl font-semibold">
            {t("live_share")}
          </DialogTitle>
        </div>
      </DialogHeader>

      <div className="px-6 py-6 col gap-6">
        {/* Name Input */}
        <div className="col gap-2">
          <AppTypo type="label">{t("name")}</AppTypo>
          <Input
            id="name"
            type="text"
            placeholder={t("name_placeholder")}
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="!h-10 px-3"
          />
          <AppTypo variant="small" color="secondary">
            {t("name_description")}
          </AppTypo>
        </div>

        {/* Divider with text */}
        <OrDivider title={t("choose_option")} />

        {/* Join Room Card */}
        <ActionBox
          icon={sharedIcons.user_group}
          title={t("join_room")}
          subtitle={t("join_desc")}
        >
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder={t("room_id_placeholder")}
              value={roomIdInput}
              onChange={e => setRoomIdInput(e.target.value)}
              className="!h-10 px-3  "
            />
            <Button
              size="lg"
              className="px-6 !h-10"
              onClick={() => onStartSession(roomIdInput)}
              disabled={!roomIdInput.trim()}
            >
              {t("join")}
              <AppIcon
                icon={sharedIcons.arrow_right}
                className="ml-2 h-4 w-4"
              />
            </Button>
          </div>
        </ActionBox>

        {/* Create Room Card */}
        <ActionBox
          icon={sharedIcons.plus}
          title={t("create_new_room")}
          subtitle={t("create_new_desc")}
        >
          <Button
            size="lg"
            className="w-full !h-10"
            onClick={() => onStartSession()}
          >
            <AppIcon icon={sharedIcons.plus} className="mr-2 h-4 w-4" />
            {t("start_session")}
          </Button>
        </ActionBox>
      </div>
    </>
  );
};

export default LiveShare;
