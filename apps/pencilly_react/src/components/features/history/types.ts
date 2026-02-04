import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

import type { StoredObject } from "@/stores/zustand/object/types";

export interface HistoryItem {
  id: string;
  title: string;
  appState: Record<string, AppState & {pageName: string}>;
  elements?: Record<string, DrawElements>;
  files?: Record<string, BinaryFiles>;
  objects?: StoredObject[];
  preview: string;
  pin: boolean;
  visible: boolean;
  createdAt: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number;
  previous_page: number;
}

export type RequestData = Pick<
  HistoryItem,
  "objects" | "files" | "elements" | "title" | "appState"
>;

export interface CreateHistoryInput {
  data: RequestData;
  image: File;
  setAsActive?: boolean;
}

export interface UpdateHistoryInput extends Partial<CreateHistoryInput> {
  id: string;
  pin?: boolean;
  visible?: boolean;
}
