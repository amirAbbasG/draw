import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand/react";

import { createSelectors } from "@/stores/zustand/createSelectors";
import { UiState } from "@/stores/zustand/ui/types";
import {getPreferredLanguage} from "@/i18n/language-detector";

const initialState: UiState = {
  title: "",
  autoSave: false,
  isFullScreenDraw: false,
  isAuthPopupOpen: false,
  isUpgradePopupOpen: false,
  isLibraryOpen: false,
  activeHistory: "",
  activeVersionId: "",
  hideComments: false,
  langCode: getPreferredLanguage() || "en"
};

export const useUiStoreSelector = create<UiState>()(
  devtools(
    immer(() => initialState),
    { name: "ui", store: "ui" },
  ),
);

export const useUiStore = createSelectors(useUiStoreSelector);
