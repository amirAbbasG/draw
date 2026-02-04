export interface UiState {
  autoSave: boolean;
  isFullScreenDraw: boolean;
  isAuthPopupOpen: boolean;
  isUpgradePopupOpen: boolean;
  isLibraryOpen: boolean;
  activeHistory: string;
  activeVersionId: string;
  title: string;
  currentCommentId?: string;
  hideComments: boolean;
  langCode: string
}
