import React, { type FC } from "react";

import { useTranslations } from "@/i18n";

import { LibraryItem } from "@/components/features/draw/library/types";
import RenderIf from "@/components/shared/RenderIf";
import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";
import { sharedIcons } from "@/constants/icons";

interface IProps {
  item: LibraryItem;
  onAdd: (url: string) => void;
  pendingUrl?: string;
}

const LibraryCard: FC<IProps> = ({ item, onAdd, pendingUrl }) => {
  const t = useTranslations("library");
  return (
    <div className="border rounded col p-4 gap-4">
      <div className="flex justify-between gap-3">
        <div className="col gap-2">
          <AppTypo variant="headingM" className="line-clamp-1">
            {item.name}
          </AppTypo>
          <AppTypo variant="small" className="line-clamp-2">
            {item.description}
          </AppTypo>
        </div>
        <RenderIf isTrue={!!item.preview_url}>
          <div className="w-28 min-w-28  lgw-32 max-w-28 lg:max-w-32  lg:min-w-32  h-20 border rounded-md">
            <img
              src={item.preview_url}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          </div>
        </RenderIf>
      </div>
      <div className="row gap-2 justify-end mt-auto">
        <a href={item.library_url} target="_blank" rel="noreferrer" download>
          <Button variant="outline" icon={sharedIcons.download}>
            {t("download")}
          </Button>
        </a>
        <Button
          onClick={() => onAdd(item.library_url)}
          icon={sharedIcons.plus}
          disabled={!!pendingUrl}
          isPending={pendingUrl === item.library_url}
        >
          {t("add")}
        </Button>
      </div>
    </div>
  );
};

export default LibraryCard;
