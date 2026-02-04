import type React from "react";
import { useEffect, useRef, useState } from "react";

import { ChatMessage } from "@/components/features/call/types";
import AppIconButton from "@/components/ui/custom/app-icon-button";
import AppTypo from "@/components/ui/custom/app-typo";
import { cn } from "@/lib/utils";
import { sharedIcons } from "@/constants/icons";
import { useTranslations } from "@/i18n";
import ReactMarkdown from "react-markdown";
import {useAutosizeTextArea} from "@/hooks/useAutosizeTextArea";
import {inputVariant} from "@/components/ui/variants";

interface CallChatProps {
  messages: ChatMessage[];
  isConnected: boolean;
  onSendMessage: (text: string) => boolean;
  className?: string;
}

export function CallChat({
  messages,
  isConnected,
  onSendMessage,
  className,
}: CallChatProps) {
  const t = useTranslations("call");
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textareaRef.current, inputValue)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const success = onSendMessage(inputValue.trim());
    if (success) {
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <AppTypo variant="small" color="muted">
              {t("no_messages")}
            </AppTypo>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map(msg => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t p-3">
        <textarea
            rows={1}
            ref={textareaRef}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("type_message")}
          disabled={!isConnected}
          className={cn(
              inputVariant({size: "default", color: "input", variant: "input" }),
              "flex-1 min-h-8 resize-none max-h-40 py-1.5 px-3"
          )}
        />
        <AppIconButton
          icon={sharedIcons.send}
          onClick={handleSend}
          disabled={!isConnected || !inputValue.trim()}
          variant="fill"
          className="shrink-0"
        />
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const t = useTranslations("call");
  const isAi = message.sender?.is_ai;
  const isPending = message.status === "pending";
  const isError = message.status === "error";

  return (
    <div
      className={cn(
        "rounded px-3 py-2",
        isAi ? "bg-primary-lighter border border-primary/20" : "bg-muted",
        isPending && "opacity-70",
        isError && "border-danger/50 bg-danger/10",
      )}
    >
      <div className="mb-1 row gap-2">
        <AppTypo variant="small" color="primary" className="first-letter:capitalize">
          {message.sender?.name || t("unknown")}
        </AppTypo>
        {message.createdAt && (
          <AppTypo variant="xs" color="secondary" className="pt-[1px]" >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </AppTypo>
        )}
        {isPending && (
          <AppTypo variant="xs" color="secondary">
            · {t("thinking")}
          </AppTypo>
        )}
      </div>
      <div className="prose prose-sm max-w-full break-words dark:prose-invert">
        <ReactMarkdown>{message.text}</ReactMarkdown>
      </div>
    </div>
  );
}
