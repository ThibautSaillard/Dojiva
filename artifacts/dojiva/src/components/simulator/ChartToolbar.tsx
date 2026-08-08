import { MousePointer2, Minus, TrendingUp, Square, Ruler, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool } from "@/features/simulator/types";

interface ChartToolbarProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  onClearDrawings: () => void;
  canClear: boolean;
  className?: string;
}

const TOOLS: Array<{ id: Tool; label: string; icon: typeof Minus }> = [
  { id: "cursor", label: "Curseur", icon: MousePointer2 },
  { id: "hline", label: "Ligne horizontale", icon: Minus },
  { id: "trendline", label: "Ligne de tendance", icon: TrendingUp },
  { id: "zone", label: "Zone support/résistance", icon: Square },
  { id: "measure", label: "Mesurer", icon: Ruler },
];

export function ChartToolbar({
  tool,
  onToolChange,
  onClearDrawings,
  canClear,
  className,
}: ChartToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl shadow-2xl",
        className,
      )}
      data-testid="chart-toolbar"
    >
      {TOOLS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => onToolChange(id)}
          data-testid={`tool-${id}`}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
            tool === id
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
              : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-white/10" />
      <button
        type="button"
        title="Effacer les tracés"
        aria-label="Effacer les tracés"
        onClick={onClearDrawings}
        disabled={!canClear}
        data-testid="tool-clear"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-200 hover:bg-destructive/20 hover:text-destructive disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
