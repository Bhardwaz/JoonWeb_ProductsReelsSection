// context/api.jsx
import axios from "axios";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useThumb } from "./thumb";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const url = "http://localhost:3000/api/reels/getAll";
  const { thumbAt } = useThumb(); // you said thumbAt is available here

  const [allItems, setAllItems] = useState([]);
  const [items, setItems] = useState([]);
  const loadedRef = useRef(-1); // highest loaded index
  const [allGroups, setAllGroups] = useState([])
  const [activeGroupId, setActiveGroupId] = useState(null)

  useEffect(() => {
    let mounted = true;
    axios.get(url)
      .then(res => res.data.reels)
      .then(data => {
        if (!mounted) return;
        setAllItems(data);
      })
      .catch(err => {
        console.error("[ApiProvider] fetch error:", err);
      });
      getAllGroups()
    return () => { mounted = false; };
  }, []);

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
    if (!Array.isArray(allItems) || allItems.length === 0) {
      // nothing to append
      return false;
    }
    const next = loadedRef.current + 1;
    if (!allItems[next]) return false;

    setItems(prev => {
      // avoid duplicate append
      if (prev.length > 0 && prev[prev.length - 1] === allItems[next]) return prev;
      return [...prev, allItems[next]];
    });
    loadedRef.current = next;
    return true;
  }

  async function getAllGroups(params) {
      try {
        const res = await axios.get("http://localhost:3000/api/reels/getGroups")
        setAllGroups(res?.data?.groups)
      } catch (error) {
        console.log(error) 
      }
  }

  const visibleReels = useMemo(() => {
   return activeGroupId === null ? allItems : allItems?.filter(item => item.group.includes(activeGroupId))
  }, [activeGroupId, allItems])
  
  return (
    <ApiContext.Provider value={{ allItems, items, appendNext, allGroups, visibleReels, setActiveGroupId, activeGroupId }}>
      {children}
    </ApiContext.Provider>
  );
}

export const useItems = () => useContext(ApiContext);
