"use client";

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const ModeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <Menu onAction={(value) => setTheme(value)}>
      <MenuTrigger
        aria-label="Toggle theme"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 dark:border-gray-700"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </MenuTrigger>
      <MenuContent className="rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-800 dark:bg-gray-950">
        <MenuItem value="light">Light</MenuItem>
        <MenuItem value="dark">Dark</MenuItem>
        <MenuItem value="system">System</MenuItem>
      </MenuContent>
    </Menu>
  );
};
