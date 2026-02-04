import { useEffect } from "react";

import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import {
  HistoryItem,
  HistoryResponse,
} from "@/components/features/history/types";
import { useGetHistoryById } from "@/components/features/history/useGetHistory";
import { useCustomSearchParams } from "@/hooks/useCustomSearchParams";
import { isEmpty } from "@/lib/utils";
import { setObjects } from "@/stores/zustand/object/actions";
import { setActiveHistory, setTitle } from "@/stores/zustand/ui/actions";
import { useUiStore } from "@/stores/zustand/ui/ui-store";
import { HISTORY_KEY } from "@/constants/keys";
import { queryKeys } from "@/services/query-keys";

export const useLoadHistory = () => {
  const { setSearchParams, currentValue: paramHistory } =
    useCustomSearchParams(HISTORY_KEY);
  const activeHistory = useUiStore(useShallow(state => state.activeHistory));
  const { getHistoryById } = useGetHistoryById();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!activeHistory && !!paramHistory) {
      setActiveHistory(paramHistory);
    }
  }, [paramHistory, activeHistory]);

  const getHistory = async () => {
    const id = activeHistory!;
    let history: HistoryItem;
    const data = (await queryClient.getQueryData(
      queryKeys.history,
    )) as InfiniteData<HistoryResponse>;

    const histories = data?.pages?.flatMap(p => p.items);
    if (isEmpty(histories) || !histories.some(h => h.id === id)) {
      history = await getHistoryById({ id });
    } else {
      history = histories.find(h => h.id === id);
    }
    setSearchParams({ [HISTORY_KEY]: id });
    setObjects(history?.objects || []);
    setTitle(history?.title || "");
    return history;
  };

  return { getHistory, activeHistory, paramHistory };
};
