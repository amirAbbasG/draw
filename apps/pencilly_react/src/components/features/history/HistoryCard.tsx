import React, { type FC } from "react";

import { useTranslations } from "@/i18n";
import { useShallow } from "zustand/react/shallow";

import { HistoryItem } from "@/components/features/history/types";
import { useHistoryActions } from "@/components/features/history/useHistoryActions";
import DeleteAlertDialog from "@/components/shared/DeleteAlertDialog";
import RenderIf from "@/components/shared/RenderIf";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppLoading from "@/components/ui/custom/app-loading";
import { cn } from "@/lib/utils";
import { setActiveHistory } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { sharedIcons } from "@/constants/icons";

interface IProps {
  item: HistoryItem;
  isLoading?: boolean;
  onClose: () => void;
}

const HistoryCard: FC<IProps> = ({ item, isLoading, onClose }) => {
  const { deleteHistory, changePin, isPendingUpdate } = useHistoryActions();
  const t = useTranslations("history");
  const activeHistory = useUiStore(useShallow(state => state.activeHistory));

  const isActive = activeHistory === item.id;

  return (
    <div
      className={cn(
        "w-full aspect-square  cursor-pointer relative border rounded overflow-hidden p-2 hover:border-primary-light transform duration-200",
        isActive && "border-primary",
      )}
      onClick={() => {
        setActiveHistory(item.id);
        setTimeout(() => {
          onClose();
        }, 200);
      }}
    >
      <RenderIf isTrue={isLoading}>
        <AppLoading rootClass="center-position" />
      </RenderIf>
      <div
        className="absolute top-1 end-1 row gap-1"
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <DeleteAlertDialog
          title={t("delete_title")}
          handleSubmit={() => deleteHistory(item.id)}
          description={t("delete_message")}
          Trigger={
            <AppIconButton
              icon={sharedIcons.delete}
              title={t("delete")}
              size="xs"
              color="danger"
              disabled={isPendingUpdate}
              className="bg-muted-light"
            />
          }
        />
        <AppIconButton
          icon={item.pin ? sharedIcons.pin_filled : sharedIcons.pin_outline}
          size="xs"
          iconClassName={item.pin ? "text-primary" : ""}
          onClick={() => changePin(item.id, !item.pin)}
          title={item.pin ? t("unpin") : t("pin")}
          disabled={isPendingUpdate}
          className="bg-muted-light"
        />
      </div>
      {item.preview && (
        <img
          src={item.preview || ""}
          alt={item.title || "history"}
          className="w-full object-center h-full"
        />
      )}
    </div>
  );
};

export default HistoryCard;
