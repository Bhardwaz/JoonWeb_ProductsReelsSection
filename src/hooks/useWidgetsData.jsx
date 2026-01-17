import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useWidgetData = (site) => {
  return useQuery({
    queryKey: ['widget-config'],
    queryFn: async () => {
      const { data } = await axios.get('/api/v1/widgets/getWidget', {
        params: {
          site: site, 
          widgetType: 'Carousel'
        }
      });
      return data;
    },

    select: (data) => {
      console.log(data.data)
      return data.data
    },

    staleTime: 1000 * 60 * 5,
    retry: 1
  });
};