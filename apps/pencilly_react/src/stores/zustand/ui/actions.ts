import { useUiStore } from "@/stores/zustand/ui/ui-store";

export const setIsAuthPopupOpen = (value: boolean) => {
  useUiStore.setState(state => {
    state.isAuthPopupOpen = value;
  });
};

export const setIsUpgradePopupOpen = (value: boolean) => {
  useUiStore.setState(state => {
    state.isUpgradePopupOpen = value;
  });
};

export const setIsLibraryOpen = (value: boolean) => {
  useUiStore.setState(state => {
    state.isLibraryOpen = value;
  });
};

export const setActiveHistory = (value: string) => {
  useUiStore.setState(state => {
    state.activeHistory = value;
  });
};

export const setActiveVersionId = (value: string) => {
  useUiStore.setState(state => {
    state.activeVersionId = value;
  });
};

export const setTitle = (value: string) => {
  useUiStore.setState(state => {
    state.title = value;
  });
};

export const toggleAutoSave = (value?: boolean) => {
  useUiStore.setState(state => {
    state.autoSave = value === undefined ? !state.autoSave : value;
  });
};

export const setCurrentCommentId = (id?: string) => {
  useUiStore.setState(state => {
    state.currentCommentId = id;
  });
};

export const toggleHideComments = (value?: boolean) => {
  useUiStore.setState(state => {
    state.hideComments = value === undefined ? !state.hideComments : value;
  });
};

export const setLangCode = (value: string) => {

};


export const toggleDrawFullScreen = (value?: boolean) => {
  useUiStore.setState(state => {
    state.isFullScreenDraw = value ?? !state.isFullScreenDraw
  });
}