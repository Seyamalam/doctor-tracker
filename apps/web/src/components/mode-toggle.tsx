"use client";

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { btn, cx, menuItemCls, popupAnimCls, popupCls } from "@/components/ui";

export const ModeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <Menu onAction={(value) => setTheme(value)}>
      <MenuTrigger aria-label="Toggle theme" className={btn.icon}>
        <span className="relative flex h-4 w-4 items-center justify-center">
          <Sun className="absolute h-4 w-4 scale-100 rotate-0 transition-[rotate,scale] duration-150 motion-reduce:transition-none dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-[rotate,scale] duration-150 motion-reduce:transition-none dark:scale-100 dark:rotate-0" />
        </span>
      </MenuTrigger>
      <MenuContent
        align="end"
        className={cx(popupCls, popupAnimCls, "w-36 p-1")}
        side="bottom"
        sideOffset={4}
      >
        <MenuItem className={menuItemCls} value="light">
          Light
        </MenuItem>
        <MenuItem className={menuItemCls} value="dark">
          Dark
        </MenuItem>
        <MenuItem className={menuItemCls} value="system">
          System
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};
