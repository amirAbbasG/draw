import { useLayoutEffect } from "react";

import type { GenerateDiagramToCode } from "../../types";
import { useApp } from "../App";

export const DiagramToCodePlugin = (props: {
  generate: GenerateDiagramToCode;
}) => {
  const app = useApp();

  useLayoutEffect(() => {
    app.setPlugins({
      diagramToCode: { generate: props.generate },
    });
  }, [app, props.generate]);

  return null;
};
