import { useEffect, useState } from "react";
import { usePlayerManager } from "./usePlayerManager";
import { useViewerStore } from "../store/useViewerStore";

const MOBILE_BREAKPOINT = 768;

export const useResize = () => {
    const {
        cleanupAllPlayers,
    } = usePlayerManager();

    const { closeModal } = useViewerStore();

    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT);

    useEffect(() => {
        const onResize = () => {
            const isNowMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            
            setIsMobile(isNowMobile);

            if (isNowMobile) {
                cleanupAllPlayers();
                closeModal();
                document.documentElement.classList.remove('plugin-overflow-hidden');
                document.body.classList.remove('plugin-overflow-hidden');
            }
        };
        
        window.addEventListener("resize", onResize);
        
        return () => window.removeEventListener("resize", onResize);
        
    }, [cleanupAllPlayers, closeModal]); 

    return { isMobile }
};