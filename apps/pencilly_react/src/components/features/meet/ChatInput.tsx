import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  type FC,
} from "react";

import EmojiPicker from "@/components/features/comment/EmojiPicker";
import SpeechToText from "@/components/shared/SpeechToText";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAutosizeTextArea } from "@/hooks/useAutosizeTextArea";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { promptVariant } from "@/components/ui/variants";

import MentionPopup from "./MentionPopup";
import type { MeetUser } from "./types";

interface ChatInputProps {
  members: MeetUser[];
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Chat message input with auto-resize textarea, mention popup,
 * emoji picker, and speech-to-text integration.
 */
const ChatInput: FC<ChatInputProps> = ({
  members,
  onSend,
  placeholder = "Write Your Message...!",
  disabled = false,
  className,
}) => {
  const [value, setValue] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(
    null,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useAutosizeTextArea(textareaRef.current, value);

  /** Handle textarea value change and detect `@` for mention popup */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      const cursorPos = e.target.selectionStart ?? newValue.length;

      // Check if we just typed an @ or are in the middle of a mention
      const textBeforeCursor = newValue.slice(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf("@");

      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show mention popup if there's no space after @
        if (!/\s/.test(textAfterAt)) {
          setMentionOpen(true);
          setMentionStartIndex(lastAtIndex);
          setMentionFilter(textAfterAt);
          return;
        }
      }

      setMentionOpen(false);
      setMentionStartIndex(null);
      setMentionFilter("");
    },
    [],
  );

  /** Insert a mention into the text at the correct position */
  const handleMentionSelect = useCallback(
    (mention: string) => {
      if (mentionStartIndex === null) {
        // Append mention if opened via button
        setValue(prev => {
          const needsSpace = prev.length > 0 && !prev.endsWith(" ");
          return prev + (needsSpace ? " " : "") + mention;
        });
      } else {
        // Replace the @filter with the selected mention
        setValue(prev => {
          const before = prev.slice(0, mentionStartIndex);
          const cursorPos = textareaRef.current?.selectionStart ?? prev.length;
          const after = prev.slice(cursorPos);
          return before + mention + after;
        });
      }

      setMentionOpen(false);
      setMentionStartIndex(null);
      setMentionFilter("");

      // Re-focus textarea
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    },
    [mentionStartIndex],
  );

  /** Open mention popup from button click */
  const handleMentionButtonClick = () => {
    if (mentionOpen) {
      setMentionOpen(false);
      return;
    }
    setMentionOpen(true);
    setMentionStartIndex(null);
    setMentionFilter("");
  };

  /** Handle emoji insertion */
  const handleEmojiSelect = useCallback((emoji: string) => {
    setValue(prev => prev + emoji);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, []);

  /** Handle speech-to-text transcript */
  const handleTranscript = useCallback(
    (transcript: string) => {
      setValue(prev => (prev ? prev + " " + transcript : transcript));
    },
    [],
  );

  /** Send message */
  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    setMentionOpen(false);
  }, [value, onSend]);

  /** Handle keyboard shortcuts */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      if (e.key === "Escape" && mentionOpen) {
        setMentionOpen(false);
      }
    },
    [handleSend, mentionOpen],
  );

  // Close mention popup when clicking outside
  useEffect(() => {
    if (!mentionOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-mention-popup]")) {
        setMentionOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mentionOpen]);

  return (
    <div className={cn("relative flex flex-col border-t bg-popover", className)}>
      {/* Mention popup - positioned above the input */}
      {mentionOpen && (
        <div
          className="absolute bottom-full left-2 right-2 mb-1 z-20"
          data-mention-popup
        >
          <MentionPopup
            members={members}
            filter={mentionFilter}
            onSelect={handleMentionSelect}
          />
        </div>
      )}

      {/* Textarea */}
      <div className="px-3 pt-2.5">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={cn(
            promptVariant({ variant: "prompt", color: "input" }),
            "w-full resize-none max-h-32 min-h-[36px] text-sm px-3 py-2 !rounded-lg",
          )}
        />
      </div>

      {/* Footer toolbar */}
      <div className="flex items-center gap-0.5 px-3 pb-2.5 pt-1">
        {/* Mention button */}
        <Popover open={false}>
          <PopoverTrigger asChild>
            <AppIconButton
              icon="hugeicons:mention"
              size="default"
              onClick={handleMentionButtonClick}
              title="Mention user"
              iconClassName={mentionOpen ? "text-primary" : ""}
            />
          </PopoverTrigger>
          <PopoverContent className="hidden" />
        </Popover>

        {/* Emoji picker */}
        <EmojiPicker onChange={handleEmojiSelect} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Speech to text */}
        <SpeechToText
          transcript={value}
          setTranscript={handleTranscript}
        />

        {/* Send button */}
        <AppIconButton
          icon={sharedIcons.send}
          size="default"
          variant="fill"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          title="Send message"
          className="rounded-full"
        />
      </div>
    </div>
  );
};

export default ChatInput;
