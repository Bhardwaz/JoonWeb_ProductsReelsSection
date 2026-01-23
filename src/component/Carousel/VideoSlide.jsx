// components/VideoSlide.jsx
import React, { useEffect, useRef, memo } from "react";

const VideoSlide = memo(({ 
    item, 
    idx, 
    initPlayer, 
    isMuted,
    onReady 
}) => {
    const iframeRef = useRef(null);

    useEffect(() => {
        
        if (!iframeRef.current) return;

        const iframe = iframeRef.current;
        let playerInstance = null;

        const handleLoad = () => {
    
            console.log(`🚀 Booting Player for Slide ${idx}`);
            playerInstance = initPlayer(iframe, idx);

            if (!playerInstance) return;

            try {
                // Handle Mute safely
                if (isMuted) {
                    if (playerInstance.mute) playerInstance.mute();
                } else {
                    if (playerInstance.unmute) playerInstance.unmute();
                }

                // Play
                playerInstance.play();
                
                // 3. Notify Parent (to hide shimmer)
                // Small delay to ensure video texture is ready
                if (onReady) {
                    setTimeout(() => onReady(), 300);
                }
                
            } catch (err) {
                console.warn("Autoplay error:", err);
            }
        };

        // Standard Load Check
        if (iframe.contentWindow && iframe.contentDocument?.readyState === 'complete') {
            handleLoad();
        } else {
            iframe.onload = handleLoad;
        }

        // 4. CLEANUP: This is CRITICAL.
        // When you swipe away, React destroys this component.
        // We MUST destroy the player to stop audio and free memory.
        return () => {
            try {
                if (playerInstance && playerInstance.destroy) {
                    playerInstance.destroy();
                }
            } catch (e) {
                // Ignore destruction errors
            }
        };

    }, [idx, initPlayer, isMuted, onReady]);

    return (
        <iframe
            ref={iframeRef}
            className="z-[1] w-full h-full block pointer-events-none absolute inset-0"
            // Simple URL: No cache busters needed because we destroy the iframe fully
            src={`${item.mediaId?.url}?autoplay=true&loop=true&muted=true&preload=true&controls=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            // Tell browser to load this ASAP
            fetchPriority="high" 
            title={`Video ${idx + 1}`}
        />
    );
});

export default VideoSlide;