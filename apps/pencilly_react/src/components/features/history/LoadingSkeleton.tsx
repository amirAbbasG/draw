import React from "react";

import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, key) => (
        <Skeleton className="w-full aspect-square" key={key} />
      ))}
    </>
  );
};

export default LoadingSkeleton;
