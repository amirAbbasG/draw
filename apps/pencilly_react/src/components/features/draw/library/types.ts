import type { LibraryItemsSource, LibraryItem as DrawLibrary} from "@excalidraw/excalidraw/types";

export interface LibraryItem {
  id: string;
  name: string;
  library_url: string;
  library_size_bytes: number;
  preview_url: string;
  preview_dimensions?: string;
  description: string;
  itemNames?: string[];
  username: string;
}

export interface LibraryResponseItem {
  type: string;
  version: number;
  source: string;
  libraryItems: LibraryItemsSource;
  library: LibraryItemsSource
}
