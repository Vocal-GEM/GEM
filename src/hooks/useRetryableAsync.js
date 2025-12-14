import { useState, useCallback } from 'react';

/**
 * Hook for async operations with retry
 */
export const useRetryableAsync = (asyncFn, options = {}) => {
    const { maxRetries = 3, retryDelay = 1000 } = options;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const execute = useCallback(async (...args) => {
        setIsLoading(true);
        setError(null);

        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await asyncFn(...args);
                setData(result);
                setRetryCount(attempt);
                setIsLoading(false);
                return result;
            } catch (e) {
                lastError = e;
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)));
                }
            }
        }

        setError(lastError);
        setIsLoading(false);
        throw lastError;
    }, [asyncFn, maxRetries, retryDelay]);

    const retry = useCallback(() => {
        return execute();
    }, [execute]);

    return { execute, retry, isLoading, error, data, retryCount };
};
