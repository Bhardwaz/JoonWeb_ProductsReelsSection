import { useState, useEffect } from "react";

export function usePlayerJS() {
    const [playerJsReady, setPlayerJsReady] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        if (window.playerjs) {
            setPlayerJsReady(true)
            return
        }

        const s = document.createElement("script");
        s.src = "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
        s.async = true;
        s.onload = () => playerJsReady(true);
        document.head.appendChild(s);

    }, [])

    return playerJsReady
}