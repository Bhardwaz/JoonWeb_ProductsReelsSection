import { useEffect, useRef } from "react";

const THROTTLE_MS = 500;

export function useKeyboardNavigation({
    nextThumb,
    prevThumb,
    appendNext,
    allItems,
    handleCloseModal
})  {
    const lastKeyTimeRef = useRef(0)
     
    const smoothScrollToCenter = () => {
      const el = document.querySelector(".modal-card-left");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    };

    useEffect(() => {
        const handleKey = e => {
            const now = Date.now()
            if(now - lastKeyTimeRef.current < THROTTLE_MS) return

            const actions = {
                ArrowDown: "NEXT", ArrowRight: "NEXT", s: "NEXT", d: "NEXT",
                ArrowUp: "PREV", ArrowLeft: "PREV", w: "PREV", a: "PREV",
            }

            if(actions[e.key] === "NEXT") {
                lastKeyTimeRef.current = now
                smoothScrollToCenter()
                appendNext()
                nextThumb(allItems?.length)
            } 
            if(actions[e.key] === 'PREV'){
                smoothScrollToCenter()
                lastKeyTimeRef.current = now
                prevThumb(allItems?.length)
            }
            if(e.key === 'Escape'){
               handleCloseModal()
            }
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [ nextThumb, prevThumb, appendNext, allItems, handleCloseModal])
}