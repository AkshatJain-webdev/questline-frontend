"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

// The in-data classes mark the current theme straight from the data-color attribute on <html>.
const COLOR_THEMES = [
  { name: "indigo", swatchClasses: "bg-indigo-600 in-data-[color=indigo]:ring-2" },
  { name: "emerald", swatchClasses: "bg-emerald-600 in-data-[color=emerald]:ring-2" },
  { name: "rose", swatchClasses: "bg-rose-600 in-data-[color=rose]:ring-2" },
  { name: "amber", swatchClasses: "bg-amber-500 in-data-[color=amber]:ring-2" },
];

function applyColorTheme(name: string) {
  document.documentElement.dataset.color = name;
  localStorage.setItem("color-theme", name);
}

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:hidden">
        {COLOR_THEMES.map((colorTheme) => (
          <button
            key={colorTheme.name}
            type="button"
            aria-label={`Use the ${colorTheme.name} colour theme`}
            className={`size-4 cursor-pointer rounded-full ring-foreground ring-offset-2 ring-offset-sidebar ${colorTheme.swatchClasses}`}
            onClick={() => applyColorTheme(colorTheme.name)}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Switch between light and dark mode"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        <Sun className="dark:hidden" />
        <Moon className="hidden dark:block" />
      </Button>
    </div>
  );
}
