import { VERSIONS } from "@excalidraw/common";

import { t } from "../i18n";
import type { ExcalidrawProps, UIAppState } from "../types";

const LibraryMenuBrowseButton = ({
  theme,
  id,
  libraryReturnUrl,
  onOpenLibraryRepo,
}: {
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  onOpenLibraryRepo: ExcalidrawProps["onOpenLibraryRepo"];
  theme: UIAppState["theme"];
  id: string;
}) => {
  const referrer =
    libraryReturnUrl || window.location.origin + window.location.pathname;

  if (onOpenLibraryRepo) {
    return (
      <button
        className="library-menu-browse-button"
        onClick={onOpenLibraryRepo}
      >
        {t("labels.libraries")}
      </button>
    );
  }

  return (
    <a
      className="library-menu-browse-button"
      href={`${import.meta.env.VITE_APP_LIBRARY_URL}?target=${
        window.name || "_blank"
      }&referrer=${referrer}&useHash=true&token=${id}&theme=${theme}&version=${
        VERSIONS.excalidrawLibrary
      }`}
      target="_excalidraw_libraries"
    >
      {t("labels.libraries")}
    </a>
  );
};

export default LibraryMenuBrowseButton;
