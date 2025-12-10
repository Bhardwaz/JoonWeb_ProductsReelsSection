import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const ApiContext = createContext();

export function ApiProvider({ children }) {
  const url = "https://api2.joonweb.com/videos.json";
  const [items, setItems] = useState([]);

  useEffect(() => {
     fetchItems()
  }, []);

  async function fetchItems(){
      try {
        const res = await axios.get(url)
        setItems(res.data)
      } catch (error) {
        throw error
      }
  }

  return (
    <ApiContext.Provider value={{ items }}>
      {children}
    </ApiContext.Provider>
  );
}

export const useItems = () => useContext(ApiContext);
