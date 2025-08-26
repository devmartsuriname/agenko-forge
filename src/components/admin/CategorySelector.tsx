import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminCms } from '@/lib/admin-cms';
import { BlogCategory } from '@/types/content';
import { Plus, Tag } from 'lucide-react';

interface CategorySelectorProps {
  selectedCategoryIds: string[];
  onCategoryChange: (categoryIds: string[]) => void;
  disabled?: boolean;
}

export function CategorySelector({ selectedCategoryIds, onCategoryChange, disabled }: CategorySelectorProps) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await adminCms.getAllBlogCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (disabled) return;
    
    if (checked) {
      onCategoryChange([...selectedCategoryIds, categoryId]);
    } else {
      onCategoryChange(selectedCategoryIds.filter(id => id !== categoryId));
    }
  };

  const selectedCategories = categories.filter(cat => selectedCategoryIds.includes(cat.id));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Loading categories...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 bg-muted-foreground/20 rounded flex-1 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Categories
        </CardTitle>
        <CardDescription>Assign categories to help organize content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Categories */}
        {selectedCategories.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Selected:</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                  style={{ backgroundColor: category.color + '20', color: category.color }}
                >
                  {category.name}
                  {!disabled && (
                    <button
                      onClick={() => handleCategoryToggle(category.id, false)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      aria-label={`Remove ${category.name} category`}
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Category Selection */}
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No categories available</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Category
                </Button>
              </div>
            ) : (
              categories.map(category => (
                <div key={category.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategoryIds.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
                    disabled={disabled}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="flex items-center space-x-2 cursor-pointer flex-1"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.status}
                    </Badge>
                  </Label>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {categories.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Select one or more categories to help readers find related content.
          </p>
        )}
      </CardContent>
    </Card>
  );
}