import React, {
  useState,
  useRef,
  useCallback,
  type FC,
} from "react";

import EmojiPicker from "@/components/features/comment/EmojiPicker";
import EditableDiv from "@/components/shared/EditableDiv";
import SpeechToText from "@/components/shared/SpeechToText";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";

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
 * Chat message input using EditableDiv (contentEditable) for real-time
 * mention highlighting in primary color -- same approach as CommentTextField.
 *
 * Footer: [mention button] [emoji] --- spacer --- [voice] [send]
 */
const ChatInput: FC<ChatInputProps> = ({
  members,
  onSend,
  placeholder = "Write Your Message...!",
  disabled = false,
  className,
}) => {
  const [value, setValue] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [mentionOpen, setMentionOpen] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  /** Detect `@` key to open mention popup */
  const onKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "@") {
        setMentionOpen(true);
      }
      // Send on Enter (without Shift)
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );

  /** Handle Enter to send (prevent newline) */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      if (e.key === "Escape" && mentionOpen) {
        setMentionOpen(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, mentionOpen],
  );

  /** Insert mention text (same pattern as CommentTextField) */
  const handleMentionSelect = useCallback(
    (mention: string) => {
      // Append mention like CommentTextField does:
      // if text already ends with @, don't add another one
      const newValue = `${value}${value.endsWith("@") ? "" : "@"}${mention} `;
      setInitialValue(newValue);
      setMentionOpen(false);
    },
    [value],
  );

  /** Open mention popup from button click */
  const handleMentionButtonClick = () => {
    setMentionOpen(prev => !prev);
  };

  /** Handle emoji insertion */
  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setInitialValue(value + emoji);
    },
    [value],
  );

  /** Handle speech-to-text transcript */
  const handleTranscript = useCallback(
    (transcript: string) => {
      setInitialValue(transcript);
    },
    [],
  );

  /** Send message */
  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    setInitialValue("");
    if (divRef.current) {
      divRef.current.innerText = "";
    }
  }, [value, onSend]);

  return (
    <div
      className={cn(
        "relative flex flex-col border-t bg-popover",
        className,
      )}
    >
      {/* Mention popup - positioned above the input */}
      {mentionOpen && (
        <div
          className="absolute bottom-full left-2 right-2 mb-1 z-20"
          data-mention-popup
        >
          <MentionPopup
            members={members}
            filter=""
            onSelect={handleMentionSelect}
            onClose={() => setMentionOpen(false)}
          />
        </div>
      )}

      {/* Editable text area with mention highlighting */}
      <div className="px-3 pt-2.5 max-h-32 overflow-y-auto">
        <EditableDiv
          ref={divRef}
          initialValue={initialValue}
          onChange={setValue}
          onKeyUp={onKeyUp}
          onKeydown={onKeyDown}
          className="max-h-28 min-h-[36px] text-sm"
          placeholder={placeholder}
          inputText={value}
          setInputText={setValue}
        />
      </div>

      {/* Footer toolbar */}
      <div className="flex items-center gap-0.5 px-3 pb-2.5 pt-1">
        {/* Mention button */}
        <AppIconButton
          icon="iconoir:at-sign"
          size="default"
          onClick={handleMentionButtonClick}
          title="Mention user"
          iconClassName={mentionOpen ? "text-primary" : ""}
        />

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
