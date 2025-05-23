
import { useState, useEffect } from 'react';

interface RepoCacheData {
  path: string;
  data: any;
  timestamp: number;
}

/**
 * Hook to manage repository cache data in localStorage
 */
export const useRepoCache = () => {
  const [cacheData, setCacheData] = useState<RepoCacheData | null>(null);
  
  // Load cache on first render
  useEffect(() => {
    const savedData = localStorage.getItem('commitMetrics_lastRepo');
    if (savedData) {
      setCacheData(JSON.parse(savedData));
    }
  }, []);
  
  // Save data to cache
  const saveToCache = (path: string, data: any) => {
    const cacheEntry: RepoCacheData = {
      path,
      data,
      timestamp: Date.now()
    };
    
    localStorage.setItem('commitMetrics_lastRepo', JSON.stringify(cacheEntry));
    setCacheData(cacheEntry);
  };
  
  // Clear cache
  const clearCache = () => {
    localStorage.removeItem('commitMetrics_lastRepo');
    setCacheData(null);
  };
  
  // Check if cache is valid (less than 1 hour old)
  const isCacheValid = () => {
    if (!cacheData) return false;
    const oneHour = 60 * 60 * 1000;
    return (Date.now() - cacheData.timestamp) < oneHour;
  };
  
  return {
    cacheData,
    saveToCache,
    clearCache,
    isCacheValid
  };
};
