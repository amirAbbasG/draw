import { type FC } from "react";

/**
 * RenderIf Component
 *
 * A utility component that conditionally renders its children based on a boolean value.
 *
 * @component
 * @param props - The props for the RenderIf component.
 * @param {boolean} props.isTrue - A boolean value that determines whether the children should be rendered.
 * @param {React.ReactNode} props.children - The child components to be conditionally rendered.
 *
 * @returns JSX.Element | null The rendered children if `isTrue` is true, otherwise null.
 */
const RenderIf: FC<PropsWithChildren<{ isTrue: boolean }>> = ({
  isTrue,
  children,
}) => {
  return isTrue && <>{children}</>;
};

export default RenderIf;
