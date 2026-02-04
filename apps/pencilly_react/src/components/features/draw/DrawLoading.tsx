import React from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import AppLoading from "@/components/ui/custom/app-loading";

const Button = ({label, showMobile = true}: {label?: boolean, showMobile?: boolean}) => (
    <Skeleton className={cn(
        "w-9 h-9 rounded",
        label && "3xl:w-20",
        !showMobile && "max-sm:hidden"
    )}/>
)


const DrawLoading = () => {
    return (
        <div className="col justify-between size-full p-4">
            <div className="spacing-row gap-4">
                <Button />
                <Skeleton className="w-full max-w-xl h-12 max-sm:hidden"/>
                <Button label/>

            </div>

            <AppLoading rootClass="mx-auto" showLabel/>

            <div className="spacing-row gap-4">

            <div className="row gap-2">
                <Skeleton className="w-32 h-9 max-sm:hidden"/>
                <Skeleton className="w-18 h-9 max-sm:hidden"/>
            </div>
                <Skeleton className="w-full max-w-xl h-12 sm:hidden"/>
                <Button showMobile={false}/>
            </div>
        </div>
    );
};

export default DrawLoading;