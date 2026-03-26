import { Briefcase, Clock, Rocket, MapPin } from "lucide-react";

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const filters = [
    { id: "all", label: "Все", icon: Briefcase },
    { id: "full-time", label: "Вакансии", icon: Briefcase },
    { id: "daily", label: "Подработки", icon: Clock },
    { id: "projects", label: "Проекты", icon: Rocket },
    { id: "travel", label: "Командировки", icon: MapPin },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;

              return (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  className={`inline-flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
