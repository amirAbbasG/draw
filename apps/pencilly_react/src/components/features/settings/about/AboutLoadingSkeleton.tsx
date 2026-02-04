import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoadingSkeleton() {
  return (
    <div className=" w-full h-20 flex flex-col sm:flex-row gap-2">
      <div>
        <Skeleton className="w-[60px] h-[60px]  rounded-full" />
      </div>
      <div className="h-auto w-full flex flex-col ">
        <div className="flex flex-col gap-4">
          <Skeleton className="w-24 h-2  mt-1 " />
          <Skeleton className="w-[240px] h-2 " />
          <Skeleton className="w-[190px] h-2 mt-1" />
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="w-[120px] h-2 " />
            <Skeleton className="w-[97%] h-1 mt-1" />
            <Skeleton className="w-full h-1" />
            <Skeleton className="w-[40%] h-1" />
          </div>
          <Skeleton className="w-10 h-1 my-1" />
          <hr />
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="w-[120px] h-2 " />
            <Skeleton className="w-[97%] h-1 mt-1" />
            <Skeleton className="w-full h-1" />
            <Skeleton className="w-[60%] h-1" />
          </div>
          <hr />
          <div className="w-full flex flex-col gap-4">
            <Skeleton className="w-[120px] h-2 mb-1 " />
            <Skeleton className="w-[90px] h-2 mb-1 " />
            <Skeleton className="w-full h-1" />
            <Skeleton className="w-[50%] h-1" />
            <Skeleton className="w-[90px] h-2 mb-1 " />
            <Skeleton className="w-full h-1" />
            <Skeleton className="w-[50%] h-1" />
            <Skeleton className="w-[90px] h-2 mb-1 " />
            <Skeleton className="w-full h-1" />
            <Skeleton className="w-[50%] h-1" />
          </div>
          <hr />
        </div>
      </div>
    </div>
  );
}
