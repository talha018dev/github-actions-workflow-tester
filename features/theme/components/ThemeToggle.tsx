"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
      <ActionIcon
        variant="subtle"
        size="lg"
        onClick={toggleTheme}
        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <IconMoon size={20} />
        ) : (
          <IconSun size={20} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

