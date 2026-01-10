import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { PRESET_CATEGORIES, HabitFrequency, HabitDifficulty } from '@/types';
import { Badge } from '@/components/ui/badge';

export interface HabitFilters {
  categories: string[];
  difficulties: HabitDifficulty[];
  frequencies: HabitFrequency[];
}

interface HabitFiltersProps {
  filters: HabitFilters;
  onFiltersChange: (filters: HabitFilters) => void;
  customCategories: string[];
}

export function HabitFiltersComponent({ filters, onFiltersChange, customCategories }: HabitFiltersProps) {
  const allCategories = [...PRESET_CATEGORIES.map(c => c.name), ...customCategories];
  const difficulties: HabitDifficulty[] = ['easy', 'medium', 'hard'];
  const frequencies: HabitFrequency[] = ['daily', 'weekly', 'specific', 'monthly'];

  const activeFiltersCount = 
    filters.categories.length + 
    filters.difficulties.length + 
    filters.frequencies.length;

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleDifficulty = (difficulty: HabitDifficulty) => {
    const newDifficulties = filters.difficulties.includes(difficulty)
      ? filters.difficulties.filter(d => d !== difficulty)
      : [...filters.difficulties, difficulty];
    onFiltersChange({ ...filters, difficulties: newDifficulties });
  };

  const toggleFrequency = (frequency: HabitFrequency) => {
    const newFrequencies = filters.frequencies.includes(frequency)
      ? filters.frequencies.filter(f => f !== frequency)
      : [...filters.frequencies, frequency];
    onFiltersChange({ ...filters, frequencies: newFrequencies });
  };

  const clearFilters = () => {
    onFiltersChange({ categories: [], difficulties: [], frequencies: [] });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filter
          {activeFiltersCount > 0 && (
            <Badge 
              variant="default" 
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filters</h4>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs">
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    filters.categories.includes(category)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Difficulty</p>
            <div className="flex flex-wrap gap-1.5">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() => toggleDifficulty(difficulty)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filters.difficulties.includes(difficulty)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Frequency</p>
            <div className="flex flex-wrap gap-1.5">
              {frequencies.map(frequency => (
                <button
                  key={frequency}
                  onClick={() => toggleFrequency(frequency)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                    filters.frequencies.includes(frequency)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {frequency}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
