import React, { useRef, useState, type FC } from "react";

import { useTranslations } from "@/i18n";


import UserDetails from "@/components/features/user/UserDetails";
import EditableDiv from "@/components/shared/EditableDiv";
import RenderIf from "@/components/shared/RenderIf";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useDrawUsers } from "@/services/user";

import EmojiPicker from "./EmojiPicker";

interface IProps {
  rootClassName?: string;
  actions?: "send" | "edit";
  onSubmit: (value: string) => void;
  onClose?: () => void;
  isPending?: boolean;
  defaultValue?: string;
}

const CommentTextField: FC<IProps> = ({
  rootClassName,
  actions = "send",
  onClose,
  isPending,
  defaultValue = "",
  onSubmit,
}) => {
  const t = useTranslations("comment");
  const [value, setValue] = useState("");
  const { data: users } = useDrawUsers();
  const [initialValue, setInitialValue] = useState(defaultValue);
  const [isOpenMentions, setIsOpenMentions] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  const onKeyUp = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "@") {
      setIsOpenMentions(true);
    }
  };

  const onSend = () => {
    console.log(value);
    onSubmit(value);
    onClose?.();
    setValue("");
    setInitialValue("");
    if (divRef.current) {
      divRef.current.innerText = "";
    }
  };

  return (
    <div className={cn("col p-3 gap-3", rootClassName)}>
      <EditableDiv
        onKeyUp={onKeyUp}
        initialValue={initialValue}
        onChange={setValue}
        className="max-h-32"
        placeholder={`${t("reply")}...`}
        ref={divRef}
        inputText={value}
        setInputText={setValue}
      />
      <div className="row gap-0.5 ">
        <Popover open={isOpenMentions} onOpenChange={setIsOpenMentions}>
          <PopoverTrigger>
            <AppIconButton
              icon="iconoir:at-sign"
              title={t("add_mention")}
              element="div"
            />
          </PopoverTrigger>
          <PopoverContent className=" col w-64  ">
            {users.map(user => (
              <UserDetails
                key={user.username}
                user={user}
                className="cursor-pointer hover:bg-background-light transition-all duration-200 text-start px-3 py-1"
                onClick={() => {
                  setInitialValue(
                    `${value}${value.endsWith("@") ? "" : "@"}${user.username}`,
                  );
                  setIsOpenMentions(false);
                }}
              />
            ))}
          </PopoverContent>
        </Popover>
        <EmojiPicker onChange={val => setInitialValue(value + val)} />
        <div className="row gap-1 ms-auto">
          <RenderIf isTrue={actions === "edit" && !!onClose}>
            <AppIconButton
              onClick={onClose}
              icon={sharedIcons.close}
              variant="outline"
              size="xs"
              className="ms-auto"
              title={t("discard")}
              disabled={isPending}
            />
          </RenderIf>
          <AppIconButton
            icon={actions === "edit" ? sharedIcons.check : sharedIcons.send}
            variant="fill"
            size="xs"
            title={t(actions === "edit" ? "save_edit" : "send")}
            disabled={!value.length || isPending}
            onClick={onSend}
          />
        </div>
      </div>
    </div>
  );
};

export default CommentTextField;
