import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { client } from './client/client.gen'
import './index.css'
import { isSchemaValidationError } from './lib/format-error'

client.setConfig({
  baseUrl: 'http://localhost:8000',
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A schema-validation failure means the response will never match what
      // the frontend expects no matter how many times we ask, so retrying
      // (the default behavior) would just delay showing the real error.
      retry: (failureCount, error) => !isSchemaValidationError(error) && failureCount < 3,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
