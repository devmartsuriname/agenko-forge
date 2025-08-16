import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxTagLength?: number;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function TagInput({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  maxTags = 10,
  maxTagLength = 30,
  className,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [activeTagIndex, setActiveTagIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);

  // Announce changes for screen readers
  const announceRef = useRef<HTMLDivElement>(null);

  const announceChange = (message: string) => {
    if (announceRef.current) {
      announceRef.current.textContent = message;
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (
      trimmedTag &&
      !tags.includes(trimmedTag) &&
      tags.length < maxTags &&
      trimmedTag.length <= maxTagLength
    ) {
      const newTags = [...tags, trimmedTag];
      onTagsChange(newTags);
      setInputValue('');
      announceChange(`Added tag: ${trimmedTag}. Total tags: ${newTags.length}`);
    }
  };

  const removeTag = (index: number) => {
    const removedTag = tags[index];
    const newTags = tags.filter((_, i) => i !== index);
    onTagsChange(newTags);
    announceChange(`Removed tag: ${removedTag}. Total tags: ${newTags.length}`);
    
    // Focus management
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ',':
      case ' ':
        e.preventDefault();
        if (inputValue.trim()) {
          addTag(inputValue);
        }
        break;
      
      case 'Backspace':
        if (!inputValue && tags.length > 0) {
          removeTag(tags.length - 1);
        }
        break;
      
      case 'ArrowLeft':
        if (!inputValue && tags.length > 0) {
          setActiveTagIndex(tags.length - 1);
        }
        break;
      
      case 'ArrowRight':
        setActiveTagIndex(-1);
        break;
      
      case 'Delete':
        if (activeTagIndex >= 0) {
          removeTag(activeTagIndex);
          setActiveTagIndex(-1);
        }
        break;
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        removeTag(index);
        break;
      
      case 'ArrowLeft':
        if (index > 0) {
          setActiveTagIndex(index - 1);
        }
        break;
      
      case 'ArrowRight':
        if (index < tags.length - 1) {
          setActiveTagIndex(index + 1);
        } else {
          setActiveTagIndex(-1);
          inputRef.current?.focus();
        }
        break;
    }
  };

  const errorMessage = tags.length >= maxTags ? `Maximum ${maxTags} tags allowed` : '';

  return (
    <div className={cn("space-y-2", className)}>
      <div 
        ref={tagsContainerRef}
        className={cn(
          "flex flex-wrap gap-2 p-3 border rounded-md min-h-[42px] bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`}
            variant="secondary"
            className={cn(
              "gap-1 pr-1 cursor-pointer transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              activeTagIndex === index && "ring-2 ring-ring"
            )}
            tabIndex={0}
            role="button"
            aria-label={`Tag: ${tag}. Press Delete to remove.`}
            onKeyDown={(e) => handleTagKeyDown(e, index)}
            onFocus={() => setActiveTagIndex(index)}
            onBlur={() => setActiveTagIndex(-1)}
          >
            {tag}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              disabled={disabled}
              aria-label={`Remove tag: ${tag}`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="border-0 shadow-none focus-visible:ring-0 p-0 h-6 flex-1 min-w-[120px]"
          disabled={disabled || tags.length >= maxTags}
          aria-label={ariaLabel || "Add tags"}
          aria-describedby={ariaDescribedBy}
          maxLength={maxTagLength}
        />
      </div>
      
      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
      
      {tags.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {tags.length} / {maxTags} tags
        </p>
      )}

      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  );
}