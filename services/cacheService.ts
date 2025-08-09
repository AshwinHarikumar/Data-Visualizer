import { HouseholdData } from '../types';

interface CacheEntry {
  data: HouseholdData[];
  timestamp: number;
  fileName: string;
  fileSize: number;
  dataLength: number; // Number of records in the cached data
  fileHash: string; // File content hash for exact matching
}

const CACHE_KEY_PREFIX = 'data_visualizer_cache_';
const CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours

// Generate a comprehensive hash from file content
const generateFileHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Use a more robust hashing approach
  let hash = 0;
  const prime = 31;
  
  // Sample more bytes for better uniqueness
  const sampleSize = Math.min(1024, uint8Array.length); // Sample up to 1KB
  const step = Math.max(1, Math.floor(uint8Array.length / sampleSize));
  
  for (let i = 0; i < uint8Array.length; i += step) {
    hash = (hash * prime + uint8Array[i]) & 0x7fffffff;
  }
  
  // Include file metadata in hash
  const metadataString = `${file.name}_${file.size}_${file.lastModified}`;
  for (let i = 0; i < metadataString.length; i++) {
    hash = (hash * prime + metadataString.charCodeAt(i)) & 0x7fffffff;
  }
  
  return hash.toString(36);
};

// Generate a simpler key based on file name for grouping
const generateFileNameKey = (fileName: string): string => {
  return fileName.toLowerCase().replace(/[^a-z0-9]/g, '_');
};

export const cacheService = {
  // Generate cache key from file
  generateCacheKey: async (file: File): Promise<string> => {
    const hash = await generateFileHash(file);
    return `${CACHE_KEY_PREFIX}${hash}`;
  },

  // Generate a name-based key for checking similar files
  generateNameKey: (fileName: string): string => {
    const nameKey = generateFileNameKey(fileName);
    return `${CACHE_KEY_PREFIX}name_${nameKey}`;
  },

  // Store data in cache
  setCache: async (file: File, data: HouseholdData[]): Promise<void> => {
    try {
      const fileHash = await generateFileHash(file);
      const cacheKey = `${CACHE_KEY_PREFIX}${fileHash}`;
      const nameKey = cacheService.generateNameKey(file.name);
      
      const cacheEntry: CacheEntry = {
        data,
        timestamp: Date.now(),
        fileName: file.name,
        fileSize: file.size,
        dataLength: data.length,
        fileHash
      };
      
      // Store both exact match and name-based entries
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      
      // Also store a reference by name for quick lookup
      const nameBasedEntry = {
        ...cacheEntry,
        exactCacheKey: cacheKey
      };
      localStorage.setItem(nameKey, JSON.stringify(nameBasedEntry));
      
      console.log(`Cached ${data.length} records for file: ${file.name}`);
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  },

  // Enhanced cache retrieval with data completeness check
  getCache: async (file: File): Promise<{ data: HouseholdData[] | null; shouldUpdate: boolean; reason?: string }> => {
    try {
      const fileHash = await generateFileHash(file);
      const exactCacheKey = `${CACHE_KEY_PREFIX}${fileHash}`;
      const nameKey = cacheService.generateNameKey(file.name);
      
      // First, try exact match
      const exactMatch = localStorage.getItem(exactCacheKey);
      if (exactMatch) {
        const cacheEntry: CacheEntry = JSON.parse(exactMatch);
        
        // Check if cache is expired
        const isExpired = Date.now() - cacheEntry.timestamp > (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
        if (isExpired) {
          localStorage.removeItem(exactCacheKey);
          localStorage.removeItem(nameKey);
          return { data: null, shouldUpdate: true, reason: 'Cache expired' };
        }
        
        console.log(`Found exact cache match with ${cacheEntry.dataLength} records`);
        return { data: cacheEntry.data, shouldUpdate: false };
      }
      
      // If no exact match, check for files with the same name
      const nameMatch = localStorage.getItem(nameKey);
      if (nameMatch) {
        const nameEntry = JSON.parse(nameMatch);
        
        // Check if name-based cache is expired
        const isExpired = Date.now() - nameEntry.timestamp > (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
        if (isExpired) {
          localStorage.removeItem(nameKey);
          if (nameEntry.exactCacheKey) {
            localStorage.removeItem(nameEntry.exactCacheKey);
          }
          return { data: null, shouldUpdate: true, reason: 'Name-based cache expired' };
        }
        
        console.log(`Found name-based cache match with ${nameEntry.dataLength} records for similar file`);
        
        // Return the cached data but indicate we should process to check for more data
        return { 
          data: nameEntry.data, 
          shouldUpdate: true, 
          reason: `Checking if new file has more than ${nameEntry.dataLength} records` 
        };
      }
      
      return { data: null, shouldUpdate: true, reason: 'No cache found' };
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return { data: null, shouldUpdate: true, reason: 'Cache retrieval error' };
    }
  },

  // Update cache if new data has more records
  updateCacheIfBetter: async (file: File, newData: HouseholdData[], cachedData?: HouseholdData[]): Promise<boolean> => {
    try {
      if (!cachedData || newData.length > cachedData.length) {
        await cacheService.setCache(file, newData);
        
        if (cachedData) {
          console.log(`Updated cache: ${cachedData.length} → ${newData.length} records for ${file.name}`);
        }
        return true;
      }
      
      console.log(`Keeping existing cache: ${newData.length} ≤ ${cachedData.length} records for ${file.name}`);
      return false;
    } catch (error) {
      console.warn('Failed to update cache:', error);
      return false;
    }
  },

  // Clear all cache entries
  clearCache: (): void => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cache cleared successfully');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },

  // Get cache info for debugging
  getCacheInfo: (): { totalEntries: number; totalSize: number; files: Array<{name: string; records: number; timestamp: Date}> } => {
    let totalEntries = 0;
    let totalSize = 0;
    const files: Array<{name: string; records: number; timestamp: Date}> = [];
    
    try {
      const keys = Object.keys(localStorage);
      const processedFiles = new Set<string>();
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          totalEntries++;
          const item = localStorage.getItem(key);
          if (item) {
            totalSize += item.length;
            
            // Only add to files list if it's not a name-based key duplicate
            try {
              const entry = JSON.parse(item) as CacheEntry;
              if (entry.fileName && !processedFiles.has(entry.fileName)) {
                files.push({
                  name: entry.fileName,
                  records: entry.dataLength || 0,
                  timestamp: new Date(entry.timestamp)
                });
                processedFiles.add(entry.fileName);
              }
            } catch {
              // Ignore parsing errors for corrupted entries
            }
          }
        }
      });
    } catch (error) {
      console.warn('Failed to get cache info:', error);
    }
    
    return { totalEntries, totalSize, files };
  },

  // Clean up old or corrupted cache entries
  cleanupCache: (): void => {
    try {
      const keys = Object.keys(localStorage);
      const expiredKeys: string[] = [];
      
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry = JSON.parse(item);
              const isExpired = Date.now() - entry.timestamp > (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
              if (isExpired) {
                expiredKeys.push(key);
              }
            }
          } catch {
            // Remove corrupted entries
            expiredKeys.push(key);
          }
        }
      });
      
      expiredKeys.forEach(key => localStorage.removeItem(key));
      
      if (expiredKeys.length > 0) {
        console.log(`Cleaned up ${expiredKeys.length} expired/corrupted cache entries`);
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
};
