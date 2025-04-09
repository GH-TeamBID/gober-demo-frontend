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
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Update to use our standardized status values from the backend
const STATUSES = ['Prior notice', 'Published', 'Evaluation', 'Awarded', 'Solved', 'Canceled'];

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
  onReset?: () => void;
}

const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onReset,
}: FilterPanelProps) => {
  const { t, i18n } = useTranslation('ui');
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
        lang: i18n.language === 'es' ? 'es' : 'en'
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
    // Use the appropriate description based on the current language
    const description = i18n.language === 'es' && cpv.es_description ? cpv.es_description : cpv.description;
    const categoryValue = `${cpv.code} - ${description}`;
    
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
    console.log('FilterPanel: Apply button clicked');
    console.log('FilterPanel: Current filter state:', JSON.stringify(localFilters, null, 2));
    
    // Apply the filters
    onApplyFilters(localFilters);
    console.log('FilterPanel: onApplyFilters called, closing panel');
    onClose();
  };
  
  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      setLocalFilters({
        categories: [],
        states: [],
        status: [],
        dateRange: { from: null, to: null },
        budgetRange: [0, 10000000] as [number, number],
      });
    }
  };
  
  // Get localized status labels
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Prior notice': return t('status.priorNotice');
      case 'Published': return t('status.published');
      case 'Evaluation': return t('status.evaluation');
      case 'Awarded': return t('status.awarded');
    case 'Solved': return t('status.solved');
      case 'Canceled': return t('status.canceled');
      default: return status;
    }
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
          <h2 className="text-xl font-semibold">{t('filterPanel.title')}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">{t('filterPanel.close')}</span>
          </Button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Budget Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('filterPanel.budget.title')}</h3>
            <div className="pt-4">
              <Slider
                defaultValue={localFilters.budgetRange}
                min={0}
                max={10000000}
                step={50000}
                onValueChange={handleBudgetChange}
              />
              <div className="flex justify-between mt-2">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('filterPanel.budget.min')}:
                  </span>{' '}
                  <span className="font-medium">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    }).format(localFilters.budgetRange[0])}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('filterPanel.budget.max')}:
                  </span>{' '}
                  <span className="font-medium">
                    {new Intl.NumberFormat('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    }).format(localFilters.budgetRange[1])}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('filterPanel.categories.title')}</h3>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {localFilters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
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
                placeholder={t('filterPanel.categories.placeholder')}
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
                      <span>{t('filterPanel.categories.searching')}</span>
                    </div>
                  ) : categorySearchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      {t('filterPanel.categories.noResults')}
                    </div>
                  ) : (
                    <ul className="py-1">
                      {categorySearchResults.map((cpv) => {
                        // Use the appropriate description based on the current language
                        const description = i18n.language === 'es' && cpv.es_description 
                          ? cpv.es_description 
                          : cpv.description;
                        
                        return (
                          <li
                            key={cpv.code}
                            className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gober-primary-700 cursor-pointer"
                            onClick={() => handleCategorySelect(cpv)}
                          >
                            <div className="font-medium">{cpv.code}</div>
                            <div className="text-gray-600 dark:text-gray-400 text-xs">{description}</div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('filterPanel.status.title')}</h3>
            <div className="flex flex-col space-y-2">
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
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {getStatusLabel(status)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('filterPanel.date.title')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <Label htmlFor="date-from" className="text-sm font-medium">
                  {t('filterPanel.date.from')}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-from"
                      variant={"outline"}
                      className={cn(
                        "w-full mt-1",
                        !localFilters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange.from ? (
                        typeof localFilters.dateRange.from === 'string' ? 
                          localFilters.dateRange.from : 
                          format(localFilters.dateRange.from, "PPP")
                      ) : (
                        <span>{t('filterPanel.date.pickDate')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        localFilters.dateRange.from !== null && typeof localFilters.dateRange.from !== 'string' 
                          ? localFilters.dateRange.from 
                          : undefined
                      }
                      onSelect={(date) => handleDateChange('from', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="date-to" className="text-sm font-medium">
                  {t('filterPanel.date.to')}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date-to"
                      variant={"outline"}
                      className={cn(
                        "w-full mt-1",
                        !localFilters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localFilters.dateRange.to ? (
                        typeof localFilters.dateRange.to === 'string' ? 
                          localFilters.dateRange.to : 
                          format(localFilters.dateRange.to, "PPP")
                      ) : (
                        <span>{t('filterPanel.date.pickDate')}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        localFilters.dateRange.to !== null && typeof localFilters.dateRange.to !== 'string' 
                          ? localFilters.dateRange.to 
                          : undefined
                      }
                      onSelect={(date) => handleDateChange('to', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white dark:bg-gober-primary-800 border-t p-4 flex space-x-4">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            {t('filterPanel.buttons.reset')}
          </Button>
          <Button 
            onClick={handleApply}
            className="flex-1"
          >
            {t('filterPanel.buttons.apply')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
