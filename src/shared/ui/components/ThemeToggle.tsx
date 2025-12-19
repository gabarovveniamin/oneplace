import { Moon, Sun } from "lucide-react";
import { Button } from "./button";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className="w-10 h-10 p-0 rounded-full transition-all duration-300 hover:scale-110 hover:bg-accent/50"
      aria-label="Переключить тему"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500 transition-transform duration-300 hover:rotate-180" />
      ) : (
        <Moon className="h-5 w-5 text-blue-600 transition-transform duration-300" />
      )}
    </Button>
  );
}
