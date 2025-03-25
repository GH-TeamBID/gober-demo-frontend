import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TenderPreview, 
  fetchSavedTenders, 
  saveTender, 
  unsaveTender,
  fetchTenderPreviewById,
  UserTender 
} from '../services/tenderService';
import { useToast } from '../components/ui/use-toast';

/**
 * Custom hook for managing saved tenders with server-side persistence
 */
export function useSavedTenders(loadedTenders: TenderPreview[] = []) {
  // State for saved tender URIs (Set for O(1) lookups)
  const [savedTenderIds, setSavedTenderIds] = useState<Set<string>>(new Set());
  
  // Map to store tender details by URI
  const [tenderDetailsMap, setTenderDetailsMap] = useState<Map<string, TenderPreview>>(new Map());
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTenderIds, setLoadingTenderIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Initialize with loaded tenders
  useEffect(() => {
    // Create a map of loaded tenders for efficient lookups
    const newTenderMap = new Map<string, TenderPreview>();
    
    loadedTenders.forEach(tender => {
      if (tender.tender_hash) {
        newTenderMap.set(tender.tender_hash, tender);
      }
    });
    
    setTenderDetailsMap(newTenderMap);
  }, [loadedTenders]);

  // Fetch saved tender URIs from API on mount
  useEffect(() => {
    const fetchUserSavedTenderIds = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all saved tenders (backend returns UserTender[] with tender_uri)
        const userTenders: UserTender[] = await fetchSavedTenders();
        
        // Extract tender_uri values to a Set for O(1) lookups
        const savedIds = new Set(
          userTenders
            .map(ut => ut.tender_uri)
            .filter(uri => !!uri)
        );
        
        setSavedTenderIds(savedIds);
        console.log(`Loaded ${savedIds.size} saved tender URIs from API`);
        
      } catch (err) {
        console.error('Failed to fetch saved tenders:', err);
        setError('Failed to load your saved tenders');
        // Initialize with empty set on error
        setSavedTenderIds(new Set());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserSavedTenderIds();
  }, []);

  // Function to fetch preview data for saved tenders
  const fetchSavedTendersWithDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the list of all saved tender relationships (containing URIs)
      const userTenders: UserTender[] = await fetchSavedTenders();
      
      // Extract tender URIs
      const savedIds = userTenders
        .map(ut => ut.tender_uri)
        .filter(uri => !!uri);
      
      // Update the saved IDs set
      setSavedTenderIds(new Set(savedIds));
      
      // Create a new map for tender details
      const newTenderMap = new Map(tenderDetailsMap);
      
      // Set loading state for tenders we need to fetch
      const tendersToFetch = savedIds.filter(id => !tenderDetailsMap.has(id));
      setLoadingTenderIds(new Set(tendersToFetch));
      
      if (tendersToFetch.length > 0) {
        console.log(`Fetching preview data for ${tendersToFetch.length} tenders`);
        
        // Create fetch promises for each tender preview
        const fetchPromises = tendersToFetch.map(async (uri) => {
          try {
            // Use the preview endpoint to get just the needed data
            const tenderPreview = await fetchTenderPreviewById(uri);
            
            return { id: uri, details: tenderPreview, success: true };
          } catch (err) {
            console.error(`Failed to fetch preview for tender ${uri}:`, err);
            return { id: uri, details: null, success: false };
          }
        });
        
        // Wait for all fetch operations to complete
        const results = await Promise.all(fetchPromises);
        
        // Update our tender details map with the new data
        results.forEach(({ id, details, success }) => {
          if (success && details) {
            newTenderMap.set(id, details);
          }
        });
      }
      
      setTenderDetailsMap(newTenderMap);
      setLoadingTenderIds(new Set());
      
    } catch (err) {
      console.error('Error fetching saved tenders with details:', err);
      setError('Failed to load your saved tenders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [tenderDetailsMap]);

  // Check if a tender is saved
  const isTenderSaved = useCallback(
    (id: string) => savedTenderIds.has(id),
    [savedTenderIds]
  );

  // Toggle saved state of a tender with API call
  const toggleSaveTender = useCallback(
    async (id: string) => {
      console.log(`[${new Date().toISOString()}] useSavedTenders: toggleSaveTender called for`, id);
      
      // Optimistic update for immediate UI feedback
      const isSaved = savedTenderIds.has(id);
      const newSavedIds = new Set(savedTenderIds);
      
      if (isSaved) {
        newSavedIds.delete(id);
      } else {
        newSavedIds.add(id);
      }
      
      // Update state immediately for responsive UI
      setSavedTenderIds(newSavedIds);
      
      try {
        // Make API call based on the action
        console.log(`useSavedTenders: Making API call to ${isSaved ? 'unsave' : 'save'} tender ${id}`);
        const success = isSaved 
          ? await unsaveTender(id)
          : await saveTender(id);
        
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
        
      } catch (error) {
        console.error(`Error ${isSaved ? 'unsaving' : 'saving'} tender:`, error);
        
        // Revert the optimistic update on error
        setSavedTenderIds(isSaved ? new Set([...newSavedIds, id]) : new Set([...newSavedIds].filter(i => i !== id)));
        
        // Show error toast
        toast({
          variant: "destructive",
          title: "Action failed",
          description: `Failed to ${isSaved ? 'remove' : 'save'} tender. Please try again.`,
        });
      }
    },
    [savedTenderIds, toast]
  );

  // Get saved tenders from our data
  const savedTenders = useMemo(() => {
    const result: TenderPreview[] = [];
    
    // Use the tenderDetailsMap to get full details for each saved tender
    savedTenderIds.forEach(id => {
      const tender = tenderDetailsMap.get(id);
      if (tender) {
        result.push(tender);
      } else {
        // For IDs without full details yet, add a loading placeholder
        // This will be replaced when details are fetched
        result.push({
          tender_hash: id,
          tender_id: 'Loading...',
          title: 'Loading tender details...',
          isLoading: true,
          submission_date: new Date().toISOString(), // Add a date so sorting works
          n_lots: 0,
          pub_org_name: 'Loading...',
          cpv_categories: ['Loading...']
        });
      }
    });
    
    return result;
  }, [savedTenderIds, tenderDetailsMap]);

  // Is a specific tender currently loading?
  const isTenderLoading = useCallback(
    (id: string) => loadingTenderIds.has(id),
    [loadingTenderIds]
  );

  return {
    savedTenderIds: Array.from(savedTenderIds),
    savedTenders,
    toggleSaveTender,
    isTenderSaved,
    fetchSavedTendersWithDetails,
    isLoading,
    isTenderLoading,
    error
  };
} 