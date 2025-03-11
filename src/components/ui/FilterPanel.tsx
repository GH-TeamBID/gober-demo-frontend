
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { FilterState } from '@/types/types';
import { CATEGORIES, LOCATIONS, STATUSES } from '@/data/mockTenders';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleBudgetChange = (values: number[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      budgetRange: [values[0], values[1]],
    }));
  };
  
  const handleCategoryChange = (category: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category]
        : prev.categories.filter((c) => c !== category),
    }));
  };
  
  const handleLocationChange = (location: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      states: checked
        ? [...prev.states, location]
        : prev.states.filter((s) => s !== location),
    }));
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
      budgetRange: [0, 10000000],
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
                ${localFilters.budgetRange[0].toLocaleString()}
              </span>
              <span className="text-sm font-medium">
                ${localFilters.budgetRange[1].toLocaleString()}
              </span>
            </div>
            <Slider
              defaultValue={[localFilters.budgetRange[0], localFilters.budgetRange[1]]}
              min={0}
              max={10000000}
              step={50000}
              value={[localFilters.budgetRange[0], localFilters.budgetRange[1]]}
              onValueChange={handleBudgetChange}
              className="my-4"
            />
          </div>
          
          {/* Categories */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="categories">
              <AccordionTrigger className="text-lg font-medium">
                Categories
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={localFilters.categories.includes(category)}
                        onCheckedChange={(checked) =>
                          handleCategoryChange(category, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          {/* States/Locations */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="locations">
              <AccordionTrigger className="text-lg font-medium">
                State
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  {LOCATIONS.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location}`}
                        checked={localFilters.states.includes(location)}
                        onCheckedChange={(checked) =>
                          handleLocationChange(location, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`location-${location}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
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
