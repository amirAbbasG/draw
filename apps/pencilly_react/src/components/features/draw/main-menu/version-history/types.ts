import {HistoryItem} from "@/components/features/history/types";


export interface VersionItem extends Pick<HistoryItem, "files" | "appState" | "elements" | "objects">{
  id: string;
  createdAt: string;
  username: string;
}

export interface VersionHistoryResponse {
  items: VersionItem[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number;
  previous_page: number;
}

