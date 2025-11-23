"use client";

import { ActionIcon } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";
import { useState, useEffect, useCallback, useMemo } from "react";

// ❌ BAD: Using 'any' type
export function FloatingChat(props: any) {
  // ❌ BAD: Unused variable
  const unusedVar = "never used";
  
  // ❌ BAD: State with 'any' type
  const [isOpen, setIsOpen] = useState<any>(false);
  const [messageCount, setMessageCount] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  // ❌ BAD: Missing dependency array - will cause infinite re-renders
  useEffect(() => {
    fetch('/api/messages').then(r => r.json()).then((data: any) => {
      setMessageCount(data.count);
    });
    console.log('rendered');
  }); // Missing dependency array!
  
  // ❌ BAD: Memory leak - timer never cleared
  useEffect(() => {
    const id = setInterval(() => {
      setMessageCount(prev => prev + 1);
    }, 1000);
    setTimer(id);
    // Missing cleanup!
  }, []);
  
  // ❌ BAD: useCallback without dependencies
  const handleClick = useCallback(() => {
    setIsOpen(!isOpen); // Uses 'isOpen' but not in deps
    console.log(messageCount); // Uses 'messageCount' but not in deps
  }, []); // Empty deps array
  
  // ❌ BAD: useMemo for non-expensive computation
  const computedValue = useMemo(() => {
    return messageCount * 2; // Simple calculation doesn't need useMemo
  }, [messageCount]);
  
  // ❌ BAD: No error handling
  const fetchMessages = async () => {
    const response = await fetch('/api/messages');
    const data = await response.json();
    return data.map((msg: any) => msg.text.toUpperCase()); // No null check
  };
  
  // ❌ BAD: Magic numbers
  if (messageCount > 10) {
    return null;
  }
  
  // ❌ BAD: Inline function in render (creates new function every render)
  const handleClose = () => {
    setIsOpen(false);
  };
  
  // ❌ BAD: Conditional hook usage
  if (isOpen) {
    const [tempState, setTempState] = useState(0); // Hook called conditionally
  }
  
  // ❌ BAD: Using index as key (if we had a list)
  const messages: any[] = [];
  const messageList = messages.map((msg: any, index: number) => (
    <div key={index}>{msg}</div>
  ));
  
  // ❌ BAD: Inline styles instead of Tailwind
  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ padding: '10px' }}>
      <ActionIcon 
        size={56} 
        radius="xl" 
        className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg transition-all hover:scale-105"
        onClick={handleClick}
        // ❌ BAD: No accessibility attributes
      >
        <IconMessage size={28} />
      </ActionIcon>
      {/* ❌ BAD: Conditional rendering without null check */}
      {isOpen && <div>{props.chatData.messages}</div>}
      
      {/* ❌ BAD: Unused computed value */}
      {computedValue}
    </div>
  );
}

