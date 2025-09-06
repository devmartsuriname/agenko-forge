/**
 * Asset Validation Utilities
 * Provides runtime validation and health checks for application assets
 */

interface AssetValidationResult {
  url: string;
  exists: boolean;
  loadTime?: number;
  error?: string;
}

/**
 * Validates if an asset URL is accessible
 */
export async function validateAsset(url: string): Promise<AssetValidationResult> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const endTime = performance.now();
    
    return {
      url,
      exists: response.ok,
      loadTime: endTime - startTime,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      url,
      exists: false,
      loadTime: endTime - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validates multiple assets in parallel
 */
export async function validateAssets(urls: string[]): Promise<AssetValidationResult[]> {
  const validationPromises = urls.map(url => validateAsset(url));
  return Promise.all(validationPromises);
}

/**
 * Core application assets that should always be available
 */
export const CRITICAL_ASSETS = [
  '/logo.png',
  '/placeholder.svg',
  '/images/about-workspace.jpg',
  '/images/about-team-collaboration.jpg'
] as const;

/**
 * Performs health check on critical assets
 */
export async function performAssetHealthCheck(): Promise<{
  healthy: boolean;
  results: AssetValidationResult[];
  failedAssets: string[];
}> {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrls = CRITICAL_ASSETS.map(path => `${baseUrl}${path}`);
  
  const results = await validateAssets(fullUrls);
  const failedAssets = results
    .filter(result => !result.exists)
    .map(result => result.url);
  
  return {
    healthy: failedAssets.length === 0,
    results,
    failedAssets
  };
}

/**
 * Development-only asset validation logger
 */
export function logAssetHealth() {
  if (process.env.NODE_ENV === 'development') {
    performAssetHealthCheck().then(({ healthy, results, failedAssets }) => {
      if (healthy) {
        console.log('✅ All critical assets are healthy');
      } else {
        console.warn('⚠️ Some critical assets failed to load:', failedAssets);
        console.table(results);
      }
    });
  }
}