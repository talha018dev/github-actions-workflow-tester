"use client";

import { ActionIcon } from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";

export function FloatingChat() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ActionIcon 
        size={56} 
        radius="xl" 
        className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-lg transition-all hover:scale-105"
      >
        <IconMessage size={28} />
      </ActionIcon>
    </div>
  );
}

