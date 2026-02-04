import React, { useState, type FC } from "react";

import { createPortal } from "react-dom";

import type { LocalTrack, RemoteTrack } from "@/components/features/call/types";
import { VideoTile } from "@/components/features/call/VideoTile";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

interface IProps {
  localScreenTrack: LocalTrack;
  remoteScreenTracks: RemoteTrack[];
  localName?: string;
}

const ScreenTrack: FC<IProps> = ({
  localName,
  localScreenTrack,
  remoteScreenTracks,
}) => {
  const t = useTranslations("call");
  const [fullScreenTrack, setFullScreenTrack] = useState("");

  const activeFullScreenTrack = remoteScreenTracks.find(
    track => track.sid === fullScreenTrack,
  );

  if (activeFullScreenTrack) {
    return createPortal(
      <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
        <div className="row bg-muted rounded-md gap-1.5 px-1.5 py-0.5 absolute top-4 start-4 z-10">
          <AppIcon
            icon={sharedIcons.screen_share}
            className="size-3.5 text-primary"
          />
          <AppTypo variant="xs" color="secondary" className="pb-0.5">
            {activeFullScreenTrack.participantName ||
              activeFullScreenTrack.participantIdentity}{" "}
          </AppTypo>
        </div>
        <VideoTile
          track={activeFullScreenTrack.track}
          name={
            activeFullScreenTrack.participantName ||
            activeFullScreenTrack.participantIdentity
          }
          isScreenShare
          showBadge={false}
          className="w-full h-full max-h-full max-w-full"
        />

        <AppIconButton
          icon={sharedIcons.close}
          className="absolute top-4 end-4 z-10 bg-muted-dark "
          iconClassName="text-foreground-dark"
          title={t("exit_full_screen")}
          size="sm"
          onClick={() => setFullScreenTrack("")}
        />
      </div>,
      document.body,
    );
  }

  return (
    <div className="col gap-2 col-span-full">
      {/* Remote screen shares - big view */}
      {remoteScreenTracks.map(track => (
        <div key={track.sid} className="col gap-1 ">
          <div className="row gap-1.5 px-1">
            <AppIcon
              icon={sharedIcons.screen_share}
              className="size-3.5 text-primary"
            />
            <AppTypo variant="xs" color="secondary" className="pb-0.5">
              {track.participantName || track.participantIdentity}{" "}
              {t("status.is_sharing_screen")}
            </AppTypo>
          </div>

          <div className="relative">
            <VideoTile
              track={track.track}
              name={track.participantName || track.participantIdentity}
              isScreenShare
              className="w-full min-h-[200px]"
            />
            <AppIconButton
              icon={sharedIcons.expand}
              className="absolute top-2 end-2 z-10 bg-muted-dark "
              iconClassName="text-foreground-dark"
              title={t("full_screen")}
              size="xs"
              onClick={() => setFullScreenTrack(track.sid)}
            />
          </div>
        </div>
      ))}

      {/* Local screen share preview - smaller since user sees their own screen */}
      {localScreenTrack && (
        <div className="col gap-1">
          <div className="row gap-1.5 px-1">
            <AppIcon
              icon={sharedIcons.screen_share}
              className="size-3.5 text-primary"
            />
            <AppTypo variant="xs" color="primary" className="pb-0.5">
              {t("status.you_are_sharing_screen")}
            </AppTypo>
          </div>
          <VideoTile
            track={localScreenTrack.track}
            name={localName || t("you")}
            isLocal
            isScreenShare
            className="w-full max-h-28 opacity-75"
          />
        </div>
      )}
    </div>
  );
};

export default ScreenTrack;
