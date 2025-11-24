interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 15000,
    ...fetchOptions
  } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Success - return response
      if (response.ok) {
        return response;
      }

      // Don't retry client errors (4xx) except 408, 429
      if (
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 408 &&
        response.status !== 429
      ) {
        throw new ApiError(
          `Client error: ${response.statusText}`,
          response.status,
          response
        );
      }

      // Retry server errors (5xx) and specific client errors
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Max retries exceeded
      throw new ApiError(
        `Server error: ${response.statusText}`,
        response.status,
        response
      );
    } catch (error) {
      // Last attempt - throw error
      if (attempt === retries) {
        if (error instanceof ApiError) {
          throw error;
        }

        // Handle abort/timeout
        if (error instanceof Error && error.name === 'AbortError') {
          throw new ApiError('Request timeout');
        }

        // Handle network errors
        if (error instanceof TypeError) {
          throw new ApiError('Network error. Please check your connection.');
        }

        throw new ApiError('Request failed');
      }

      // Don't retry on abort (user cancelled)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout');
      }

      // Wait before retry
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new ApiError('Max retries exceeded');
}
