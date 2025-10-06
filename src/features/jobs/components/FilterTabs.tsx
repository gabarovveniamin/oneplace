import { Badge } from "../../../shared/ui/components/badge";
import { Briefcase, Clock, Rocket, MapPin } from "lucide-react";

interface FilterTabsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const filters = [
    { id: 'all', label: 'Все', icon: Briefcase },
    { id: 'full-time', label: 'Вакансии', icon: Briefcase },
    { id: 'daily', label: 'Подработки на день', icon: Clock },
    { id: 'projects', label: 'Проекты/стартапы', icon: Rocket },
    { id: 'travel', label: 'Командировки', icon: MapPin },
  ];

  return (
    <div className="bg-card py-6 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-4">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
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
  );
}