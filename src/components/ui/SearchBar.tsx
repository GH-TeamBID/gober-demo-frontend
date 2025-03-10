
import React, { useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onSearch,
  placeholder = 'Search by tender name, ID, category, or keyword',
}: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
    inputRef.current?.focus();
  };

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
          placeholder={placeholder}
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
              <span className="sr-only">Clear search</span>
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
