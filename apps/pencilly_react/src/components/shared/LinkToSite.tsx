import React, { ComponentProps, type FC } from "react";
import {useLocale} from "@/i18n";
import {Link} from "react-router";
import {envs} from "@/constants/envs";


interface IProps extends ComponentProps<typeof Link> {}

const LinkToSite: FC<IProps> = ({ children, to, ...otherPops }) => {
  const locale = useLocale();

  return (
    <Link
      to={`${envs.siteUrl}/${locale}${to}`}
      target="_blank"
      {...otherPops}
    >
      {children}
    </Link>
  );
};

export default LinkToSite;
