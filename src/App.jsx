import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WidgetLoader from './WidgetLoader';
import GlobalPlayerLayer from './component/GlobalPlayerLayer';
import { useWidgetData } from './hooks/useWidgetsData';
import { useViewerStore } from './store/useViewerStore';
import { useEffect } from 'react';
import { register } from 'swiper/element/bundle';

const queryClient = new QueryClient()
register()

function App({ site }) {
  const { data } = useWidgetData(site)
  const setSite = useViewerStore((state) => state.setSite)

  useEffect(() => {
    setSite(site);
  }, [site])
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className='App-relative tw-reset'>
        <main className='w-full'>
          <WidgetLoader site={site} />
        </main>

        {/* <GlobalPlayerLayer /> */}
      </div>
    </QueryClientProvider>
  )
}

export default App
