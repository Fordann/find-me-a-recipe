// Debounce utility to prevent excessive API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Cache for preventing duplicate simultaneous requests
const pendingRequests = new Map<string, Promise<any>>();

export async function cachedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `${url}_${JSON.stringify(options?.body || {})}`;

  // If request is already pending, return the same promise
  if (pendingRequests.has(cacheKey)) {
    console.log('⚡ Using pending request cache for:', cacheKey.substring(0, 100));
    return pendingRequests.get(cacheKey)!;
  }

  console.log('🌐 New request:', url, options?.body ? `Body: ${options?.body}`: "");

  // Create new request
  const request = fetch(url, options)
    .then((res) => res.json())
    .finally(() => {
      // Clean up after request completes
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, request);
  return request;
}
