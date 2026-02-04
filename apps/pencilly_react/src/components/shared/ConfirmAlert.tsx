import { useState } from "react";

import RenderIf from "@/components/shared/RenderIf";
import { Button } from "@/components/ui/button";
import AppTypo from "@/components/ui/custom/app-typo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "@/i18n";

interface IProps {
  onAccept?: () => void | Promise<void | unknown>;
  title: string;
  btnTitle: string;
  message: string;
  open?: boolean;
  loading?: boolean;
  className?: string;
  setOpen?: (val: boolean) => void;
  Action?: React.ReactNode;
  isDanger?: boolean;
}

function ConfirmAlert({
  children,
  onAccept,
  title,
  btnTitle,
  message,
  className = "",
  loading = false,
  open,
  setOpen,
  Action,
  isDanger,
}: PropsWithChildren<IProps>) {
  const t = useTranslations("shared");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOpn = open !== undefined ? open : isModalOpen;
  const setIsOpn = setOpen !== undefined ? setOpen : setIsModalOpen;

  const onSubmit = async () => {
    await onAccept?.();
    setIsOpn(false);
  };

  return (
    <Dialog open={isOpn} onOpenChange={setIsOpn}>
      <RenderIf isTrue={!!children}>
        <DialogTrigger className={"w-full " + className} asChild>
          <span>{children}</span>
        </DialogTrigger>
      </RenderIf>
      <DialogContent className="col max-h-dvh max-w-md  bg-popover p-6">
        <DialogHeader className="mb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <AppTypo>{message}</AppTypo>
        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              setIsOpn(false);
            }}
          >
            {t("close")}
          </Button>
          {Action}
          <Button
            isPending={loading}
            onClick={onSubmit}
            className="w-fit"
            color={isDanger ? "danger" : "default"}
          >
            {btnTitle}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmAlert;
