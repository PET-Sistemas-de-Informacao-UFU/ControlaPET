import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthProvider.tsx'
import { ItemsProvider } from './context/ItemsProvider.tsx'
import { AppRouter } from './routes/AppRouter.tsx'
import './styles/base.css'
import './styles/mobile.css'
import './styles/desktop.css'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
          <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
