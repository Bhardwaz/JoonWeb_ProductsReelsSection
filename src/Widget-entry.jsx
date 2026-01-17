import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 3,
      refetchOnWindowFocus: false,
    }
  }
})

const widgetInstances = document.querySelectorAll('.joon-web-widget');

console.log("🚀 widget-entry.js is loaded and running!");
console.log(widgetInstances, "widget instances")

widgetInstances.forEach((div) => {

  if (div.dataset.processed === "true") return;
  div.dataset.processed = "true";
  const site = div.getAttribute('data-site')

  createRoot(div).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App site={site} />
      </QueryClientProvider>
    </StrictMode>
  )
});
