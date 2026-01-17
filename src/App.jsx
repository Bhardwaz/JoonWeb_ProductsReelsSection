import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WidgetLoader from './WidgetLoader';
import GlobalPlayerLayer from './component/GlobalPlayerLayer';
import { useWidgetData } from './hooks/useWidgetsData';
import { useViewerStore } from './store/useViewerStore';
import { useEffect } from 'react';

const queryClient = new QueryClient()

function App({ site }) {
  const { data } = useWidgetData(site)
  const setSite = useViewerStore((state) => state.setSite)

  useEffect(() => {
    setSite(site);
  }, [site])
  
  return (
    <QueryClientProvider client={queryClient}>

      <div className='App-relative'>
        <main className='p-4'>
          <WidgetLoader site={site} />
        </main>

        <GlobalPlayerLayer />
      </div>
    </QueryClientProvider>
  )
}

export default App
