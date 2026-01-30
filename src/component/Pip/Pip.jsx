import React, { useState } from 'react';
import { useViewerStore } from "../../store/useViewerStore";
import VideoJSPlayer from "../Carousel/VideoJSPlayer";

function Pip({ src, pip, id, settings }) {
    const pipOpen = useViewerStore((state) => state.pipOpen);
    const closePip = useViewerStore((state) => state.closePip);
    const openModal = useViewerStore(state => state.openModal);
    const activeView = useViewerStore(store => store.activeView);
    
    // State: false = Standard PIP, true = Tiny Circle (Minimized)
    const [isMinimized, setIsMinimized] = useState(false);

    if (!pipOpen || activeView !== null) return null;

    // --- 1. DESKTOP CONFIGURATION ---
    const desktopRadiusVal = settings?.borderRadius || 12;
    // Desktop is circle if: Backend says so OR User minimized it
    const isDesktopCircle = settings?.circle === true || isMinimized;

    const desktop = {
        pos: settings?.position || 'bottom-right',
        size: isMinimized ? 5 : (settings?.size || 20),
        margin: `${settings?.margin || 20}px`,
        // If circle, force 50%. Else use desktop specific radius.
        radius: isDesktopCircle ? '50%' : `${desktopRadiusVal}%`,
        aspect: isDesktopCircle ? '1 / 1' : '9 / 16',
        btnOffset: isDesktopCircle ? '15%' : '0.5rem'
    };

    // --- 2. MOBILE CONFIGURATION ---
    // Fallback to desktop radius if mobile specific radius isn't provided
    const mobileRadiusVal = settings?.mobile?.borderRadius ?? desktopRadiusVal;
    // Mobile is circle if: Backend says so OR User minimized it
    const isMobileCircle = settings?.mobile?.circle === true || isMinimized;

    const mobile = {
        pos: settings?.mobile?.position || 'bottom-right',
        size: isMinimized ? 15 : (settings?.mobile?.size || 40),
        margin: `${settings?.mobile?.margin || 10}px`,
        // If circle, force 50%. Else use mobile specific radius.
        radius: isMobileCircle ? '50%' : `${mobileRadiusVal}%`,
        aspect: isMobileCircle ? '1 / 1' : '9 / 16',
        btnOffset: isMobileCircle ? '15%' : '0.5rem'
    };

    // --- 3. HELPER: CSS GENERATOR ---
    const getPositionStyles = (pos, margin) => {
        const positions = {
            'top-left':     `top: ${margin}; left: ${margin}; bottom: auto; right: auto;`,
            'top-right':    `top: ${margin}; right: ${margin}; bottom: auto; left: auto;`,
            'bottom-left':  `bottom: ${margin}; left: ${margin}; top: auto; right: auto;`,
            'bottom-right': `bottom: ${margin}; right: ${margin}; top: auto; left: auto;`,
        };
        return positions[pos] || positions['bottom-right'];
    };

    const handleMainClick = (e) => {
        if (isMinimized) {
            setIsMinimized(false);
        } else {
            openModal(0, 'Pip', id, pip);
            document.documentElement.classList.add('plugin-overflow-hidden');
            document.body.classList.add('plugin-overflow-hidden');
        }
    };

    const handleCloseClick = (e) => {
        e.stopPropagation(); 
        if (isMinimized) {
            closePip(); // Destroy
        } else {
            setIsMinimized(true); // Minimize
        }
    };

    return (
        <>
            <style>
                {`
                    /* --- DESKTOP VARIABLES (Default) --- */
                    :root {
                        --pip-radius: ${desktop.radius};
                        --pip-aspect: ${desktop.aspect};
                        --pip-btn-offset: ${desktop.btnOffset};
                    }

                    .pip-responsive-wrapper {
                        ${getPositionStyles(desktop.pos, desktop.margin)}
                        width: ${desktop.size}vw;
                        min-width: ${isMinimized ? '80px' : '120px'};
                        max-width: ${isMinimized ? '80px' : '300px'};
                        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }

                    /* --- MOBILE VARIABLES (Overrides) --- */
                    @media (max-width: 768px) {
                        /* We target the scope class to override variables 
                           specifically for mobile screens 
                        */
                        .pip-container-scope {
                            --pip-radius: ${mobile.radius};
                            --pip-aspect: ${mobile.aspect};
                            --pip-btn-offset: ${mobile.btnOffset};
                        }

                        .pip-responsive-wrapper {
                            ${getPositionStyles(mobile.pos, mobile.margin)}
                            width: ${mobile.size}vw;
                            min-width: ${isMinimized ? '70px' : 'unset'};
                            max-width: ${isMinimized ? '70px' : '200px'};
                        }
                    }
                    
                    /* --- SHARED STYLES USING VARIABLES --- */
                    .pip-inner-card {
                        border-radius: var(--pip-radius);
                        aspect-ratio: var(--pip-aspect);
                        transition: border-radius 0.4s ease, aspect-ratio 0.4s ease;
                    }
                    
                    .pip-close-btn {
                        top: var(--pip-btn-offset);
                        right: var(--pip-btn-offset);
                        transition: top 0.4s ease, right 0.4s ease;
                    }

                    /* Disable pointer events on video so clicks pass through to container */
                    .disable-video-interactions, 
                    .disable-video-interactions * {
                        pointer-events: none !important;
                    }

                    .disable-video-interactions .video-js,
                    .disable-video-interactions video {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                        position: absolute !important;
                    }
                `}
            </style>

            <div className="pip-container-scope">
                <div 
                    className="pip-responsive-wrapper fixed z-[9999] flex flex-col items-end animate-in fade-in slide-in-from-bottom-10 duration-500"
                    onClick={handleMainClick}
                    title={isMinimized ? "Click to restore" : "Click to expand"}
                >
                    <div className="pip-inner-card relative w-full bg-black shadow-2xl border border-white/10 overflow-hidden cursor-pointer hover:scale-[1.05] duration-200">
                        
                        <div className="absolute inset-0 z-10 disable-video-interactions">
                            <VideoJSPlayer 
                                options={{
                                    autoplay: 'any',
                                    loop: true,
                                    muted: true,
                                    controls: false,
                                    responsive: true,
                                    fill: true,
                                    sources: [{ src: src, type: "application/x-mpegURL" }]
                                }} 
                            />
                        </div>

                        <button
                            onClick={handleCloseClick}
                            style={{
                                backgroundColor: isMinimized ? 'rgba(220, 38, 38, 0.9)' : 'rgba(0,0,0,0.4)'
                            }}
                            className="pip-controls pip-close-btn absolute z-30 p-1.5 rounded-full text-white backdrop-blur-md hover:scale-110 hover:bg-red-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}

export default Pip;