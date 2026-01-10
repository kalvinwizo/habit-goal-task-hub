import { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PRESET_CATEGORIES, Category } from '@/types';

interface CategoryManagerProps {
  customCategories: Category[];
  onAddCategory: (category: Category) => void;
  onRemoveCategory: (id: string) => void;
}

const COLOR_OPTIONS = [
  'hsl(142, 76%, 36%)', // Green
  'hsl(221, 83%, 53%)', // Blue
  'hsl(262, 83%, 58%)', // Purple
  'hsl(45, 93%, 47%)', // Yellow
  'hsl(199, 89%, 48%)', // Cyan
  'hsl(350, 89%, 60%)', // Red
  'hsl(25, 95%, 53%)', // Orange
  'hsl(300, 76%, 50%)', // Magenta
];

export function CategoryManager({ customCategories, onAddCategory, onRemoveCategory }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  const handleAdd = () => {
    if (!newName.trim()) return;
    
    const newCategory: Category = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      color: selectedColor,
      isPreset: false,
    };
    
    onAddCategory(newCategory);
    setNewName('');
  };

  const allCategories = [...PRESET_CATEGORIES, ...customCategories];

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Tag className="w-4 h-4" />
        Life Categories
      </h4>

      {/* Category List */}
      <div className="space-y-2">
        {allCategories.map(category => (
          <div 
            key={category.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
          >
            <div 
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <span className="flex-1 text-sm">{category.name}</span>
            {!category.isPreset && (
              <button
                onClick={() => onRemoveCategory(category.id)}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {category.isPreset && (
              <span className="text-xs text-muted-foreground">Preset</span>
            )}
          </div>
        ))}
      </div>

      {/* Add New Category */}
      <div className="space-y-3 pt-2 border-t">
        <p className="text-sm text-muted-foreground">Add Custom Category</p>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Color Picker */}
        <div className="flex gap-2">
          {COLOR_OPTIONS.map(color => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-7 h-7 rounded-full transition-transform ${
                selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
