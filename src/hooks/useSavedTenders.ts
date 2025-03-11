
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tender } from '@/types/types';
import { useToast } from '@/components/ui/use-toast';

export const useSavedTenders = (tenders: Tender[]) => {
  const { toast } = useToast();
  
  // State for saved tenders (stored as IDs)
  const [savedTenderIds, setSavedTenderIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedTenders');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Persist saved tenders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedTenders', JSON.stringify(savedTenderIds));
  }, [savedTenderIds]);
  
  // Toggle save/unsave a tender
  const toggleSaveTender = useCallback((tenderId: string) => {
    setSavedTenderIds(prev => {
      const isSaved = prev.includes(tenderId);
      
      if (isSaved) {
        toast({
          title: "Tender removed",
          description: "The tender has been removed from your saved items.",
          duration: 3000,
        });
        return prev.filter(id => id !== tenderId);
      } else {
        toast({
          title: "Tender saved",
          description: "The tender has been added to your saved items.",
          duration: 3000,
        });
        return [...prev, tenderId];
      }
    });
  }, [toast]);
  
  // Check if a tender is saved
  const isTenderSaved = useCallback((tenderId: string) => {
    return savedTenderIds.includes(tenderId);
  }, [savedTenderIds]);
  
  // Get saved tenders
  const savedTenders = useMemo(() => {
    return tenders.filter(tender => savedTenderIds.includes(tender.id));
  }, [tenders, savedTenderIds]);
  
  return { 
    savedTenderIds, 
    savedTenders, 
    toggleSaveTender, 
    isTenderSaved 
  };
};
