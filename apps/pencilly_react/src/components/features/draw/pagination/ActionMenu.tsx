import React, {type FC, Fragment} from "react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import AppIcon from "@/components/ui/custom/app-icon";
import {sharedIcons} from "@/constants/icons";
import RenderIf from "@/components/shared/RenderIf";
import {cn} from "@/lib/utils";
import {useTranslations} from "@/i18n";
import {usePaginationActions} from "@/components/features/draw/pagination/usePaginationActions";
import {actions} from "@/components/features/draw/pagination/constant";

interface IProps {
    actionHandlers: ReturnType<typeof usePaginationActions>["actionHandlers"]
    hideOnHoverOut?: boolean
    pageId: string
}

const ActionMenu: FC<IProps> = ({actionHandlers, pageId, hideOnHoverOut}) => {
    const t = useTranslations("pagination");
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <div className={cn(
                    hideOnHoverOut && "opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100"
                )}>
                    <AppIcon icon={sharedIcons.more} className="size-3.5" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-36 top-z">
                {actions.map(action => (
                    <Fragment key={action.id}>
                        <RenderIf isTrue={action.divider}>
                            <DropdownMenuSeparator />
                        </RenderIf>
                        <DropdownMenuItem
                            onClick={(e) => {
                                e.stopPropagation()
                                actionHandlers[action.id](pageId)
                            }}
                            className={cn(
                                "",
                                action.id === "delete" &&
                                "text-danger focus:text-danger",
                            )}
                            icon={action.icon}
                            iconSize="sm"
                        >
                            {t(action.id)}
                        </DropdownMenuItem>
                    </Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ActionMenu;