
import { useState, useCallback } from 'react';
import { Tender } from '@/types/types';

export const useTenderSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate API search
  const searchTenders = useCallback(async (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsLoading(false);
  }, []);
  
  return {
    searchQuery,
    isLoading,
    setSearchQuery: searchTenders
  };
};
