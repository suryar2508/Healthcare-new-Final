import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const contentType = res.headers.get('content-type');
      let errorMessage;
      
      if (contentType && contentType.includes('application/json')) {
        const json = await res.json();
        errorMessage = json.message || json.error || JSON.stringify(json);
      } else {
        const text = await res.text();
        // Check if response is HTML and provide a more helpful error
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          errorMessage = 'Received HTML instead of JSON. This usually indicates a server error.';
        } else {
          errorMessage = text;
        }
      }
      
      throw new Error(`${res.status}: ${errorMessage}`);
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message !== res.statusText) {
        throw parseError;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type ResponseBehavior = "returnNull" | "throw";
type QueryFnOptions = {
  on401: ResponseBehavior;
  on403?: ResponseBehavior;
};

export const getQueryFn: <T>(options: QueryFnOptions) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, on403: forbiddenBehavior = "throw" }) =>
  async ({ queryKey }) => {
    try {
      const url = queryKey[0] as string;
      console.log(`Making request to: ${url}`);
      
      const res = await fetch(url, {
        credentials: "include",
      });

      // Handle unauthorized (not logged in)
      if (res.status === 401) {
        console.log(`401 Unauthorized response from ${url}`);
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
      }
      
      // Handle forbidden (logged in but no permission)
      if (res.status === 403) {
        console.log(`403 Forbidden response from ${url}`);
        if (forbiddenBehavior === "returnNull") {
          return null;
        }
      }

      await throwIfResNotOk(res);
      
      // Check if the response is valid JSON before parsing
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      } else {
        console.error('Expected JSON response but got:', contentType);
        throw new Error('Server returned an invalid response format');
      }
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
