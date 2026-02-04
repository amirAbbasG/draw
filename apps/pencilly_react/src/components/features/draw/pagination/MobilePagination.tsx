import React, { type FC } from "react";

import PaginationPopup from "@/components/features/draw/pagination/PaginationPopup";

interface IProps {
    paginationAPI: PaginationAPI
}

const MobilePagination: FC<IProps> = ({ paginationAPI }) => {

  return (
    <PaginationPopup paginationAPI={paginationAPI} triggerVariant="outline" />
  );
};

export default MobilePagination;
