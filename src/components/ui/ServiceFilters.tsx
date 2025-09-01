import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ServiceFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
}

export function ServiceFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  className,
}: ServiceFiltersProps) {
  const clearFilters = () => {
    onCategoryChange(null);
    onSearchChange('');
  };

  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filter by:</span>
        </div>
        
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:scale-105",
            selectedCategory === null 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-primary/10 hover:text-primary"
          )}
          onClick={() => onCategoryChange(null)}
        >
          All Services
        </Badge>

        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:scale-105",
              selectedCategory === category 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-primary/10 hover:text-primary"
            )}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </Badge>
        ))}

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {searchQuery && (
            <span>Searching for "{searchQuery}"</span>
          )}
          {searchQuery && selectedCategory && <span> • </span>}
          {selectedCategory && (
            <span>Category: {selectedCategory}</span>
          )}
        </div>
      )}
    </div>
  );
}