import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

interface ShowProps {
  children: ReactNode;
}

interface WhenProps {
  isTrue: boolean;
  children: ReactNode;
}

interface ElseProps {
  children: ReactNode;
  render?: ReactNode;
}

/**
 * This is a React functional component that conditionally renders its children based on a boolean prop.
 * It iterates over its children and checks the 'isTrue' prop of each child.
 * If a child has 'isTrue' set to true and no other child with 'isTrue' set to true has been found yet, it sets that child as the 'when' child.
 * If a child does not have an 'isTrue' prop, it sets that child as the 'otherwise' child.
 * It returns the 'when' child if it exists, otherwise it returns the 'otherwise' child.
 *
 * @param {ShowProps} props - The props of the component, which include the children to be rendered.
 * @returns {ReactElement | null} The child to be rendered, either the 'when' child or the 'otherwise' child.
 */
export function Show(props: ShowProps): ReactElement<any> | null {
  let when: ReactElement<any> | null = null;
  let otherwise: ReactElement<any> | null = null;

  Children.forEach(props.children, child => {
    if (isValidElement(child)) {
      if ((child.props as WhenProps).isTrue === undefined) {
        otherwise = child;
      } else if (!when && (child.props as WhenProps).isTrue) {
        when = child;
      }
    }
  });

  return when || otherwise;
}

/**
 * This is a subcomponent of the Show component that renders its children if the 'isTrue' prop is true.
 *
 * @param {WhenProps} props - The props of the component.
 * @returns {ReactElement | null} The children if 'isTrue' is true, otherwise null.
 */
Show.When = function When({
  isTrue,
  children,
}: WhenProps): ReactElement<any> | null {
  return isTrue ? <>{children}</> : null;
};
/**
 * This is a subcomponent of the Show component that renders its children or a render prop.
 *
 * @param {ElseProps} props - The props of the component.
 * @returns {ReactElement} The children or the render prop.
 */
Show.Else = function Else({ render, children }: ElseProps): ReactElement<any> {
  return <>{render || children}</>;
};
