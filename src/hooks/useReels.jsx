// hooks/useReels.ts
import { useQuery } from "@tanstack/react-query";
import { fetchReelItemsAndProducts } from "../api/api.reels";


export function useReels() {
  return useQuery({
    queryKey: ["reels"],

    queryFn: fetchReelItemsAndProducts,

    /* ---------- CACHE ---------- */
    staleTime: Infinity,              // never auto refetch
    cacheTime: 30 * 60 * 1000,         // keep cache for 30 min

    /* ---------- RETRY ---------- */
    retry: (count, error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) return false;
      return count < 3;
    },
    retryDelay: attempt => attempt * 1000,

    /* ---------- OFFLINE ---------- */
    networkMode: "online",             // pause when offline

    /* ---------- UX ---------- */
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
}
