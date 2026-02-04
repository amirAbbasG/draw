import React, { type FC } from "react";

import EmojiPicker from "@/components/features/comment/EmojiPicker";
import type { Reaction } from "@/components/features/comment/types";
import { Button } from "@/components/ui/button";

interface IProps {
  reactions: Reaction[];
  onClickReaction?: (id: string) => void;
  onAddReaction?: (content: string) => void;
}

const Reactions: FC<IProps> = ({
  reactions,
  onAddReaction,
  onClickReaction,
}) => {
  return (
    <div className="row gap-1">
      {reactions
        ?.filter(r => !!r.users?.length)
        ?.map(r => (
          <Button
            variant="outline"
            className="!h-7 !w-fit  !p-1 row justify-center  !gap-0.5"
            key={r.id}
            onClick={() => onClickReaction?.(r.id)}
          >
            <span>{r.content}</span>
            <span className="pe-1">{r.users.length}</span>
          </Button>
        ))}
      <EmojiPicker
        onChange={emoji => onAddReaction?.(emoji)}
        reactionsDefaultOpen
      />
    </div>
  );
};

export default Reactions;
