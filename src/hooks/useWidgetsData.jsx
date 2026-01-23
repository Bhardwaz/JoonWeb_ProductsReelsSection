import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const useWidgetData = (site) => {
  let url = "https://shoppable-reels.manage.jooncorporation.com"
    // if(import.meta.env.VITE_NODE_ENV === 'development'){
    //     url = import.meta.env.VITE_LOCAL_API_URL
    //     site = "sumit-bhardwaj.myjoonweb.com"
    // }

  return useQuery({
    queryKey: ['widget-config'],
    queryFn: async () => {
      const { data } = await axios.get(`${url}/api/v1/widgets/getWidget`, {
        params: {
          site: site, 
          widgetType: 'Carousel'
        }
      });
      return data;
    },

    select: (data) => {
      return data.data
    },

    staleTime: 1000 * 60 * 5,
    retry: 1
  });
};