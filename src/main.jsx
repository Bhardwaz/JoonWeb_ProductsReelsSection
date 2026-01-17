import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorFallback from './component/ErrorFallback.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 5,
      refetchOnWindowFocus: false,
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <QueryClientProvider client={queryClient}>
  <ErrorFallback>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </ErrorFallback>
  </QueryClientProvider>
  </StrictMode>,
)
