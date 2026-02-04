import { useEffect, useRef, useState } from "react";

import { useTranslations } from "@/i18n";
import { useOnClickOutside } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  value?: string;
  handleSubmit: (value: string) => void;
  isPending?: boolean;
  placeholder?: string;
}

const ChangeNameNoModal = ({
  value = "",
  handleSubmit,
  isPending,
  placeholder,
}: Props) => {
  //determine if user is editing
  const [editing, setEditing] = useState(false);

  //name entered by the user
  const [enteredName, setEnteredName] = useState(value);

  useEffect(() => {
    setEnteredName(value);
  }, [value]);

  const t = useTranslations("shared");

  //ref for focusing input field and click outside the input field
  const mainDivRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  //@ts-ignore
  useOnClickOutside(mainDivRef, () => {
    setEditing(false);
    setEnteredName(value);
  });

  //focus the input filed after clicking the name field
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <div
      ref={mainDivRef}
      className="w-full relative !border-none !outline-none flex flex-row justify-between items-center"
    >
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={enteredName}
        onChange={e => setEnteredName(e.target.value)}
        className="pr-16"
        onClick={() => setEditing(true)}
      />
      {(editing || isPending) && (
        <Button
          size="sm"
          isPending={isPending}
          onClick={e => {
            e.stopPropagation();
            handleSubmit(enteredName);
          }}
          className="absolute right-[1.5px]  ml-10"
        >
          {t("save")}
        </Button>
      )}
    </div>
  );
};

export default ChangeNameNoModal;
