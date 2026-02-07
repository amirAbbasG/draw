import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand/react";

import { CollaborateState } from "@/stores/zustand/collaborate/types";
import { createSelectors } from "@/stores/zustand/createSelectors";

const initialState: CollaborateState = {
  callData: null,
  collaborators: new Map(),
  roomId: "",
};

export const useCollaborateStoreSelector = create<CollaborateState>()(
  devtools(
    immer(() => initialState),
    { name: "collaborate", store: "collaborate" },
  ),
);

export const useCollaborateStore = createSelectors(useCollaborateStoreSelector);
