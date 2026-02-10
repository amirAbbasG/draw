"use client";

import React, { useCallback, type FC } from "react";

import EmojiPicker from "@/components/features/comment/EmojiPicker";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { useTranslations } from "@/i18n";

interface ReactionOverlayProps {
  /** Called when a user selects a reaction emoji */
  onReaction: (emoji: string) => void;
  className?: string;
}

/**
 * Reaction picker that uses the existing EmojiPicker component
 * with `reactionsDefaultOpen` to show a compact emoji row.
 */
const ReactionOverlay: FC<ReactionOverlayProps> = ({
  onReaction,
  className,
}) => {
  const t = useTranslations("meet.call");

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      onReaction(emoji);
    },
    [onReaction],
  );

  return (
    <div className={className}>
      <EmojiPicker
        onChange={handleEmojiSelect}
        reactionsDefaultOpen
      />
    </div>
  );
};

export default ReactionOverlay;
