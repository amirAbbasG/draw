export const Ellipsify = ({
  children,
  ...rest
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      {...rest}
      style={{
        textOverflow: "ellipsis",
        overflow: "hidden",
        whiteSpace: "nowrap",
        width: "100%",
        display: "flex",
        ...rest.style,
      }}
    >
      {children}
    </span>
  );
};
