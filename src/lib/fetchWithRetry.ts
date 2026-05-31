export async function fetchWithRetry(url: string | URL | Request, options?: RequestInit, maxRetries = 3): Promise<Response> {
  const fetchOptions: RequestInit = {
    ...options,
    // Google Apps Script redirects fail in modern browsers when third-party cookies are blocked or sent.
    // Omitting credentials prevents the browser from attaching cookies and failing the redirect.
    credentials: 'omit'
  };

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, fetchOptions);
      if (!response.ok) {
        // We should probably throw to trigger retry on 5xx errors too, 
        // as Google Apps Script sometimes returns 500s or 502s randomly.
        if (response.status >= 429) {
          throw new Error(`Server error: ${response.status}`);
        }
      }
      return response;
    } catch (e: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw new Error(`Failed to fetch from ${url}. Error: ${e?.message || 'Unknown'}`);
      }
      // Fast exponential-ish backoff: 250ms, 500ms, 1000ms
      await new Promise(resolve => setTimeout(resolve, 250 * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error("Max retries exceeded");
}
