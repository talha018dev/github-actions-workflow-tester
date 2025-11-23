"use client";

import { useMantineColorScheme } from "@mantine/core";
import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

export function MantineThemeSync() {
  const { theme } = useTheme();
  const { setColorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (theme) {
      setColorScheme(theme);
    }
  }, [theme, setColorScheme]);

  return null;
}

