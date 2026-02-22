import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FC,
} from "react";

import EditableDiv from "@/components/shared/EditableDiv";
import EmojiPicker from "@/components/shared/EmojiPicker";
import SpeechToText from "@/components/shared/SpeechToText";
import AppIcon from "@/components/ui/custom/app-icon";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";

import type { ChatMessage, MeetUser } from "../types";
import MentionPopup from "./MentionPopup";
import {
  extractDecoratorsFromText,
  getCaretCharacterOffsetWithin,
  setCaretCharacterOffsetWithin
} from "@/components/features/meet/utils";
import {decorators} from "@/components/features/meet/constants";

interface ChatInputProps {
  members: MeetUser[];
  onSend: (text: string, replyToId?: string) => void;
  /** Message being replied to */
  replyTo?: ChatMessage | null;
  /** Message being edited */
  editingMessage?: ChatMessage | null;
  /** Called when reply/edit is cancelled */
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  /** Called when edit is submitted */
  onEditSubmit?: (eventId: string, newText: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Chat message input with reply preview bar, edit mode,
 * mention highlighting, emoji picker, and speech-to-text.
 */
const ChatInput: FC<ChatInputProps> = ({
  members,
  onSend,
  replyTo,
  editingMessage,
  onCancelReply,
  onCancelEdit,
  onEditSubmit,
  placeholder = "Write Your Message...!",
  disabled = false,
  className,
}) => {
  const t = useTranslations("meet");
  const tChat = useTranslations("meet.chat");
  const [value, setValue] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  // Pre-fill input when editing
  useEffect(() => {
    if (editingMessage) {
      setInitialValue(editingMessage.body);
      setValue(editingMessage.body);
    }
  }, [editingMessage]);

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      e.stopPropagation();
      if (e.key === "@") {
        setMentionOpen(true);
      }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [value],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      if (e.key === "Escape") {
        if (mentionOpen) setMentionOpen(false);
        else if (replyTo) onCancelReply?.();
        else if (editingMessage) onCancelEdit?.();
      }

      if ((e.code === "Space" || e.key === "Enter") && mentionOpen) {
        setMentionOpen(false);
      }

    },
    [value, mentionOpen, replyTo, editingMessage],
  );



  const handleMentionSelect = useCallback(
    (mention: string) => {
      const el = divRef.current;
      const text = el?.innerText ?? value ?? "";
      const caret = getCaretCharacterOffsetWithin(el);

      // Find the last '@' before or at the caret
      const atIndex = text.lastIndexOf('@', Math.max(0, caret - 1));

      let newText = text;
      let insertPos = caret;

      if (atIndex !== -1) {
        // Check if there's any whitespace between '@' and caret. If there is, treat as not an active token.
        const between = text.slice(atIndex, caret);
        const hasSpaceBetween = /\s/.test(between);

        if (!hasSpaceBetween) {
          // Replace token from atIndex to token end
          let tokenEnd = atIndex + 1;
          while (tokenEnd < text.length && !/\s/.test(text[tokenEnd])) tokenEnd++;
          newText = text.slice(0, atIndex) + `@${mention} ` + text.slice(tokenEnd);
          insertPos = atIndex + (`@${mention} `).length;
        } else {
          // space between -> insert at caret if not duplicate
          const existing = text.includes(`@${mention}`);
          if (existing) {
            setMentionOpen(false);
            return;
          }
          newText = text.slice(0, caret) + `@${mention} ` + text.slice(caret);
          insertPos = caret + (`@${mention} `).length;
        }
      } else {
        // no @ before caret -> insert if not duplicate
        if (text.includes(`@${mention}`)) {
          setMentionOpen(false);
          return;
        }
        newText = text.slice(0, caret) + `@${mention} ` + text.slice(caret);
        insertPos = caret + (`@${mention} `).length;
      }

      setValue(newText);
      setInitialValue(newText);
      setMentionOpen(false);

      if (el) {
        el.innerText = newText;
        setTimeout(() => setCaretCharacterOffsetWithin(el, insertPos), 0);
      }
    },
    [value],
  );

  const handleMentionButtonClick = () => {
    setMentionOpen(prev => !prev);
  };

    const handleEmojiSelect = useCallback(
        (emoji: string) => {
            setInitialValue(value?.trim() ? value + emoji?.trim() : emoji?.trim());
        },
        [value],
    );

  const handleTranscript = useCallback((transcript: string) => {
    const el = divRef.current;
    const newText = transcript ?? "";
    setValue(newText);
    setInitialValue(newText);
    if (el) {
      el.innerText = newText;
      setTimeout(() => setCaretCharacterOffsetWithin(el, newText.length), 0);
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (editingMessage) {
      // Submit edit
      onEditSubmit?.(editingMessage.id, trimmed);
      onCancelEdit?.();
    } else {
      // Send new message (with optional reply)
      onSend(trimmed, replyTo?.id);
      onCancelReply?.();
    }

    setValue("");
    setInitialValue("");
    setMentionOpen(false)
    if (divRef.current) {
      divRef.current.innerText = "";
    }
  }, [
    value,
    onSend,
    replyTo,
    editingMessage,
    onEditSubmit,
    onCancelReply,
    onCancelEdit,
  ]);

  const isReplying = !!replyTo;
  const isEditing = !!editingMessage;

  const textDecorators = extractDecoratorsFromText(value, decorators);

  return (
    <div
      className={cn(
        "relative col border rounded bg-background-lighter",
        className,
      )}
    >
      {/* Mention popup */}
      {mentionOpen && (
        <div className="absolute bottom-full left-2 right-2 mb-1 z-20">
          <MentionPopup
              textDecorators={textDecorators.keys}
            members={members?.filter(m => !m.isCurrentUser)}
            filter=""
            onSelect={handleMentionSelect}
            onClose={() => setMentionOpen(false)}
          />
        </div>
      )}

      {/* Reply preview bar */}
      {isReplying && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
          <div className="w-0.5 h-8 bg-primary rounded-full shrink-0" />
          <div className="flex-1 min-w-0 col gap0.5">
            <AppTypo
              variant="xs"
              className="font-semibold text-primary truncate"
            >
              {t("replying_to")} {replyTo.actor?.name ?? "Unknown"}
            </AppTypo>
            <AppTypo variant="xs" color="secondary" className="truncate">
              {replyTo.body}
            </AppTypo>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="shrink-0 size-5 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <AppIcon icon={sharedIcons.close} className="size-3" />
          </button>
        </div>
      )}

      {/* Edit mode bar */}
      {isEditing && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-warning/10">
          <AppIcon
            icon="hugeicons:edit-02"
            className="size-3.5 text-warning shrink-0"
          />
          <AppTypo variant="xs" className="font-semibold text-warning flex-1">
            {t("editing_message")}
          </AppTypo>
          <button
            type="button"
            onClick={onCancelEdit}
            className="shrink-0 size-5 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <AppIcon icon={sharedIcons.close} className="size-3" />
          </button>
        </div>
      )}

      {/* Editable text area */}
      <div className="px-3 pt-2.5 max-h-32 overflow-y-auto">
        <EditableDiv
          ref={divRef}
          initialValue={initialValue}
          onChange={val => {
            if (!val.includes("@") && mentionOpen) {
              setMentionOpen(false);
            }
          }}
          onKeyUp={onKeyUp}
          onKeydown={onKeyDown}
          className="max-h-28 min-h-[36px] text-sm"
          placeholder={placeholder}
          inputText={value}
          setInputText={setValue}
        />
      </div>

      {/* Footer toolbar */}
      <div className="flex items-center gap-1 px-2 pb-2 pt-1">
        <AppIconButton
          icon="iconoir:at-sign"
          size="sm"
          onClick={handleMentionButtonClick}
          title={tChat("mention_user")}
          iconClassName={mentionOpen ? "text-primary" : ""}
        />

        <EmojiPicker onChange={handleEmojiSelect} />

        <SpeechToText
          className="ms-auto"
          transcript={value}
          setTranscript={handleTranscript}
          size="sm"
        />

        <AppIconButton
          icon={sharedIcons.send}
          size="sm"
          variant="fill"
          onClick={handleSend}
          disabled={disabled || !value.trim() || textDecorators.count > 1}
          title={tChat( textDecorators.count > 1 ? "only_one_decorator" : "send_message")}
          className="rounded-full"

        />
      </div>
    </div>
  );
};

export default ChatInput;
