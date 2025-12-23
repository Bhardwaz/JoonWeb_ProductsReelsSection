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
import { usePlayerJS } from "../hooks/usePlayerJS";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";

export default function ModalCard() {
  // Context Values
  const { handleCloseModal, handleShimmirUi, isIframeReady } = useModal();
  const { items, appendNext, allItems } = useItems();
  const { thumbAt, nextThumb, prevThumb, setThumb } = useThumb();

  // Refs
  const playersRef = useRef({});
  const iframesRef = useRef({});
  const prevIndexRef = useRef(thumbAt);
  const lastSyncedIndexRef = useRef(null);

  // Hooks & State
  const { isMobile } = useResize();
  const [isMuted, setIsMuted] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null);

  // Loading PlayerJS Script
  const { playerJsReady } = usePlayerJS();

  // --- 2. Central Sync Effect (Handles Navigation & Visuals) ---
  useEffect(() => {
    // A. Sync Swiper Position if externally changed (e.g. keyboard)
    if (swiperInstance && !swiperInstance.destroyed && swiperInstance.activeIndex !== thumbAt) {
      swiperInstance.slideTo(thumbAt);
    }

    // B. Manage Audio/Video
    // Removed setTimeout to prevent audio overlap race conditions
    managePlayers(thumbAt);

  }, [thumbAt, swiperInstance, playerJsReady]);

  // --- 3. Mute-Only Sync Effect ---
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
      try { p.pause(); p.mute(); } catch (e) { }
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
      const player = playersRef.current[idx]; // fetching its remote control
      const iframe = iframesRef.current[idx]; // fetching our car
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
        // Stop all other videos immediately
        if (player) {
          try {
            player.pause();
            player.mute(); // Mute ensures no ghost audio if pause lags slightly
          } catch (e) { }
        }
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ method: "pause" }, "*");
        }
      }
    });
  };

  useKeyboardNavigation({
    nextThumb,
    prevThumb,
    appendNext,
    allItems,
    handleCloseModal
  });

  const initPlayer = (iframe, idx) => {

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
    const newMuted = !isMuted
    setIsMuted(newMuted)
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
            setThumb(newIndex)
            managePlayers(newIndex);
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