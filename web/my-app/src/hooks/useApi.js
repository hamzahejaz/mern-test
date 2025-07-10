import { useState, useEffect, useRef, useCallback } from 'react';

const globalCache = new Map();
const inFlightRequests = new Map();

const API_BASE_URL = 'http://localhost:4000/api';


export function useApi(resource, options = {}) {
  const {
    params = {},
    method = 'GET',
    body = null,
    headers = {},
    skip = false,
    cacheTTL = 5 * 60 * 1000 // 5 minutes default cache
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);
  const lastRequestRef = useRef(null);

  const createCacheKey = useCallback(() => {
    const queryString = new URLSearchParams(params).toString();
    return `${method}:${resource}${queryString ? '?' + queryString : ''}`;
  }, [resource, params, method]);

  const buildUrl = useCallback(() => {
    const queryString = new URLSearchParams(params).toString();
    const baseUrl = `${API_BASE_URL}/${resource.replace(/^\//, '')}`;
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [resource, params]);

  const getAuthToken = () => {
    // For now, get from window global - useAuth will set this
    return window.__auth_token__ || null;
  };

  const isCacheValid = (cacheEntry) => {
    if (!cacheEntry) return false;
    const now = Date.now();
    return (now - cacheEntry.timestamp) < cacheTTL;
  };

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (skip) return;

    const cacheKey = createCacheKey();
    const url = buildUrl();
    
    if (!forceRefresh && method === 'GET') {
      const cached = globalCache.get(cacheKey);
      if (cached && isCacheValid(cached)) {
        setData(cached.data);
        setError(null);
        setLoading(false);
        return cached.data;
      }
    }

    if (inFlightRequests.has(cacheKey)) {
      try {
        const result = await inFlightRequests.get(cacheKey);
        if (mountedRef.current) {
          setData(result);
          setError(null);
          setLoading(false);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err);
          setLoading(false);
        }
        throw err;
      }
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const requestPromise = (async () => {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (method === 'GET') {
          globalCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }

        return result;
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();

    inFlightRequests.set(cacheKey, requestPromise);
    lastRequestRef.current = requestPromise;

    try {
      const result = await requestPromise;
      
      if (mountedRef.current && lastRequestRef.current === requestPromise) {
        setData(result);
        setError(null);
        setLoading(false);
      }
      
      return result;
    } catch (err) {
      if (mountedRef.current && lastRequestRef.current === requestPromise) {
        setError(err);
        setLoading(false);
      }
      throw err;
    }
  }, [resource, params, method, body, headers, skip, cacheTTL, createCacheKey, buildUrl]);

  const refetch = useCallback(() => {
    return fetchData(true); // Force refresh
  }, [fetchData]);

  const clearCache = useCallback(() => {
    const cacheKey = createCacheKey();
    globalCache.delete(cacheKey);
  }, [createCacheKey]);

  useEffect(() => {
    if (!skip) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchData, skip]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    clearCache
  };
}


export const clearAllCache = () => {
  globalCache.clear();
  inFlightRequests.clear();
};


export const getCacheStats = () => {
  return {
    cacheSize: globalCache.size,
    inFlightRequests: inFlightRequests.size,
    cacheKeys: Array.from(globalCache.keys())
  };
};

export default useApi;