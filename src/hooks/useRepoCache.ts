
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Load cache on first render
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('commitMetrics_lastRepo');
      if (savedData) {
        setCacheData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error loading from cache:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Save data to cache
  const saveToCache = (path: string, data: any) => {
    const cacheEntry: RepoCacheData = {
      path,
      data,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem('commitMetrics_lastRepo', JSON.stringify(cacheEntry));
      setCacheData(cacheEntry);
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };
  
  // Clear cache
  const clearCache = () => {
    try {
      localStorage.removeItem('commitMetrics_lastRepo');
      setCacheData(null);
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };
  
  // Check if cache is valid (less than 1 hour old)
  const isCacheValid = (maxAgeMinutes: number = 60) => {
    if (!cacheData) return false;
    const maxAge = maxAgeMinutes * 60 * 1000;
    return (Date.now() - cacheData.timestamp) < maxAge;
  };
  
  // Get cache for specific repo
  const getCacheForRepo = (path: string) => {
    if (!cacheData || cacheData.path !== path) return null;
    return cacheData;
  };
  
  return {
    cacheData,
    saveToCache,
    clearCache,
    isCacheValid,
    getCacheForRepo,
    isLoading
  };
};
