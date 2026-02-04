import React, { useEffect, useRef, useState } from "react";

import { useMediaQuery } from "usehooks-ts";

import RenderIf from "@/components/shared/RenderIf";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import AppIcon from "@/components/ui/custom/app-icon";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n";

/**
 * Check if the items list is a list of strings.
 *
 * @param {Item[]} arr - The array to check.
 * @returns boolean - True if the array is a list of strings, false otherwise.
 */
function isListOfString(arr: Item[]) {
  return (
    Array.isArray(arr) && arr.every(element => typeof element === "string")
  );
}

type ObjectItem = Partial<Record<string, string>> & {
  value: string;
  image?: string;
  label: string;
};

type Item = ObjectItem | string;

interface IProps {
  value: string;
  setValue: (item: string) => void;
  items: Item[];
  showSearch?: boolean;
  isSelect?: boolean;
  label?: string;
  buttonClassName?: string;
  itemClassName?: string;
  itemValueClassName?: string;
  placeHolder?: string;
}

interface SelectPropsType extends IProps {
  onOpenChange: StateSetter<boolean>;
  items: ObjectItem[];
}

/**
 * Component to render selectable items within a command interface.
 *
 * @param {SelectPropsType} props - The properties for the component.
 * @param {ObjectItem[]} props.items - The list of items to display.
 * @param {function} props.setValue - Function to set the selected value.
 * @param {ObjectItem} props.value - The currently selected value.
 * @param {function} props.onOpenChange - Function to handle the open state change.
 * @param {boolean} [props.showSearch=true] - Whether to show the search input.
 * @param {string} [props.itemClassName] - Additional class names for the items.
 */
const MyCommands = ({
  items,
  setValue,
  value,
  onOpenChange,
  showSearch = true,
  itemClassName,
}: SelectPropsType) => {
  /**
   * Handle the selection of an item.
   *
   * @param {string} item - The selected item.
   */
  function handleSelectItem(item: string) {
    setValue(item);
    onOpenChange(false);
  }

  const t = useTranslations("responsive_select");

  return (
    <Command>
      <RenderIf isTrue={showSearch}>
        <CommandInput placeholder={t("search")} value={value} />
      </RenderIf>
      <CommandList>
        <RenderIf isTrue={showSearch}>
          <CommandEmpty>{t("no_results_found")}</CommandEmpty>
        </RenderIf>
        <CommandGroup>
          {items.map(item => (
            <CommandItem
              key={item?.value}
              value={item?.value}
              data-checked={value === item.value}
              onSelect={() => handleSelectItem(item?.value)}
              className={cn(
                "text-base font-sans w-full font-normal cursor-pointer  px-4! py-1.5! border-s-2 border-transparent row gap-2 text-start items-start",
                value === item.value && "bg-primary-light border-primary",
                itemClassName,
              )}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item?.value}
                  className="h-5 w-5 rounded-full"
                />
              )}
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

/**
 * Component to render a select input with optional search functionality.
 *
 * @param {object} props - The properties for the component.
 * @param {ObjectItem[]} props.items - The list of items to display.
 * @param {function} props.setValue - Function to set the selected value.
 * @param {ObjectItem} props.value - The currently selected value.
 * @param {string} [props.label] - The label for the select input.
 * @param {string} [props.buttonStyle] - Additional class names for the button.
 * @param {string} [props.itemClassName] - Additional class names for the items.
 * @param {string} [props.itemValueClassName] - Additional class names for the item values.
 * @param {string} [props.placeHolder] - The placeholder text for the select input.
 */
const MySelect = ({
  items,
  setValue,
  value,
  label,
  buttonClassName,
  itemClassName,
  placeHolder,
}: Omit<IProps, "showSearch" | "isSelect" | "items"> & {
  items: ObjectItem[];
}) => {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const t = useTranslations("responsive_select");

  /**
   * Handle the change in the search input.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    setSelectionStart(input.selectionStart ?? 0);
    setSearch(e.target.value);
  };

  useEffect(() => {
    setFocus();
  }, [search, selectionStart]);

  /**
   * Set focus to the search input.
   */
  const setFocus = () => {
    const input = inputRef.current;
    if (input) {
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(selectionStart, selectionStart);
      }, 0);
    }
  };

  return (
    <Select
      value={value}
      onOpenChange={() => {
        setSearch("");
        setFocus();
      }}
      onValueChange={setValue}
      required={true}
    >
      <SelectTrigger
        className={cn("m-0 w-full text-foreground", buttonClassName)}
        onKeyDown={e => {
          e.stopPropagation();
        }}
      >
        <SelectValue
          placeholder={placeHolder ?? t("select_option")}
          className="text-sm!"
        />
      </SelectTrigger>

      <SelectContent className="z-100! max-h-[40vh] h-auto overflow-auto  ">
        {items.length > 5 && (
          <div className="  sticky top-[-5px] mb-1 z-10">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-background-lighter py-2 px-2 pe-8 outline-none border border-muted-dark rounded-md"
              placeholder="Search..."
              onChange={handleInputChange}
            />
            <AppIcon
              icon="lucide:search"
              className="absolute text-foreground-light  top-[50%] end-3 translate-y-[-50%]  w-4 "
            />
          </div>
        )}
        <SelectGroup
          onKeyDown={e => {
            e.stopPropagation();
            e.preventDefault();
          }}
          className="flex flex-col gap-y-1"
        >
          {label && <SelectLabel>{label}</SelectLabel>}
          {items.map(item => {
            return (
              <SelectItem
                value={item?.value}
                key={item.value}
                image={item?.image}
                className={cn(
                  !item.label.toLowerCase().includes(search.toLowerCase()) &&
                    search !== "" &&
                    " hidden ",
                  itemClassName,
                )}
              >
                {item.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

/**
 * ResponsiveSelect Component
 *
 * A versatile component that provides a responsive select input with support for mobile and desktop views.
 * It can render as a drawer on mobile devices or as a popover/select dropdown on larger screens.
 *
 * @component
 * @param {IProps} props - The props for the ResponsiveSelect component.
 * @param {string} props.buttonClassName - Additional class names for the button.
 * @param {Item[]} props.items - The list of items to display. Can be a list of strings or objects.
 * @param {string} props.value - The currently selected value.
 * @param {boolean} [props.isSelect=true] - Determines if the component should render as a select dropdown.
 * @param {function} props.setValue - Function to set the selected value.
 * @param {string} [props.itemValueClassName=""] - Additional class names for the item values.
 * @param {string} [props.label] - The label for the select input.
 * @param {string} [props.placeHolder] - The placeholder text for the select input.
 *
 * @returns JSX.Element The rendered ResponsiveSelect component.
 */
function ResponsiveSelect(props: IProps) {
  const {
    buttonClassName,
    items: itemList,
    value,
    isSelect = true,
    setValue,
    itemValueClassName = "",
    label,
    placeHolder,
  } = props;
  const t = useTranslations("responsive_select");
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  useEffect(() => {
    console.log({ itemList });
  }, []);

  const popoverButtonRef = useRef<HTMLButtonElement | null>(null);

  // if items list is strings list then convert it to objectItem[]
  const items: ObjectItem[] = isListOfString(itemList)
    ? (itemList.map(item => ({
        value: item,
        label: item,
        image: "",
      })) as unknown as ObjectItem[])
    : (itemList as unknown as ObjectItem[]);

  const selectedItem = items.find(i => i.value === value);

  const buttonContent = selectedItem
    ? selectedItem.label
    : (placeHolder ?? t("select_option"));

  const Trigger = (
    <Button
      variant="input"
      color="input"
      className={cn("w-full spacing-row px-3 py-2 gap-2", buttonClassName)}
      element="div"
      ref={popoverButtonRef}
    >
      <div className="flex justify-start gap-2">
        {/*if image is valid then show it*/}
        {selectedItem && selectedItem.image && (
          <img
            src={selectedItem.image}
            alt={selectedItem.label}
            className="h-5 w-5 rounded-full"
          />
        )}
        {buttonContent}
      </div>

      <AppIcon
        icon="bi:chevron-down"
        className={cn(
          "h-4 w-4 opacity-50 transition-transform duration-100",
          open && "rotate-180",
        )}
      />
    </Button>
  );

  const Main = (
    <MyCommands
      {...props}
      items={items}
      value={value}
      onOpenChange={setOpen}
      itemValueClassName={itemValueClassName}
    />
  );

  if (isMobile)
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger>{Trigger}</DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">{Main}</div>
        </DrawerContent>
      </Drawer>
    );

  if (isSelect) {
    return (
      <MySelect
        setValue={setValue}
        value={value}
        items={items}
        placeHolder={placeHolder}
        label={label}
        buttonClassName={buttonClassName}
        itemValueClassName={itemValueClassName}
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>{Trigger}</PopoverTrigger>
      <PopoverContent
        className="w-full px-0 py-1"
        style={{ width: popoverButtonRef.current?.offsetWidth }}
        align="start"
      >
        {Main}
      </PopoverContent>
    </Popover>
  );
}

export default ResponsiveSelect;
