import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  fetchTenders, 
  TenderPreview,
  TenderDetail,
  fetchTenderDetail,
  fetchSavedTenders,
  fetchTenderPreviewById,
  saveTender,
  unsaveTender,
  UserTender,
  TenderParams,
  PaginatedTenderResponse
} from '@/services/tenderService';
import { toast } from '@/components/ui/use-toast';
import { useTenderSort } from '@/hooks/useTenderSort';
import { SortState, SortField, SortDirection } from '@/types/types';

// Define the shape of our context
interface TendersContextType {
  // Data
  tenders: TenderPreview[];
  savedTenders: TenderPreview[];
  totalTenders: number;
  currentOffset: number;
  limit: number;
  hasMore: boolean;
  sort: SortState;
  savedTenderIds: Set<string>;
  aiSummariesMap: Map<string, string | null>;
  
  // Tender Detail functionality
  currentTenderDetail: TenderDetail | null;
  loadingTenderDetail: boolean;
  tenderDetailError: string | null;
  fetchTenderDetail: (tenderId: string) => Promise<TenderDetail | null>;
  clearTenderDetail: () => void;
  isTenderSaved: (tenderId: string) => boolean;
  updateTenderAIDocument: (tenderId: string, documentContent: string) => Promise<boolean>;
  
  // Status
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTenders: (params: TenderParams, replace?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshTenders: () => Promise<void>;
  refreshSavedTenders: (fetchPreviews?: boolean) => Promise<void>;
  toggleSaveTender: (tenderId: string) => Promise<void>;
  setViewMode: (mode: 'all' | 'saved') => void;
  setSort: (sort: SortState) => void;
  updateAISummaryInCache: (tenderId: string, summary: string | null) => void;
  
  // Filters
  currentParams: TenderParams;
  updateParams: (newParams: Partial<TenderParams>) => void;
  resetParams: () => void;
}

// Define props for the Provider, including optional initial parameters
interface TendersProviderProps {
  children: ReactNode;
  initialParams?: Partial<TenderParams>;
}

// Create the context with undefined default value
const TendersContext = createContext<TendersContextType | undefined>(undefined);

const DEFAULT_LIMIT = 10;

// Provider component
export function TendersProvider({ children, initialParams }: TendersProviderProps) {
  // State for tender data
  const [tenders, setTenders] = useState<TenderPreview[]>([]);
  const [savedTenders, setSavedTenders] = useState<TenderPreview[]>([]);
  const [savedTenderIds, setSavedTenderIds] = useState<Set<string>>(new Set());
  const [tenderDetailsMap, setTenderDetailsMap] = useState<Map<string, TenderPreview>>(new Map());
  const [aiSummariesMap, setAiSummariesMap] = useState<Map<string, string | null>>(new Map());
  const [totalTenders, setTotalTenders] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  
  // Tender Detail state
  const [currentTenderDetail, setCurrentTenderDetail] = useState<TenderDetail | null>(null);
  const [loadingTenderDetail, setLoadingTenderDetail] = useState(false);
  const [tenderDetailError, setTenderDetailError] = useState<string | null>(null);
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Query parameters - Initialize with defaults, merge with initialParams
  const [currentParams, setCurrentParams] = useState<TenderParams>(() => {
    const defaults: TenderParams = {
      offset: 0,
      limit: DEFAULT_LIMIT,
      is_saved: false,
      sort_field: 'submission_date' as SortField,
      sort_direction: 'desc' as SortDirection
    };
    // Merge defaults with any provided initialParams
    return { ...defaults, ...initialParams }; 
  });
  
  // Function to update the summary cache
  const updateAISummaryInCache = useCallback((tenderId: string, summary: string | null) => {
    setAiSummariesMap(prevMap => {
      const newMap = new Map(prevMap);
      console.log(`[CONTEXT_CACHE] Updating summary cache for ${tenderId}:`, summary);
      newMap.set(tenderId, summary);
      return newMap;
    });
  }, []);
  
  // Function to load tenders based on params
  const loadTenders = useCallback(async (params: TenderParams, replace: boolean = false) => {
    // Ensure limit and sort are always included from state/params
    const queryParams: TenderParams = {
      limit: limit,
      sort_field: currentParams.sort_field,
      sort_direction: currentParams.sort_direction,
      ...params // params passed in take precedence
    };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchTenders(queryParams);
      
      // Replace or append based on 'replace' flag or if offset is 0
      if (replace || queryParams.offset === 0) {
        setTenders(response.items);
      } else {
        // Prevent duplicates when appending (though ideally API wouldn't send duplicates)
        setTenders(prev => {
          const existingIds = new Set(prev.map(t => t.tender_hash));
          const newItems = response.items.filter(t => !existingIds.has(t.tender_hash));
          return [...prev, ...newItems];
        });
      }
      
      // Update state based on response
      setTotalTenders(response.total);
      setCurrentOffset(response.offset + response.items.length); // Next offset is current + items received
      setLimit(response.limit); // Update limit based on response (in case API overrides)
      setHasMore(response.has_next); // Directly use API flag
      
      // Update currentParams state to reflect the actual params used and response state
      setCurrentParams(prev => ({
        ...prev, // Keep existing filters/sort/match
        ...queryParams, // Apply potentially updated params (like offset, limit, sort)
        offset: response.offset, // Reflect the actual offset returned by API
        limit: response.limit // Reflect the actual limit returned by API
      }));
      
      
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load tenders';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [limit, currentParams.sort_field, currentParams.sort_direction]);
  
  // Function to load more tenders
  const loadMore = useCallback(async () => {
    console.log(`🚀 CONTEXT: loadMore called. HasMore: ${hasMore}, IsLoading: ${isLoading}`);
    
    if (!hasMore || isLoading) {
      console.log('🚀 CONTEXT: Cannot load more, returning early.');
      return;
    }
    
    const nextOffset = currentOffset; // Calculate next offset based on current state
    console.log(`🚀 CONTEXT: Requesting next batch starting from offset: ${nextOffset}`);
    
    // Call loadTenders with the next offset, keeping other params (including sort)
    await loadTenders({ ...currentParams, offset: nextOffset }, false);
    
  }, [isLoading, hasMore, currentParams, currentOffset, loadTenders]);
  
  // Function to refresh the current view (resets offset)
  const refreshTenders = useCallback(async () => {
    console.log('🔄 CONTEXT: Refreshing tenders list (offset=0)');
    setCurrentOffset(0); // Reset offset state locally first
    // Call loadTenders with current filters/sort but offset 0, replace=true
    await loadTenders({ ...currentParams, offset: 0 }, true);
  }, [currentParams, loadTenders]);
  
  // Function to update filter/search parameters
  const updateParams = useCallback((newParams: Partial<TenderParams>) => {
    console.log(`📊 FILTERS: updateParams called with: ${JSON.stringify(newParams)}`);
    
    const { sort_field, sort_direction, ...otherNewParams } = newParams;
    
    const updatedParams = {
      ...currentParams,
      ...otherNewParams,
      offset: 0
    };
    
    console.log(`📊 FILTERS: Applying new params: ${JSON.stringify(updatedParams)}`);
    setCurrentParams(updatedParams);
    setCurrentOffset(0);
    
    loadTenders(updatedParams, true);
  }, [currentParams, loadTenders]);
  
  // Initialize sort state AFTER updateParams
  const [sort, setSortState] = useState<SortState>({
    field: currentParams.sort_field as SortField,
    direction: currentParams.sort_direction as SortDirection
  });
  
  // Function to handle sort changes AFTER sort state and updateParams
  const setSort = useCallback((newSort: SortState) => {
    console.log(`🔄 SORT: Updating sort state to: ${newSort.field} ${newSort.direction}`);
    setSortState(newSort);
    updateParams({ 
      sort_field: newSort.field, 
      sort_direction: newSort.direction 
    });
  }, [updateParams]);
  
  // Function to reset all parameters to default (all tenders)
  const resetParams = useCallback(() => {
    const defaultSort: SortState = { field: 'submission_date', direction: 'desc' };
    const defaultParams: TenderParams = {
      offset: 0,
      limit: DEFAULT_LIMIT,
      is_saved: false, // Reset to showing all tenders
      sort_field: defaultSort.field,
      sort_direction: defaultSort.direction
    };
    console.log('🔄 CONTEXT: Resetting all parameters to default');
    setSortState(defaultSort); // Reset sort state locally
    setCurrentParams(defaultParams); // Reset params including sort
    setCurrentOffset(0);
    loadTenders(defaultParams, true); // Load with defaults
  }, [loadTenders]);
  
  // Function to set the view mode (all vs saved)
  const setViewMode = useCallback((mode: 'all' | 'saved') => {
    const isSavedView = mode === 'saved';
    // Update params triggers a refresh with offset 0 and the new is_saved value
    updateParams({ is_saved: isSavedView });
  }, [updateParams]);
  
  // Function to refresh saved tenders
  const refreshSavedTenders = useCallback(async (fetchPreviews: boolean = true) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all saved tenders (backend returns UserTender[] with tender_uri)
      const userTenders: UserTender[] = await fetchSavedTenders();
      
      // Extract tender_uri values to a Set for O(1) lookups
      const savedUris = userTenders
        .map(ut => ut.tender_uri) // Changed from id (hash) to tender_uri
        .filter((uri): uri is string => typeof uri === 'string');
      
      // Update saved URIs set
      setSavedTenderIds(new Set(savedUris));
      
      // Get current details map
      const currentDetailsMap = new Map(tenderDetailsMap);
      
      // Find tenders we need to fetch details for
      const tendersToFetch = savedUris.filter(uri => !currentDetailsMap.has(uri));
      
      if (fetchPreviews && tendersToFetch.length > 0) {
        
        // Fetch details for each tender
        const fetchPromises = tendersToFetch.map(async (uri) => { // Changed from hash to uri
          try {
            const tenderPreview = await fetchTenderPreviewById(uri); // Changed from hash to uri
            return { id: uri, details: tenderPreview, success: true }; // Changed from hash to uri
          } catch (err) {
            return { id: uri, details: null, success: false }; // Changed from hash to uri
          }
        });
        
        // Wait for all fetch operations to complete
        const results = await Promise.all(fetchPromises);
        
        // Update our tender details map with new data
        results.forEach(({ id, details, success }) => {
          if (success && details) {
            currentDetailsMap.set(id, details);
          }
        });
        
        // Update the details map
        setTenderDetailsMap(currentDetailsMap);
      }
      
      // Create array of saved tenders from the map (only if previews were fetched or already existed)
      const updatedSavedTenders = savedUris.map(uri => {
        const tender = currentDetailsMap.get(uri);
        if (tender) {
          return tender;
        } else {
          // For IDs without details yet, add a loading placeholder
          return {
            tender_hash: 'Loading...', // Use URI as hash for key prop if needed
            tender_id: uri,
            title: 'Loading tender details...',
            isLoading: true,
            submission_date: new Date().toISOString(), // Placeholder date
            n_lots: 0,
            pub_org_name: 'Loading...',
            cpv_categories: ['Loading...']
          };
        }
      });
      
      // Update saved tenders state
      setSavedTenders(updatedSavedTenders);
      
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load saved tenders';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [tenderDetailsMap]);
  
  // Function to toggle saved state of a tender
  const toggleSaveTender = useCallback(async (tenderId: string) => {

    try {
      const isSaved = savedTenderIds.has(tenderId);     
      // Optimistic update
      const newSavedIds = new Set(savedTenderIds);
      if (isSaved) {
        newSavedIds.delete(tenderId);
      } else {
        newSavedIds.add(tenderId);
      }
      setSavedTenderIds(newSavedIds);
      
      // Update saved tenders array optimistically
      if (isSaved) {
        setSavedTenders(prev => prev.filter(t => t.tender_hash !== tenderId));
      } else {
        // Try to add the tender if we have its details in the main list or map
        const tenderDetails = tenders.find(t => t.tender_hash === tenderId) || tenderDetailsMap.get(tenderId);
        if (tenderDetails) {
          setSavedTenders(prev => [...prev, tenderDetails]);
        } else {
            // Consider fetching details here if needed immediately
        }
      }
      
      // Call API
      const success = isSaved
        ? await unsaveTender(tenderId)
        : await saveTender(tenderId);
      

      if (!success) {
        // API call failed
        throw new Error('Failed to update saved status via API');
      }
      
      // Success
      toast({
        description: isSaved
          ? "Tender removed from favorites"
          : "Tender saved to your favorites",
        duration: 2000,
      });
      
    } catch (error: any) {
      
      // Revert the optimistic update by refreshing
      // This is crucial to ensure UI consistency
      toast({
        variant: "destructive",
        title: "Action failed",
        description: `Failed to update saved status: ${error.message || 'Unknown error'}. Reverting changes.`, 
      });
      await refreshSavedTenders();
    }
  }, [savedTenderIds, tenderDetailsMap, refreshSavedTenders, tenders]);
  
  // Function to fetch a detailed tender by ID
  const fetchTenderDetailById = useCallback(async (tenderId: string): Promise<TenderDetail | null> => {
    setLoadingTenderDetail(true);
    setTenderDetailError(null);
    
    try {
      // Fetch the detailed tender information
      const tenderDetail = await fetchTenderDetail(tenderId);
      
      // Store the result in state
      setCurrentTenderDetail(tenderDetail);
      
      // Log available AI content with more specific information
      if (tenderDetail.aiSummary) {
        console.log(`AI summary available for tender ${tenderId} (${tenderDetail.aiSummary.length} chars)`);
      } else {
        console.log(`No AI summary available for tender ${tenderId}`);
      }
      
      if (tenderDetail.aiDocument) {
        if (typeof tenderDetail.aiDocument === 'string' && 
            (tenderDetail.aiDocument.startsWith('http') || tenderDetail.aiDocument.includes('/'))) {
          console.log(`AI document URL available: ${tenderDetail.aiDocument}`);
        } else {
          console.log(`AI document content available (${tenderDetail.aiDocument.length} chars)`);
        }
      } else {
        console.log(`No AI document available for tender ${tenderId}`);
      }
      
      return tenderDetail;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load tender details';
      setTenderDetailError(errorMsg);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoadingTenderDetail(false);
    }
  }, []);
  
  // Function to clear the current tender detail
  const clearTenderDetail = useCallback(() => {
    setCurrentTenderDetail(null);
    setTenderDetailError(null);
  }, []);
  
  // Function to check if a tender is saved
  const isTenderSaved = useCallback((tenderId: string) => {
    return savedTenderIds.has(tenderId);
  }, [savedTenderIds]);
  
  // Function to update AI document content for a tender
  const updateTenderAIDocument = useCallback(async (tenderId: string, documentContent: string): Promise<boolean> => {
    try {
      // In a real implementation, you would call an API to save the document
      console.log(`Updating AI document for tender ${tenderId}`);
      
      // If the current tender detail is for this tender, update it locally
      if (currentTenderDetail && currentTenderDetail.id === tenderId) {
        const updatedTenderDetail = {
          ...currentTenderDetail,
          aiDocument: documentContent
        };
        
        // Update the current tender detail in state
        setCurrentTenderDetail(updatedTenderDetail);
        
        // Show success toast 
        toast({
          description: "AI document has been updated successfully",
          duration: 3000,
        });
        
        return true;
      }
      
      // If not the current tender, just log (in real app, would still send to API)
      console.warn('Cannot update AI document - current tender is different or not loaded');
      return false;
    } catch (error: any) {
      console.error('Error updating AI document:', error);
      
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || 'Failed to update AI document',
      });
      
      return false;
    }
  }, [currentTenderDetail]);
  
  // Load initial tenders (all) on mount
  useEffect(() => {
    console.log("CONTEXT INIT: Performing initial load (offset=0)");
    // Load with default params (offset 0, is_saved false)
    loadTenders(currentParams, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
  
  // Load initial saved tenders on mount
  useEffect(() => {
    console.log("CONTEXT INIT: Performing initial saved tenders load (IDs only)");
    refreshSavedTenders(false); // Pass false to skip preview fetching initially
  }, [refreshSavedTenders]);
  
  // Context value
  const value: TendersContextType = {
    // Data
    tenders,
    savedTenders,
    totalTenders,
    currentOffset,
    limit,
    hasMore,
    sort,
    savedTenderIds,
    aiSummariesMap,
    
    // Tender Detail
    currentTenderDetail,
    loadingTenderDetail,
    tenderDetailError,
    fetchTenderDetail: fetchTenderDetailById,
    clearTenderDetail,
    isTenderSaved,
    updateTenderAIDocument,
    
    // Status
    isLoading,
    error,
    
    // Actions
    loadTenders,
    loadMore,
    refreshTenders,
    refreshSavedTenders,
    toggleSaveTender,
    setViewMode,
    setSort,
    updateAISummaryInCache,
    
    // Filters
    currentParams,
    updateParams,
    resetParams
  };
  
  return (
    <TendersContext.Provider value={value}>
      {children}
    </TendersContext.Provider>
  );
}

// Custom hook for using the context
export function useTenders() {
  const context = useContext(TendersContext);
  
  if (context === undefined) {
    throw new Error('useTenders must be used within a TendersProvider');
  }
  
  return context;
} 