
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const tenderTypes = [
  "Open", "Restricted", "Competitive with negotiation", 
  "Competitive dialogue", "Innovation partnership", "Direct award"
];

const SearchCriteriaSettings = () => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedCPV, setSelectedCPV] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 1000000]);

  const handleRemoveKeyword = (keyword: string) => {
    setSelectedKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handleRemoveCPV = (cpv: string) => {
    setSelectedCPV(prev => prev.filter(c => c !== cpv));
  };

  const handleRemoveType = (type: string) => {
    setSelectedTypes(prev => prev.filter(t => t !== type));
  };

  const handleAddType = (type: string) => {
    if (type && !selectedTypes.includes(type)) {
      setSelectedTypes(prev => [...prev, type]);
    }
  };

  const formatBudgetValue = (value: number) => {
    return `£${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Search Criteria</h2>

      <div className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="cpv-input">CPV Codes</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCPV.map((cpv) => (
              <Badge 
                key={cpv} 
                variant="secondary"
                className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
              >
                {cpv}
                <X 
                  className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
                  onClick={() => handleRemoveCPV(cpv)}
                />
              </Badge>
            ))}
          </div>
          <Input 
            id="cpv-input"
            placeholder="Type a CPV code and press Enter..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value && !selectedCPV.includes(value)) {
                  setSelectedCPV(prev => [...prev, value]);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="keyword-input">Keywords</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedKeywords.map((keyword) => (
              <Badge 
                key={keyword} 
                variant="secondary"
                className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
              >
                {keyword}
                <X 
                  className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
                  onClick={() => handleRemoveKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>
          <Input 
            id="keyword-input"
            placeholder="Type a keyword and press Enter..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value && !selectedKeywords.includes(value)) {
                  setSelectedKeywords(prev => [...prev, value]);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
        
        <div className="space-y-3">
          <Label>Tender Types</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTypes.map((type) => (
              <Badge 
                key={type} 
                variant="secondary"
                className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
              >
                {type}
                <X 
                  className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
                  onClick={() => handleRemoveType(type)}
                />
              </Badge>
            ))}
          </div>
          <Select onValueChange={handleAddType}>
            <SelectTrigger>
              <SelectValue placeholder="Select tender type" />
            </SelectTrigger>
            <SelectContent>
              {tenderTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4 bg-gober-bg-100 dark:bg-gober-primary-700/30 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <Label className="text-base">Budget Range</Label>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-gober-bg-200 dark:bg-gober-primary-700">
              {formatBudgetValue(budgetRange[0])} - {formatBudgetValue(budgetRange[1])}
            </span>
          </div>
          <div className="pt-2 px-1">
            <Slider 
              value={[budgetRange[0], budgetRange[1]]} 
              max={1000000} 
              step={10000}
              onValueChange={(value) => setBudgetRange([value[0], value[1]])}
              className="my-6"
            />
            <div className="flex justify-between mt-2 text-sm text-gober-primary-600 dark:text-gray-400">
              <span>£0</span>
              <span>£1,000,000</span>
            </div>
          </div>
        </div>
        
        <Button className="w-full mt-6">Save Search Criteria</Button>
      </div>
    </div>
  );
};

export default SearchCriteriaSettings;
