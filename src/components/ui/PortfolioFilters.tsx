import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface FilterOptions {
  technologies: string[];
  categories: string[];
  sortBy: 'newest' | 'oldest' | 'title';
}

interface ServiceFiltersProps {
  onFilterChange: (filters: FilterOptions & { search: string }) => void;
  technologies: string[];
  categories: string[];
}

export function PortfolioFilters({ onFilterChange, technologies, categories }: ServiceFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = () => {
    onFilterChange({
      search,
      technologies: selectedTech,
      categories: selectedCategories,
      sortBy
    });
  };

  const toggleTechnology = (tech: string) => {
    const updated = selectedTech.includes(tech)
      ? selectedTech.filter(t => t !== tech)
      : [...selectedTech, tech];
    setSelectedTech(updated);
    setTimeout(handleFilterChange, 0);
  };

  const toggleCategory = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(updated);
    setTimeout(handleFilterChange, 0);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTech([]);
    setSelectedCategories([]);
    setSortBy('newest');
    onFilterChange({
      search: '',
      technologies: [],
      categories: [],
      sortBy: 'newest'
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setTimeout(handleFilterChange, 300); // Debounce search
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        {/* Search and Main Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(selectedTech.length > 0 || selectedCategories.length > 0) && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTech.length + selectedCategories.length}
                </Badge>
              )}
            </Button>
            {(selectedTech.length > 0 || selectedCategories.length > 0 || search) && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* Sort Options */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort by</label>
              <div className="flex gap-2">
                {[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'oldest', label: 'Oldest First' },
                  { value: 'title', label: 'Alphabetical' }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSortBy(option.value as any);
                      setTimeout(handleFilterChange, 0);
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Technology Filters */}
            {technologies.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Technologies</label>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant={selectedTech.includes(tech) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleTechnology(tech)}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filters */}
            {categories.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}