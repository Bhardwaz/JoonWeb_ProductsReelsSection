import { useEffect, useRef, useState } from "react";
import { useItems } from "../context/api";
import { useModal } from "../context/modal";
import { useThumb } from "../context/thumb";
import "swiper/css";
import { Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import boatAirdopesImage from '../assets/boat-airdopes.jpeg';
import ReelShimmer from "../shimmir/ReelShimmir";
import { useResize } from "../context/resize";
import ProductDetail from "./ProductDetails";
import ProductShimmer from "../shimmir/ProductShimmir";

export default function ModalCard() {
  // Context Values
  const { handleCloseModal, handleShimmirUi, isIframeReady } = useModal();
  const { items, appendNext, allItems } = useItems();
  const { thumbAt, nextThumb, prevThumb } = useThumb();

  // Refs
  const playersRef = useRef({});
  const iframesRef = useRef({});
  const prevIndexRef = useRef(thumbAt);
  const lastKeyTimeRef = useRef(0);
  const lastSyncedIndexRef = useRef(null); // Critical: Prevents restart on mute toggle
  
  // Hooks & State
  const { isMobile } = useResize();
  const [isMuted, setIsMuted] = useState(false);
  const [playerJsReady, setPlayerJsReady] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null);
  
  const THROTTLE_MS = 400;

  // --- 1. Load PlayerJS Script ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.playerjs) {
      setPlayerJsReady(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
    s.async = true;
    s.onload = () => setPlayerJsReady(true);
    document.head.appendChild(s);
  }, []);

  // --- 2. Central Sync Effect (Handles Navigation & Visuals) ---
  useEffect(() => {
    // A. Sync Swiper Position
    if (swiperInstance && !swiperInstance.destroyed && swiperInstance.activeIndex !== thumbAt) {
      swiperInstance.slideTo(thumbAt);
    }

    // B. Manage Audio/Video (Navigation Only)
    const t = setTimeout(() => {
      managePlayers(thumbAt);
    }, 100);

    return () => clearTimeout(t);
  }, [thumbAt, swiperInstance, playerJsReady]);

  // --- 3. Mute-Only Sync Effect ---
  // This updates volume state without touching playback time (currentTime)
  useEffect(() => {
    const activeIdx = isMobile ? (swiperInstance?.activeIndex ?? thumbAt) : thumbAt;
    const player = playersRef.current[activeIdx];
    if (player) {
      if (isMuted) player.mute(); else player.unmute();
    }
  }, [isMuted, isMobile, thumbAt]);

  // --- 4. Handle View Switching Cleanup ---
  useEffect(() => {
    // Reset players to prevent ghost audio when switching layouts
    Object.values(playersRef.current).forEach(p => {
      try { p.pause(); p.mute(); } catch(e) {}
    });
    
    playersRef.current = {};
    iframesRef.current = {};
    lastSyncedIndexRef.current = null;

    if (!isMobile) setSwiperInstance(null);
  }, [isMobile]);

  // --- 5. Navigation Logic ---
  const managePlayers = (activeIndex) => {
    Object.keys(iframesRef.current).forEach((key) => {
      const idx = parseInt(key);
      const player = playersRef.current[idx];
      const iframe = iframesRef.current[idx];
      const isCurrent = idx === activeIndex;

      if (isCurrent) {
        if (player) {
          try {
            // ONLY reset video time if the reel index actually changed
            if (lastSyncedIndexRef.current !== activeIndex) {
              player.setCurrentTime(0);
              lastSyncedIndexRef.current = activeIndex;
            }
            if (isMuted) player.mute(); else player.unmute();
            player.play();
          } catch (e) { /* ignore */ }
        } else if (iframe?.contentWindow) {
          // Fallback if playerjs instance isn't ready
          iframe.contentWindow.postMessage({ method: "setCurrentTime", value: 0 }, "*");
          iframe.contentWindow.postMessage({ method: isMuted ? "mute" : "unmute" }, "*");
          iframe.contentWindow.postMessage({ method: "play" }, "*");
        }
      } else {
        // Stop all other videos
        if (player) {
          try { player.pause(); player.mute(); } catch (e) {}
        }
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ method: "pause" }, "*");
        }
      }
    });
  };

  // --- 6. Keyboard Navigation ---
  useEffect(() => {
    const smoothScrollToCenter = () => {
      const el = document.querySelector(".modal-card-left");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    };

    const handleKey = (e) => {
      const now = Date.now();
      if (now - lastKeyTimeRef.current < THROTTLE_MS) return;

      if (["ArrowRight", "ArrowDown", "d", "s"].includes(e.key)) {
        lastKeyTimeRef.current = now;
        smoothScrollToCenter();
        appendNext();
        nextThumb(allItems?.length);
      } else if (["ArrowLeft", "ArrowUp", "a", "w"].includes(e.key)) {
        lastKeyTimeRef.current = now;
        smoothScrollToCenter();
        prevThumb(allItems?.length);
      } else if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextThumb, prevThumb, handleCloseModal, appendNext, allItems]);

  const initPlayer = (iframe, idx) => {
    if (!iframe) {
      delete iframesRef.current[idx];
      delete playersRef.current[idx];
      return;
    }
    if (!window.playerjs) return;

    if (iframesRef.current[idx] !== iframe) {
      iframesRef.current[idx] = iframe;
      try {
        const player = new window.playerjs.Player(iframe);
        playersRef.current[idx] = player;

        player.on('ready', () => {
          if (idx === thumbAt) {
            // Only set time on initial mount if not already synced
            if (lastSyncedIndexRef.current !== idx) {
               player.setCurrentTime(0);
               lastSyncedIndexRef.current = idx;
            }
            if (isMuted) player.mute(); else player.unmute();
            player.play();
          } else {
            player.pause();
            player.mute();
          }
        });
      } catch (e) { console.warn("Player init error", e); }
    }
  };

  const handleOverlayClick = () => {
    const activeIdx = isMobile ? (swiperInstance?.activeIndex ?? thumbAt) : thumbAt;
    const player = playersRef.current[activeIdx];
    if (player) {
      player.getPaused((isPaused) => {
        if (isPaused) player.play();
        else player.pause();
      });
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(prev => !prev);
    // Note: The useEffect for [isMuted] handles the actual player call.
  };

  if (!items || !items[thumbAt]) return null;

  return (
    <div className="modal-card-container">
      {isMobile ? (
        <Swiper
          direction="vertical"
          slidesPerView={1}
          mousewheel
          modules={[Mousewheel]}
          className="modal-card-left mySwiper"
          initialSlide={thumbAt}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => {
            const newIndex = swiper.activeIndex;
            prevIndexRef.current = newIndex;
            if (newIndex !== thumbAt) {
              if (newIndex > thumbAt) nextThumb();
              else prevThumb();
            }
            appendNext();
          }}
        >
          {items.map((item, idx) => (
            <SwiperSlide key={item.id ?? idx}>
              <div className="iframe-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
                {!isIframeReady && <ReelShimmer />}
                <div
                  className="iframe-block-overlay"
                  onClick={handleOverlayClick}
                  style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'transparent' }}
                />
                <iframe
                  ref={(el) => initPlayer(el, idx)}
                  onLoad={handleShimmirUi}
                  className="modal-card-left-iframe"
                  src={`${item.videoUrl}?autoplay=true&loop=true&muted=false&preload=true`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                />
              </div>

              {isIframeReady && (
                <div className="mobile-product-bar" style={{ pointerEvents: 'none' }}>
                  <img
                    className="mobile-product-thumb"
                    src={items[idx]?.products?.[0]?.image || boatAirdopesImage}
                    alt="Product"
                  />
                  <div className="mobile-product-info" style={{ pointerEvents: 'auto' }}>
                    <div className="mobile-product-title">{item?.products?.[0]?.title || "Product Title"}</div>
                    <div className="mobile-product-price">
                      <span className="mobile-current">{item?.products?.[0]?.price}</span>
                    </div>
                  </div>
                  <button className="mobile-shop-btn" style={{ pointerEvents: 'auto' }}>Shop Now</button>
                </div>
              )}
            </SwiperSlide>
          ))}
          {isIframeReady && (
            <div className="mute-btn" onClick={handleToggleMute} style={{ zIndex: 50 }}>
              {isMuted ? "🔇" : "🔊"}
            </div>
          )}
        </Swiper>
      ) : (
        /* DESKTOP VIEW */
        <div className="modal-card-left">
          <div className="swipe-catcher" style={{ height: "100vh", width: "100%", position: 'relative' }}>
            <div className="mute-btn" onClick={handleToggleMute} style={{ zIndex: 50 }}>
              {isMuted ? "🔇" : "🔊"}
            </div>
            <div className="iframe-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
              <div
                className="iframe-block-overlay"
                onClick={handleOverlayClick}
                style={{ position: 'absolute', inset: 0, zIndex: 10 }}
              />
              {!isIframeReady && <ReelShimmer />}
              <iframe
                ref={(el) => initPlayer(el, thumbAt)}
                id={`bunny-video-desktop-${items[thumbAt].id ?? thumbAt}`}
                className="modal-card-left-iframe"
                src={`${items[thumbAt].videoUrl}?autoplay=false&loop=true&muted=true&preload=true`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                onLoad={() => {
                  managePlayers(thumbAt);
                  handleShimmirUi();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* RIGHT SIDE (Product Details) */}
      <div className="modal-card-right">
        {!items[thumbAt]?.products || items[thumbAt].products.length === 0 ? (
          <ProductShimmer />
        ) : (
          items[thumbAt].products.map((product, idx) => (
            <ProductDetail key={idx} product={product} />
          ))
        )}
      </div>
    </div>
  );
}