import React, { useEffect, useState } from "react";

const ResizeContext = React.createContext();

const MOBILE_BREAKPOINT = 768;

export const ResizeProvider = ({ children }) => {
    const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <ResizeContext.Provider value={{ isMobile }}>
            {children}
        </ResizeContext.Provider>
    );
};

export const useResize = () => React.useContext(ResizeContext);
