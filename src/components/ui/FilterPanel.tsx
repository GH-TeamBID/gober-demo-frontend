import { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterState } from '@/types/types';
import { apiClient } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const STATUSES = ['Open', 'Evaluation', 'Awarded', 'Result'];

interface CPVCodeResponse {
  code: string;
  description: string;
  es_description: string;
}

interface PaginatedCPVResponse {
  items: CPVCodeResponse[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: FilterPanelProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  
  const [categoryInput, setCategoryInput] = useState('');
  const [categorySearchResults, setCategorySearchResults] = useState<CPVCodeResponse[]>([]);
  const [isSearchingCategory, setIsSearchingCategory] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  
  const categoryInputRef = useRef<HTMLInputElement>(null);
  const categorySuggestionsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  useEffect(() => {
    console.log("Input changed:", categoryInput);
    
    if (!categoryInput.trim() || categoryInput.length < 2) {
      console.log("Input too short, hiding suggestions");
      setCategorySearchResults([]);
      return;
    }

    setIsSearchingCategory(true);
    setShowCategorySuggestions(true);
    
    console.log("Setting up search timer for:", categoryInput);
    const timer = setTimeout(() => {
      console.log("Executing search for:", categoryInput);
      searchCpvCodes(categoryInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [categoryInput]);
  
  const searchCpvCodes = async (query: string) => {
    if (query.trim().length < 2) return;
    
    console.log("Searching CPV codes for:", query);
    setIsSearchingCategory(true);
    
    try {
      const params: Record<string, string | number> = {
        limit: 10,
        lang: 'en'
      };
      
      if (/^\d+$/.test(query)) {
        params.code = query;
      } else {
        params.description = query;
      }
      
      console.log("API params:", params);
      const response = await apiClient.get<PaginatedCPVResponse>('/auth/cpv-codes', { params });
      console.log("API response:", response.data);
      
      setCategorySearchResults(response.data.items);
      setShowCategorySuggestions(true);
    } catch (error) {
      console.error("Error fetching CPV codes:", error);
      setCategorySearchResults([]);
    } finally {
      setIsSearchingCategory(false);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryInputRef.current && !categoryInputRef.current.contains(event.target as Node) &&
          categorySuggestionsRef.current && !categorySuggestionsRef.current.contains(event.target as Node)) {
        setShowCategorySuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleBudgetChange = (values: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      budgetRange: [values[0], values[1]],
    }));
  };
  
  const handleAddCategory = (category: string) => {
    if (category && !localFilters.categories.includes(category)) {
      setLocalFilters(prev => ({
        ...prev,
        categories: [...prev.categories, category]
      }));
    }
    setCategoryInput('');
    setShowCategorySuggestions(false);
  };
  
  const handleCategorySelect = (cpv: CPVCodeResponse) => {
    console.log("Selected category:", cpv);
    const categoryValue = `${cpv.code} - ${cpv.description}`;
    if (!localFilters.categories.includes(categoryValue)) {
      setLocalFilters(prev => ({
        ...prev,
        categories: [...prev.categories, categoryValue]
      }));
    }
    setCategoryInput('');
    setShowCategorySuggestions(false);
  };
  
  const handleCategoryChange = (category: string, remove: boolean) => {
    if (remove) {
      setLocalFilters((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c !== category),
      }));
    }
  };
  
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log("Input changing to:", value);
    setCategoryInput(value);
    
    if (value.length >= 2) {
      setShowCategorySuggestions(true);
    }
  };
  
  const handleStatusChange = (status: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      status: checked
        ? [...prev.status, status]
        : prev.status.filter((s) => s !== status),
    }));
  };
  
  const handleDateChange = (field: 'from' | 'to', date: Date | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: date ? format(date, 'yyyy-MM-dd') : null,
      },
    }));
  };
  
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters: FilterState = {
      budgetRange: [0, 20000000],
      categories: [],
      states: [],
      dateRange: {
        from: null,
        to: null,
      },
      status: [],
    };
    
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };
  
  return (
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gober-primary-800 shadow-xl transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white dark:bg-gober-primary-800 border-b">
          <h2 className="text-xl font-semibold">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Budget Range */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Budget Range</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {localFilters.budgetRange[0].toLocaleString()} €
              </span>
              <span className="text-sm font-medium">
                {localFilters.budgetRange[1].toLocaleString()} €
              </span>
            </div>
            <Slider
              defaultValue={[localFilters.budgetRange[0], localFilters.budgetRange[1]]}
              min={0}
              max={20000000}
              step={50000}
              value={[localFilters.budgetRange[0], localFilters.budgetRange[1]]}
              onValueChange={handleBudgetChange}
              className="my-4"
            />
          </div>
          
          <div className="space-y-3">
            <Label className="text-lg font-medium">Categories</Label>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {localFilters.categories.map((category) => (
                <Badge 
                  key={category} 
                  variant="secondary"
                  className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
                >
                  {category}
                  <X 
                    className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
                    onClick={() => handleCategoryChange(category, true)}
                  />
                </Badge>
              ))}
            </div>
            
            <div className="relative">
              <Input 
                ref={categoryInputRef}
                value={categoryInput}
                onChange={handleCategoryInputChange}
                onFocus={() => {
                  console.log("Input focused, length:", categoryInput.length);
                  if (categoryInput.length >= 2) {
                    setShowCategorySuggestions(true);
                  }
                }}
                placeholder="Search for CPV code or description..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && categoryInput.trim()) {
                    handleAddCategory(categoryInput.trim());
                  }
                }}
              />
              
              {(showCategorySuggestions) && (
                <div 
                  ref={categorySuggestionsRef}
                  className="absolute z-[100] w-full mt-1 bg-white dark:bg-gober-primary-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {isSearchingCategory ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gober-accent-500 mr-2" />
                      <span>Searching...</span>
                    </div>
                  ) : categorySearchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No categories found. Try a different search term.
                    </div>
                  ) : (
                    categorySearchResults.map(cpv => (
                      <div
                        key={cpv.code}
                        className="px-4 py-2 cursor-pointer hover:bg-gober-accent-500/10 dark:hover:bg-gober-primary-700"
                        onClick={() => handleCategorySelect(cpv)}
                      >
                        <div className="font-medium">{cpv.code}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {cpv.description}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Status */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="status">
              <AccordionTrigger className="text-lg font-medium">
                Status
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {STATUSES.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={localFilters.status.includes(status)}
                        onCheckedChange={(checked) =>
                          handleStatusChange(status, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`status-${status}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* Date Range */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Date Range</Label>
            <div className="flex flex-col space-y-2">
              <div className="grid gap-2">
                <Label htmlFor="from-date" className="text-sm font-medium">
                  From
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="from-date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.dateRange.from && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange.from ? (
                        format(new Date(localFilters.dateRange.from), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        localFilters.dateRange.from
                          ? new Date(localFilters.dateRange.from)
                          : undefined
                      }
                      onSelect={(date) => handleDateChange('from', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="to-date" className="text-sm font-medium">
                  To
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="to-date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !localFilters.dateRange.to && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange.to ? (
                        format(new Date(localFilters.dateRange.to), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        localFilters.dateRange.to
                          ? new Date(localFilters.dateRange.to)
                          : undefined
                      }
                      onSelect={(date) => handleDateChange('to', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 p-4 bg-white dark:bg-gober-primary-800 border-t flex items-center justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button onClick={handleApply} className="bg-gober-accent-500 hover:bg-gober-accent-600">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
