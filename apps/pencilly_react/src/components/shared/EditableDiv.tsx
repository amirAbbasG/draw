import React, { forwardRef, useEffect } from "react";

import { cn } from "@/lib/utils";

interface Props {
  initialValue?: string;
  className?: string;
  onChange?: (value: string) => void;
  onKeydown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  placeholder?: string;
  setIsFocused?: (v: boolean) => void;
  inputText: string;
  setInputText: StateSetter<string>;
}

const EditableDiv = forwardRef<HTMLDivElement, Props>(
  (
    {
      className = "",
      onKeydown,
      placeholder = "",
      setIsFocused = () => {},
      onChange,
      initialValue,
      onKeyUp,
      inputText,
      setInputText,
    },
    divRef,
  ) => {
    // const divRef = useRef<HTMLDivElement>(null);
    // const [inputText, setInputText] = useState("");

    useEffect(() => {
      if (initialValue !== undefined) {
        let el: HTMLDivElement | null = null;
        if (
          typeof divRef === "object" &&
          divRef !== null &&
          "current" in divRef
        ) {
          el = divRef.current;
        }
        // If divRef is a callback ref, we can't access the element directly here
        if (el) {
          el.innerHTML = highlightMentions(initialValue);
          // ensure DOM updates, then place caret at end
          requestAnimationFrame(() => {
            setCaretPosition(el!, el.innerText.length);
          });
        }
        setInputText(initialValue);
      }
    }, [initialValue]);

    const handleInput = () => {
      let el: HTMLDivElement | null = null;
      if (
        typeof divRef === "object" &&
        divRef !== null &&
        "current" in divRef
      ) {
        el = divRef.current;
      }
      // If divRef is a callback ref, we can't access the element directly here
      if (!el) return;
      // save caret offset in characters
      const caret = getCaretCharacterOffsetWithin(el);
      const text = el.innerText;
      setInputText(text);
      onChange?.(text);
      // re-render highlighted html and restore caret
      el.innerHTML = highlightMentions(text);
      setCaretPosition(el, caret);
    };

    const onPasteHandler = (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text");
      // insert raw text at caret position
      document.execCommand("insertText", false, text);
    };

    return (
      <div className="w-full h-full scrollbar relative">
        <div
          ref={divRef}
          contentEditable
          role="textbox"
          aria-label={placeholder}
          onInput={handleInput}
          onKeyUp={onKeyUp}
          onKeyDown={onKeydown}
          onPaste={onPasteHandler}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "mb-0 h-fit w-full cursor-text border-0 leading-tight outline-none ring-0 overflow-y-auto font-normal text-base",
            className,
          )}
          data-placeholder={placeholder}
        />
        {inputText.trim() === "" && (
          <div className="absolute h-10 top-0 left-0 flex text-base font-light text-foreground-light pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    );
  },
);

export default EditableDiv;

const mentionRegex = /@[\w-]+/g;

const escapeHtml = (unsafe: string) =>
  unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const highlightMentions = (text: string) => {
  if (!text) return "";
  const escaped = escapeHtml(text);
  return escaped
    .replace(mentionRegex, m => {
      // using tailwind-like classes consistent with the project
      return `<span class="mention text-primary ">${m}</span>`;
    })
    .replace(/\n/g, "<br/>");
};

const getCaretCharacterOffsetWithin = (element: Node | null) => {
  const sel = window.getSelection();
  if (!sel || !element) return 0;
  let charCount = 0;
  if (sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.endContainer, range.endOffset);
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    charCount += node.textContent ? node.textContent.length : 0;
  }
  // Fallback: compute by stepping text nodes until the range end
  const rWalker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
  );
  let count = 0;
  node = rWalker.nextNode();
  while (node) {
    if (node === range.endContainer) {
      count += range.endOffset;
      break;
    } else {
      count += node.textContent ? node.textContent.length : 0;
    }
    node = rWalker.nextNode();
  }
  return count;
};

const setCaretPosition = (container: HTMLElement, chars: number) => {
  if (chars <= 0) {
    const first = container.firstChild;
    const range = document.createRange();
    const sel = window.getSelection();
    if (!sel) return;
    if (first && first.nodeType === Node.TEXT_NODE) {
      range.setStart(first, 0);
    } else {
      range.setStart(container, 0);
    }
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    return;
  }
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
  );
  let node: Node | null = walker.nextNode();
  let accumulated = 0;
  while (node) {
    const nodeLen = node.textContent ? node.textContent.length : 0;
    if (accumulated + nodeLen >= chars) {
      const range = document.createRange();
      const sel = window.getSelection();
      if (!sel) return;
      range.setStart(node, chars - accumulated);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    accumulated += nodeLen;
    node = walker.nextNode();
  }
  // fallback: put at the end
  const range = document.createRange();
  const sel = window.getSelection();
  if (!sel) return;
  range.selectNodeContents(container);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
};
