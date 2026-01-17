// context/api.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useThumb } from "./thumb";
import { useReels } from "../hooks/useReels";
import { useGroupsContext } from "./groups";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  // getting active group id
  const { activeGroupId } = useGroupsContext()

  const { thumbAt } = useThumb();

  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const loadedRef = useRef(-1); // highest loaded index
  const [products, setProducts] = useState([])
  let [visibleReels, setVisibleReels] = useState([])
  let [visibleReelsWithProduct, setVisibleReelsWithProduct] = useState([])
   
  const { data, isLoading, isError, isFetching,  error, refetch } = useReels()

  useEffect(() => {
    if(!data) return
    setAllItems(data.reels)
    setProducts(data.products)
  }, [data])

  // core reaction: set items based on thumbAt and allItems
  useEffect(() => {
    if (!Array.isArray(allItems) || allItems.length === 0) return;
    if (typeof thumbAt === "undefined" || thumbAt === null) return;

    const total = allItems.length;

    // rule: thumbAt < 3 => load 0..2 (or fewer if total < 3)
    if (thumbAt < 3) {
      const upto = Math.min(3, total);
      if (loadedRef.current < upto - 1) {
        setItems(allItems.slice(0, upto));
        loadedRef.current = upto - 1;
      }
      return;
    }

    // rule: thumbAt >= 3 => load 0..thumbAt
    const needed = Math.min(thumbAt + 1, total - 1);
    if (loadedRef.current < needed) {
      setItems(allItems.slice(0, needed + 1));
      loadedRef.current = needed;
      return;
    }

    // if thumbAt <= loadedRef.current (user moved back) do nothing
  }, [thumbAt, allItems]);

  // append exactly one next item (callable from consumer)
  async function appendNext() {
    // ensure we have allItems
    if (!Array.isArray(visibleReels) || visibleReels.length === 0) {
      // nothing to append
      return false;
    }
    const next = loadedRef.current + 1;
    if (!visibleReels[next]) return false;

    setVisibleReels(prev => {
      // avoid duplicate append
      if (prev.length > 0 && prev[prev.length - 1] === visibleReels[next]) return prev;
      return [...prev, visibleReels[next]];
    });
    loadedRef.current = next;
    return true;
  }

  visibleReels = useMemo(() => {
    return activeGroupId === null ? allItems : allItems?.filter(item => item.group.includes(activeGroupId))
  }, [activeGroupId, allItems])

  /// constructing reels + product here 
  visibleReelsWithProduct = useMemo(() => {
    return visibleReels?.map(reel => {
      return {
        ...reel,
        product: reel.productId ? products[reel.productId] : null
      };
    });
  }, [visibleReels, products]);

  console.log(products, "products through apis")
  console.log(visibleReelsWithProduct, "visible reels with product")
 
  return (
    <ApiContext.Provider value={{ allItems, items, appendNext, visibleReelsWithProduct, products, isLoading, isError, isFetching,  error, refetch }}>
      {children}
    </ApiContext.Provider>
  );
}

export const useItems = () => useContext(ApiContext);
