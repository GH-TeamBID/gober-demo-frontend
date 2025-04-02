import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  autoSearchDelay?: number;
}

const SearchBar = ({
  value,
  onSearch,
  placeholder,
  autoSearchDelay = 500,
}: SearchBarProps) => {
  const { t } = useTranslation('ui');
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set initial value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Auto-search after typing stops (debounce)
  useEffect(() => {
    // Only trigger search if value has changed from prop
    if (inputValue !== value) {
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      // Set a new timeout
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(inputValue);
      }, autoSearchDelay);
    }
    
    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue, value, onSearch, autoSearchDelay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Apply search immediately
    onSearch(inputValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    // Apply empty search immediately
    onSearch('');
    inputRef.current?.focus();
  };

  // Use translated default placeholder if none provided
  const defaultPlaceholder = placeholder || t('search.placeholder');

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-4xl mx-auto transition-all duration-300"
    >
      <div className="relative group">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={defaultPlaceholder}
          className="w-full h-12 pl-4 pr-12 bg-white dark:bg-gober-primary-800/50 border-2 border-transparent focus:border-gober-accent-500 rounded-lg shadow-sm transition-all duration-300"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {inputValue ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t('search.clearButton')}</span>
            </Button>
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
