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
  TenderParams
} from '@/services/tenderService';
import { toast } from '@/components/ui/use-toast';

// Define the shape of our context
interface TendersContextType {
  // Data
  tenders: TenderPreview[];
  savedTenders: TenderPreview[];
  totalTenders: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  
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
  loadTenders: (params?: TenderParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshTenders: () => Promise<void>;
  refreshSavedTenders: () => Promise<void>;
  toggleSaveTender: (tenderId: string) => Promise<void>;
  
  // Filters
  currentParams: TenderParams;
  updateParams: (newParams: Partial<TenderParams>) => void;
  resetParams: () => void;
}

// Create the context with undefined default value
const TendersContext = createContext<TendersContextType | undefined>(undefined);

// Provider component
export function TendersProvider({ children }: { children: ReactNode }) {
  // State for tender data
  const [tenders, setTenders] = useState<TenderPreview[]>([]);
  const [savedTenders, setSavedTenders] = useState<TenderPreview[]>([]);
  const [savedTenderIds, setSavedTenderIds] = useState<Set<string>>(new Set());
  const [tenderDetailsMap, setTenderDetailsMap] = useState<Map<string, TenderPreview>>(new Map());
  const [totalTenders, setTotalTenders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasMore, setHasMore] = useState(false);
  
  // Tender Detail state
  const [currentTenderDetail, setCurrentTenderDetail] = useState<TenderDetail | null>(null);
  const [loadingTenderDetail, setLoadingTenderDetail] = useState(false);
  const [tenderDetailError, setTenderDetailError] = useState<string | null>(null);
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Query parameters
  const [currentParams, setCurrentParams] = useState<TenderParams>({
    page: 1,
    size: 10
  });
  
  // Function to load tenders based on params
  const loadTenders = async (params?: TenderParams) => {
    // Use provided params or current params
    const queryParams = params || currentParams;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Initial fetch with params:', queryParams);
      const response = await fetchTenders(queryParams);
      console.log('API response:', {
        items: response.items.length,
        total: response.total,
        page: response.page,
        size: response.size,
        has_next: response.has_next
      });
      
      // No processing needed - use data directly
      if (params?.page === 1 || queryParams.page === 1) {
        setTenders(response.items);
      } else {
        setTenders(prev => [...prev, ...response.items]);
      }
      
      setTotalTenders(response.total);
      setCurrentPage(response.page);
      setPageSize(response.size);
      
      // Determine if there are more items to load
      // Set hasMore based on the API's response, but also check if total > currently loaded
      const hasMoreItems = response.has_next || (response.total > (response.page * response.size));
      console.log(`Setting hasMore=${hasMoreItems} based on response.has_next=${response.has_next} and total check=${response.total > (response.page * response.size)}`);
      setHasMore(hasMoreItems);
      
      // Update current params
      setCurrentParams({
        ...queryParams,
        page: response.page,
        size: response.size
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to load tenders');
      toast({
        title: "Error",
        description: err.message || 'Failed to load tenders',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to load more tenders (append next page)
  const loadMore = async () => {
    console.log('🚀 CONTEXT: loadMore called with hasMore:', hasMore, 'isLoading:', isLoading);
    
    // Always check if total items is greater than currently loaded items
    const currentlyLoadedItems = tenders.length;
    const totalAvailableItems = totalTenders;
    const hasMoreBasedOnTotal = totalAvailableItems > currentlyLoadedItems;
    
    console.log(`🚀 CONTEXT: Currently loaded: ${currentlyLoadedItems}, Total available: ${totalAvailableItems}`);
    console.log(`🚀 CONTEXT: hasMore from state: ${hasMore}, hasMore based on counts: ${hasMoreBasedOnTotal}`);
    
    if (!hasMore && !hasMoreBasedOnTotal) {
      console.log('🚀 CONTEXT: No more tenders to load, returning early');
      return;
    }
    
    if (isLoading) {
      console.log('🚀 CONTEXT: Already loading tenders, returning early');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const nextPage = currentPage + 1;
      console.log('🚀 CONTEXT: Loading more tenders for page:', nextPage);
      
      // Explicitly create the params for the next page request
      const nextPageParams = {
        ...currentParams,
        page: nextPage
      };
      
      console.log('🚀 CONTEXT: Fetching next page with params:', nextPageParams);
      
      const response = await fetchTenders(nextPageParams);
      
      console.log('🚀 CONTEXT: Received response for page', nextPage, 'with', response.items.length, 'items');
      console.log('🚀 CONTEXT: API response details:', {
        items: response.items.length,
        total: response.total,
        page: response.page,
        size: response.size,
        has_next: response.has_next
      });
      
      if (response.items.length === 0) {
        console.log('🚀 CONTEXT: Received empty page, no more results available');
        setHasMore(false);
        toast({
          title: "End of results",
          description: "No more tenders to load.",
          duration: 3000,
        });
        setIsLoading(false);
        return;
      }
      
      // Append new items to existing tenders
      const currentTenders = [...tenders]; // Create a copy of current tenders
      const combinedTenders = [...currentTenders, ...response.items];
      setTenders(combinedTenders);
      
      setTotalTenders(response.total);
      setCurrentPage(response.page);
      setPageSize(response.size);
      
      // FIXED: Calculate using our local copy rather than the state which hasn't updated yet
      const updatedTotal = response.total;
      const updatedLoaded = combinedTenders.length; // Use the combined array length instead of tenders.length + response.items.length
      const updatedHasMore = response.has_next || (updatedTotal > updatedLoaded);
      
      console.log(`🚀 CONTEXT: After load more: Loaded ${updatedLoaded} of ${updatedTotal} items`);
      console.log(`🚀 CONTEXT: Setting hasMore=${updatedHasMore} based on API has_next=${response.has_next} and count check=${updatedTotal > updatedLoaded}`);
      
      setHasMore(updatedHasMore);
      
      // Notify user if no more results
      if (!updatedHasMore) {
        toast({
          title: "End of results",
          description: "You've reached the end of the tender list.",
          duration: 3000,
        });
      }
      
      // Update current params
      setCurrentParams(prev => ({
        ...prev,
        page: nextPage
      }));
      
    } catch (err: any) {
      console.error('🚀 CONTEXT: Error loading more tenders:', err);
      setError(err.message || 'Failed to load more tenders');
      toast({
        title: "Error",
        description: err.message || 'Failed to load more tenders',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to refresh the current tenders
  const refreshTenders = async () => {
    // Reset to page 1 when refreshing
    const refreshParams = {
      ...currentParams,
      page: 1
    };
    
    setCurrentParams(refreshParams);
    await loadTenders(refreshParams);
  };
  
  // Function to update filter parameters
  const updateParams = (newParams: Partial<TenderParams>) => {
    // When changing filters, reset to page 1
    const updatedParams = {
      ...currentParams,
      ...newParams,
      page: 1 // Always reset to first page when filters change
    };
    
    setCurrentParams(updatedParams);
    
    // Log the updated parameters for debugging
    console.log('Updating API query parameters:', updatedParams);
    
    // Load tenders with new params - this will query the backend
    loadTenders(updatedParams);
  };
  
  // Function to reset all filters
  const resetParams = () => {
    const defaultParams = {
      page: 1,
      size: 10
    };
    
    console.log('Resetting all filters to defaults');
    setCurrentParams(defaultParams);
    loadTenders(defaultParams);
  };
  
  // Function to refresh saved tenders
  const refreshSavedTenders = useCallback(async () => {
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
      
      if (tendersToFetch.length > 0) {
        console.log(`Fetching details for ${tendersToFetch.length} saved tenders`);
        
        // Fetch details for each tender
        const fetchPromises = tendersToFetch.map(async (uri) => { // Changed from hash to uri
          try {
            const tenderPreview = await fetchTenderPreviewById(uri); // Changed from hash to uri
            return { id: uri, details: tenderPreview, success: true }; // Changed from hash to uri
          } catch (err) {
            console.error(`Failed to fetch preview for tender ${uri}:`, err); // Changed from hash to uri
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
      
      // Create array of saved tenders from the map
      const updatedSavedTenders = savedUris.map(uri => {
        const tender = currentDetailsMap.get(uri);
        if (tender) {
          return tender;
        } else {
          // For IDs without details yet, add a loading placeholder
          return {
            tender_hash: 'Loading...',
            tender_id: uri,
            title: 'Loading tender details...',
            isLoading: true,
            submission_date: new Date().toISOString(),
            n_lots: 0,
            pub_org_name: 'Loading...',
            cpv_categories: ['Loading...']
          };
        }
      });
      
      // Update saved tenders state
      setSavedTenders(updatedSavedTenders);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load saved tenders');
      toast({
        title: "Error",
        description: err.message || 'Failed to load saved tenders',
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
      
      // Update saved tenders array
      if (isSaved) {
        setSavedTenders(prev => prev.filter(t => t.tender_hash !== tenderId));
      } else {
        // Add the tender if we have its details
        const tenderDetails = tenderDetailsMap.get(tenderId);
        if (tenderDetails) {
          setSavedTenders(prev => [...prev, tenderDetails]);
        }
      }
      
      // Call API
      const success = isSaved 
        ? await unsaveTender(tenderId)
        : await saveTender(tenderId);
      
      if (!success) {
        throw new Error('Failed to update saved status');
      }
      
      // Show success toast
      toast({
        description: isSaved 
          ? "Tender removed from favorites" 
          : "Tender saved to your favorites",
        duration: 2000,
      });
      
    } catch (error: any) {
      console.error(`Error toggling save for tender ${tenderId}:`, error);
      
      // Revert the optimistic update
      await refreshSavedTenders();
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Action failed",
        description: error.message || 'Failed to update saved status',
      });
    }
  }, [savedTenderIds, tenderDetailsMap, refreshSavedTenders]);
  
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
  }, [currentTenderDetail, toast]);
  
  // Load tenders on initial render
  useEffect(() => {
    loadTenders();
  }, []);

  // Load saved tenders on initial render
  useEffect(() => {
    refreshSavedTenders();
  }, [refreshSavedTenders]);
  
  // Context value
  const value: TendersContextType = {
    // Data
    tenders,
    savedTenders,
    totalTenders,
    currentPage,
    pageSize,
    hasMore,
    
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