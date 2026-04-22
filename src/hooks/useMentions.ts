import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function useMentions(textareaRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorIndex, setCursorIndex] = useState(0);
  const supabase = createClient();

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;

    const text = el.value;
    const selectionStart = el.selectionStart || 0;
    setCursorIndex(selectionStart);

    // Look for the last "@" before the cursor
    const textBeforeCursor = text.substring(0, selectionStart);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      // Check if there's a space before @ (start of word) or if @ is at the start
      const charBeforeAt = textBeforeCursor[lastAtSymbol - 1];
      if (!charBeforeAt || /\s/.test(charBeforeAt)) {
        const query = textBeforeCursor.substring(lastAtSymbol + 1);
        
        // Only show if no space is in the query (searching one word)
        if (!/\s/.test(query)) {
          setSearchQuery(query);
          setShowSuggestions(true);
          
          // Calculate position (simple approx or use a library)
          // For now, we usually positioning it relative to the cursor is hard 
          // but we can at least show it near the textarea.
          const coords = getCursorXY(el, selectionStart);
          setMentionPosition(coords);
          return;
        }
      }
    }

    setShowSuggestions(false);
  }, [textareaRef]);

  const insertMention = (username: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const text = el.value;
    const textBeforeCursor = text.substring(0, cursorIndex);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    const before = text.substring(0, lastAtSymbol);
    const after = text.substring(cursorIndex);
    
    const newText = `${before}@${username} ${after}`;
    
    // This is tricky for React controlled components, we need to return this 
    // to the parent component to update state.
    setShowSuggestions(false);
    return newText;
  };

  return {
    showSuggestions,
    searchQuery,
    mentionPosition,
    handleInput,
    insertMention,
    setShowSuggestions
  };
}

// Helper to get cursor coordinates (very simplified version)
function getCursorXY(el: HTMLTextAreaElement | HTMLInputElement, index: number) {
  const { offsetLeft, offsetTop } = el;
  // This is a rough estimation for standard inputs
  // For absolute precision, one usually uses a hidden mirror div
  return {
    top: offsetTop + 30, // Show below current line approx
    left: offsetLeft + 10
  };
}
