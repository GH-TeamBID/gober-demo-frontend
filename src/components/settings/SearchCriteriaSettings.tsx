import React, { useState, useRef, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

const contractTypes = [
  { type_code: "1", es_description: "Suministros", description: "Goods" },
  { type_code: "2", es_description: "Servicios", description: "Services" },
  { type_code: "3", es_description: "Obras", description: "Works" },
  { type_code: "21", es_description: "Gestión de Servicios Públicos", description: "Public services management" },
  { type_code: "22", es_description: "Concesión de Servicios", description: "Services concession" },
  { type_code: "31", es_description: "Concesión de Obras Púiblicas", description: "Public works concession" },
  { type_code: "32", es_description: "Concesión de Obras", description: "Works concession" },
  { type_code: "40", es_description: "Colaboración entre el sector público y sector privado", description: "Public and private sector collaboration" },
  { type_code: "7", es_description: "Administrativo especial", description: "Special Administrative" },
  { type_code: "8", es_description: "Privado", description: "Private" },
  { type_code: "50", es_description: "Patrimonial", description: "Patrimonial" },
];

// Type for CPV selection
interface CPVCode {
  code: string;
  label: string;
}

// Type for contract type selection
interface ContractType {
  type_code: string;
  description: string;
  es_description: string;
}

// API response types
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

// User criteria response type from backend
interface UserCriteriaResponse {
  id: number;
  user_id: number;
  min_budget: number | null;
  max_budget: number | null;
  cpv_codes: Array<{
    id: number;
    code: string;
    description: string;
    es_description: string;
  }>;
  keywords: Array<{
    id: number;
    keyword?: string;
    word?: string;
    [key: string]: any; // Allow any string property
  }>;
  contract_types?: Array<{
    id: number;
    type_code?: string;
    type_en?: string;
    type_es?: string;
    description?: string;
    es_description?: string;
    [key: string]: any; // Allow any string property
  }>;
}

// Type for creating criteria on the backend
interface UserCriteriaCreate {
  min_budget: number;
  max_budget: number;
  cpv_codes: string[];
  keywords: string[];
  contract_types: string[];
}

const SearchCriteriaSettings = () => {
  const { user } = useAuth();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedCPV, setSelectedCPV] = useState<CPVCode[]>([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState<ContractType[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 20000000]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [hasCriteria, setHasCriteria] = useState(false);
  
  // Language state
  const [useSpanish, setUseSpanish] = useState(false);
  
  // CPV search state
  const [cpvInputValue, setCpvInputValue] = useState('');
  const [cpvSearchResults, setCpvSearchResults] = useState<CPVCodeResponse[]>([]);
  const [isSearchingCpv, setIsSearchingCpv] = useState(false);
  const [showCpvSuggestions, setShowCpvSuggestions] = useState(false);
  const cpvInputRef = useRef<HTMLInputElement>(null);
  const cpvSuggestionsRef = useRef<HTMLDivElement>(null);

  // Load user's search criteria when component mounts
  useEffect(() => {
    const loadUserCriteria = async () => {
      if (!user || !user.id) {
        setIsLoading(false);
        setLoadError(useSpanish 
          ? 'No se pudo determinar la identidad del usuario. Por favor, inicie sesión de nuevo.' 
          : 'Could not determine user identity. Please log in again.');
        return;
      }
      
      setIsLoading(true);
      setLoadError(null);
      
      try {
        const response = await apiClient.get<UserCriteriaResponse>(`/auth/users/${user.id}/criteria`);
        const criteria = response.data;
      
        setHasCriteria(true);
        
        // Set budget range if values exist
        if (criteria.min_budget !== null && criteria.max_budget !== null) {
          setBudgetRange([criteria.min_budget, criteria.max_budget]);
        }
        
        // Set keywords - check all possible property names
        if (criteria.keywords && criteria.keywords.length > 0) {
          // First determine which property contains the keyword string
          const firstKeyword = criteria.keywords[0];
          let keywordProp = 'keyword';
          
          if (firstKeyword.hasOwnProperty('keyword')) {
            keywordProp = 'keyword';
          } else if (firstKeyword.hasOwnProperty('word')) {
            keywordProp = 'word';
          } else {
            // Find first string property that's not id
            const stringProps = Object.keys(firstKeyword).filter(k => 
              typeof firstKeyword[k] === 'string' && k !== 'id'
            );
            if (stringProps.length > 0) {
              keywordProp = stringProps[0];
            }
          }
          
          setSelectedKeywords(criteria.keywords.map(k => k[keywordProp]));
        }
        
        // Set CPV codes
        if (criteria.cpv_codes && criteria.cpv_codes.length > 0) {
          setSelectedCPV(criteria.cpv_codes.map(cpv => ({
            code: cpv.code,
            label: useSpanish ? cpv.es_description : cpv.description
          })));
        }
        
        // Set contract types if available
        if (criteria.contract_types && criteria.contract_types.length > 0) {
          // Sample the first contract type to determine property names
          const firstType = criteria.contract_types[0];
          
          const loadedContractTypes = criteria.contract_types.map(ct => {
            // Try to find matching predefined contract type by type_code or description
            const matchingType = contractTypes.find(predefined => 
              predefined.type_code === ct.type_code || 
              predefined.description === ct.description || 
              predefined.description === ct.type_en
            );
            
            // If we found a match in our predefined list, use that
            if (matchingType) {
              return matchingType;
            }
            
            // Otherwise create a new contract type with available data
            return {
              type_code: ct.type_code || ct.description?.toLowerCase().replace(/\s+/g, '_') || "unknown",
              description: ct.description || ct.type_en || ct.type_code || "",
              es_description: ct.es_description || ct.type_es || ct.type_code || ""
            };
          });
          
          setSelectedContractTypes(loadedContractTypes);
        }
        
      } catch (error: any) {
        if (error.response?.status === 404) {
          // 404 is expected for new users - no criteria yet
          setHasCriteria(false);
          setLoadError(null);
        } else {
          setLoadError(useSpanish 
            ? 'Error al cargar los criterios de búsqueda. Inténtelo de nuevo más tarde.' 
            : 'Error loading search criteria. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserCriteria();
  }, [user, useSpanish]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cpvInputRef.current && !cpvInputRef.current.contains(event.target as Node) &&
          cpvSuggestionsRef.current && !cpvSuggestionsRef.current.contains(event.target as Node)) {
        setShowCpvSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced CPV search
  useEffect(() => {
    if (!cpvInputValue.trim() || cpvInputValue.length < 2) {
      setCpvSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchCpvCodes(cpvInputValue);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [cpvInputValue, useSpanish]);

  // Function to search CPV codes via API
  const searchCpvCodes = async (query: string) => {
    if (query.trim().length < 2) return;
    
    setIsSearchingCpv(true);
    try {
      const params: Record<string, string | number> = {
        limit: 10,
        lang: useSpanish ? 'es' : 'en'
      };
      
      // Determine if the query looks like a code or description
      if (/^\d+$/.test(query)) {
        // If query contains only numbers, search by code
        params.code = query;
      } else {
        // Otherwise search by description
        params.description = query;
      }
      
      const response = await apiClient.get<PaginatedCPVResponse>('/auth/cpv-codes', { params });
      setCpvSearchResults(response.data.items);
      setShowCpvSuggestions(true);
    } catch (error) {
      setCpvSearchResults([]);
    } finally {
      setIsSearchingCpv(false);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSelectedKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handleRemoveCPV = (cpvToRemove: CPVCode) => {
    setSelectedCPV(prev => prev.filter(cpv => cpv.code !== cpvToRemove.code));
  };

  const handleCpvInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpvInputValue(e.target.value);
    if (e.target.value.trim().length > 1) {
      setIsSearchingCpv(true);
    }
  };

  const handleCpvSelect = (cpv: CPVCodeResponse) => {
    if (!selectedCPV.some(item => item.code === cpv.code)) {
      // Use the description in the selected language
      const label = useSpanish ? cpv.es_description : cpv.description;
      setSelectedCPV(prev => [...prev, { code: cpv.code, label }]);
    }
    setCpvInputValue('');
    setShowCpvSuggestions(false);
  };

  const handleRemoveContractType = (contractType: ContractType) => {
    setSelectedContractTypes(prev => 
      // Compare by type_code which is unique and language-independent
      prev.filter(ct => ct.type_code !== contractType.type_code)
    );
  };

  const handleAddContractType = (value: string) => {
    const contractType = contractTypes.find(ct => 
      (useSpanish ? ct.es_description : ct.description) === value
    );
    
    if (contractType && !selectedContractTypes.some(ct => ct.type_code === contractType.type_code)) {
      setSelectedContractTypes(prev => [...prev, contractType]);
    }
  };

  const formatBudgetValue = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  // Enforce minimum distance between min and max budget values
  const handleBudgetChange = (value: [number, number]) => {
    const minDistance = 1000000; // Minimum €1M difference between thumbs
    
    if (value[1] - value[0] < minDistance) {
      // If dragging the lower thumb
      if (value[0] !== budgetRange[0]) {
        const newMax = Math.min(value[0] + minDistance, 20000000);
        setBudgetRange([value[0], newMax]);
      } 
      // If dragging the upper thumb
      else if (value[1] !== budgetRange[1]) {
        const newMin = Math.max(value[1] - minDistance, 0);
        setBudgetRange([newMin, value[1]]);
      }
    } else {
      // Normal case: thumbs are far enough apart
      setBudgetRange(value);
    }
  };

  // Function to save the search criteria
  const handleSaveCriteria = async () => {
    if (!user || !user.id) {
      toast({
        title: useSpanish ? "Error" : "Error",
        description: useSpanish 
          ? "No se pudo determinar la identidad del usuario. Por favor, inicie sesión de nuevo." 
          : "Could not determine user identity. Please log in again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {

      const payload: UserCriteriaCreate = {
        min_budget: budgetRange[0],
        max_budget: budgetRange[1],
        cpv_codes: selectedCPV.map(cpv => cpv.code),
        keywords: selectedKeywords,
        contract_types: selectedContractTypes.map(ct => ct.type_code)
      };
      
      // Always use PUT endpoint which handles both create and update
      await apiClient.put(`/auth/users/${user.id}/criteria`, payload);
      setHasCriteria(true);
      
      toast({
        title: useSpanish ? "Criterios guardados" : "Criteria saved",
        description: useSpanish 
          ? "Sus criterios de búsqueda han sido guardados correctamente." 
          : "Your search criteria have been saved successfully.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error saving criteria:', error);
      const errorMessage = error.response?.data?.detail || (useSpanish 
        ? "Error al guardar los criterios. Inténtelo de nuevo más tarde." 
        : "Error saving criteria. Please try again later.");
      
      toast({
        title: useSpanish ? "Error" : "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">Search Criteria</h2>

      {/* Language toggle for entire form */}
      <div className="flex justify-end items-center space-x-2 mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {useSpanish ? 'Español' : 'English'}
        </span>
        <Switch 
          checked={useSpanish}
          onCheckedChange={setUseSpanish}
          aria-label="Toggle language"
        />
      </div>

      {loadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gober-primary-500" />
          <span className="ml-2 text-lg text-gober-primary-700 dark:text-gober-primary-300">
            {useSpanish ? 'Cargando criterios...' : 'Loading criteria...'}
          </span>
        </div>
      ) : (
      <div className="space-y-5">
        <div className="space-y-3">
            <Label htmlFor="cpv-input">{useSpanish ? 'Códigos CPV' : 'CPV Codes'}</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCPV.map((cpv) => (
              <Badge 
                  key={cpv.code} 
                variant="secondary"
                className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
              >
                  {cpv.code} - {cpv.label}
                <X 
                  className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
                  onClick={() => handleRemoveCPV(cpv)}
                />
              </Badge>
            ))}
          </div>
            
            {/* CPV autocomplete with API integration */}
            <div className="relative">
          <Input 
            id="cpv-input"
                ref={cpvInputRef}
                placeholder={useSpanish 
                  ? `Buscar por código o descripción CPV...` 
                  : `Search for CPV code or description...`
                }
                value={cpvInputValue}
                onChange={handleCpvInputChange}
                onFocus={() => cpvInputValue.length >= 2 && setShowCpvSuggestions(true)}
              />
              
              {/* Suggestions dropdown */}
              {showCpvSuggestions && (isSearchingCpv || cpvSearchResults.length > 0) && (
                <div 
                  ref={cpvSuggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-white dark:bg-gober-primary-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {isSearchingCpv ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-gober-accent-500 mr-2" />
                      <span>{useSpanish ? 'Buscando...' : 'Searching...'}</span>
                    </div>
                  ) : cpvSearchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      {useSpanish 
                        ? 'No se encontraron códigos CPV. Intente con otro término de búsqueda.' 
                        : 'No CPV codes found. Try a different search term.'
                      }
                    </div>
                  ) : (
                    cpvSearchResults.map(cpv => (
                      <div
                        key={cpv.code}
                        className="px-4 py-2 cursor-pointer hover:bg-gober-accent-500/10 dark:hover:bg-gober-primary-700"
                        onClick={() => handleCpvSelect(cpv)}
                      >
                        <div className="font-medium">{cpv.code}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {useSpanish ? cpv.es_description : cpv.description}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
        </div>
        
        <div className="space-y-3">
            <Label htmlFor="keyword-input">{useSpanish ? 'Palabras Clave' : 'Keywords'}</Label>
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
              placeholder={useSpanish 
                ? "Escriba una palabra clave y presione Enter..." 
                : "Type a keyword and press Enter..."
              } 
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
        
          {/* Contract Types (Bilingual) */}
        <div className="space-y-3">
            <Label>{useSpanish ? 'Tipos de Contrato' : 'Contract Types'}</Label>
          <div className="flex flex-wrap gap-2 mb-2">
              {selectedContractTypes.map((contractType) => (
              <Badge 
                  key={`${contractType.description}-${useSpanish ? 'es' : 'en'}`}
                variant="secondary"
                className="flex items-center gap-1 py-1.5 px-3 bg-gober-bg-200 dark:bg-gober-primary-700 text-gober-primary-800 dark:text-gray-300"
              >
                  {useSpanish ? contractType.es_description : contractType.description}
                <X 
                  className="h-3 w-3 cursor-pointer ml-1 text-gober-primary-600" 
                    onClick={() => handleRemoveContractType(contractType)}
                />
              </Badge>
            ))}
          </div>
            <Select onValueChange={handleAddContractType}>
            <SelectTrigger>
                <SelectValue placeholder={useSpanish ? "Seleccionar tipo de contrato" : "Select contract type"} />
            </SelectTrigger>
            <SelectContent>
                {contractTypes.map(contractType => (
                  <SelectItem key={contractType.description} value={useSpanish ? contractType.es_description : contractType.description}>
                    {useSpanish ? contractType.es_description : contractType.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4 bg-gober-bg-100 dark:bg-gober-primary-700/30 p-4 rounded-lg">
          <div className="flex justify-between items-center">
              <Label className="text-base">{useSpanish ? 'Rango de Presupuesto' : 'Budget Range'}</Label>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-gober-bg-200 dark:bg-gober-primary-700">
              {formatBudgetValue(budgetRange[0])} - {formatBudgetValue(budgetRange[1])}
            </span>
          </div>
          <div className="pt-2 px-1">
            <Slider 
              value={[budgetRange[0], budgetRange[1]]} 
                max={20000000} 
                step={100000}
                onValueChange={handleBudgetChange}
              className="my-6"
            />
            <div className="flex justify-between mt-2 text-sm text-gober-primary-600 dark:text-gray-400">
                <span>€0</span>
                <span>€20,000,000</span>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full mt-6"
            onClick={handleSaveCriteria}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {useSpanish ? 'Guardando...' : 'Saving...'}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {useSpanish ? 'Guardar Criterios de Búsqueda' : 'Save Search Criteria'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchCriteriaSettings;
