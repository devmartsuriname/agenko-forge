import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

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
  className = '' 
}: ServiceFiltersProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => onCategoryChange(null)}
          >
            All Services
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
          {(selectedCategory || searchQuery) && (
            <Badge
              variant="destructive"
              className="cursor-pointer hover:bg-destructive/10"
              onClick={() => {
                onCategoryChange(null);
                onSearchChange('');
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}