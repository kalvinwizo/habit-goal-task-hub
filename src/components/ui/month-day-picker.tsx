import { cn } from '@/lib/utils';

interface MonthDayPickerProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
  className?: string;
}

export function MonthDayPicker({ selectedDays, onChange, className }: MonthDayPickerProps) {
  const toggleDay = (day: number) => {
    onChange(
      selectedDays.includes(day)
        ? selectedDays.filter(d => d !== day)
        : [...selectedDays, day].sort((a, b) => a - b)
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
          <button
            key={day}
            type="button"
            onClick={() => toggleDay(day)}
            className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${
              selectedDays.includes(day)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedDays.length === 0 
          ? 'Select days of the month'
          : `Selected: ${selectedDays.join(', ')}`
        }
      </p>
    </div>
  );
}
