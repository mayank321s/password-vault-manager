import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from './contexts/SessionContext';
import { apiClient } from './lib/api-client';
import App from './App.tsx';
import './index.css';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Restore auth token from IndexedDB before first render so requests
// on page refresh carry the Authorization header immediately.
apiClient.initializeAuth();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <SessionProvider>
        <App />
      </SessionProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
