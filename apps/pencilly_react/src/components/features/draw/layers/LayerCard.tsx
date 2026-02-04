import { type FC } from "react";

import type { ExcalidrawElement } from "@excalidraw/element/types";

import LayersMenu from "@/components/features/draw/layers/LayersMenu";
import { MoveDirection } from "@/components/features/draw/layers/types";
import AppIcon from "@/components/ui/custom/app-icon";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";

const icons = {
  diamond: "hugeicons:diamond-01",
  rectangle: "hugeicons:square",
  triangle: "hugeicons:triangle",
  ellipse: "fluent-mdl2:ellipse",
  text: "hugeicons:text",
  line: "hugeicons:liner",
  arrow: "hugeicons:arrow-up-right-01",
  freedraw: "carbon:draw",
  image: "hugeicons:image-01",
  frame: "iconamoon:frame-thin",
} as const;

interface IProps {
  item: DrawElement;
  setProperty: (property: keyof ExcalidrawElement, value: any) => void;
  onDelete: () => void;
  selectElement: () => void;
  move: (direction: MoveDirection) => void;
}

const LayerCard: FC<IProps> = ({
  item,
  onDelete,
  selectElement,
  setProperty,
  move,
}) => {
  return (
    <div
      className={cn(
        "row gap-1 border rounded p-2 hover:bg-background transition-all duration-200 cursor-pointer",
        item.isDeleted && "border-red-200",
        item.isSelected && "border-primary bg-primary-lighter",
      )}
      key={item.id}
      onClick={selectElement}
    >
      <AppIcon
        className={cn(
          " stroke-2 size-8 p-1.5 rounded-md me-1",
          item.isDeleted && "opacity-50",
        )}
        icon={
          icons[item.type as keyof typeof icons] || "hugeicons:shape-collection"
        }
        style={{
          color: item.strokeColor,
          background:
            item.backgroundColor && item.backgroundColor !== "transparent"
              ? item.backgroundColor + 50
              : item.strokeColor + "10",
        }}
      />

      <div
        className={cn(
          " flex flex-col flex-1 min-w-0 me-auto",
          item.isDeleted && "opacity-50",
        )}
      >
        <AppTypo className="capitalize font-medium">{item.type}</AppTypo>
        <AppTypo className="truncate max-w-16" variant="xs" color="secondary">
          {item.id}
        </AppTypo>
      </div>

      <LayersMenu
        isLocked={item.locked}
        isHidden={item.isDeleted}
        setProperty={setProperty}
        move={move}
        onDelete={onDelete}
      />
    </div>
  );
};

export default LayerCard;
