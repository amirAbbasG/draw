import React, { useEffect, useState, type FC } from "react";

import { useTranslations } from "@/i18n";

import { examples } from "@/components/features/three/ai/exampes";
import ExampleDetails from "@/components/features/three/ai/ExampleDetails";
import RenderIf from "@/components/shared/RenderIf";
import { Show } from "@/components/shared/Show";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sharedIcons } from "@/constants/icons";

interface IProps {
  setPrompt: (val: string) => void;
}

const AiExamples: FC<IProps> = ({ setPrompt }) => {
  const t = useTranslations("three.ai");
  const [selectedId, setSelectedId] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = examples.find(e => e.id === selectedId);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(undefined);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <AppIconButton
          icon="mage:light-bulb"
          element="div"
          size="xs"
          title={t("examples")}
        />
      </DialogTrigger>
      <DialogContent className="max-w-full  md:max-w-[95vw] xl:max-w-5xl responsive-dialog max-h-[90dvh] ">
        <DialogHeader>
          <div className="row gap-1">
            <RenderIf isTrue={!!selectedId}>
              <AppIconButton
                icon={sharedIcons.arrow_left}
                onClick={() => setSelectedId(undefined)}
                size="xs"
              />
            </RenderIf>
            <DialogTitle className="me-auto">
              {selectedItem?.title || t("examples")}
            </DialogTitle>
            <DialogCloseButton />
          </div>
          <DialogDescription>
            {selectedItem && (
              <span className=" text-foreground">{t("prompt_label")}: </span>
            )}
            {selectedItem?.prompt || t("example_dialog_description")}
          </DialogDescription>
          <Show>
            <Show.When isTrue={!!selectedItem}>
              <ExampleDetails
                setPrompt={setPrompt}
                item={selectedItem!}
                onClose={() => setIsOpen(false)}
              />
            </Show.When>
            <Show.Else>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 pt-4">
                {examples.map(item => (
                  <div
                    className="p-1 border rounded cursor-pointer col gap-1 w-full hover:bg-background transition-all duration-200"
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <img
                      src={`/images/examples/${item.image}`}
                      alt={item.title}
                      className="w-full aspect-square rounded-md border"
                    />
                    <div className="w-full px-1 py-2">
                      <AppTypo
                        variant="small"
                        className="line-clamp-1 text-center  "
                      >
                        {item.title}
                      </AppTypo>
                    </div>
                  </div>
                ))}
              </div>
            </Show.Else>
          </Show>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AiExamples;
