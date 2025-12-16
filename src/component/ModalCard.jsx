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
  const { handleCloseModal, handleShimmirUi, isIframeReady } = useModal();
  const { items, appendNext, allItems } = useItems();
  const { thumbAt, nextThumb, prevThumb } = useThumb();

  const playersRef = useRef({});
  const iframesRef = useRef({});
  const prevIndexRef = useRef(thumbAt);

  const [isMuted, setIsMuted] = useState(false);
  const [playerJsReady, setPlayerJsReady] = useState(false);
  const { isMobile } = useResize()

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

 
  // --- 3. Keyboard Nav ---
  useEffect(() => {
    const smoothScrollToCenter = () => {
      const el = document.querySelector(".modal-card-left");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    };
    const handleKey = (e) => {
      if (["ArrowRight", "ArrowDown", "d", "s"].includes(e.key)) {
        smoothScrollToCenter();
        appendNext();
        nextThumb(allItems?.length);
      } else if (["ArrowLeft", "ArrowUp", "a", "w"].includes(e.key)) {
        smoothScrollToCenter();
        prevThumb(allItems?.length);
      } else if (e.key === "Escape") {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextThumb, prevThumb, handleCloseModal, appendNext, allItems]);

  const managePlayers = (activeIndex) => {
    // Loop through all known iframes/players
    Object.keys(iframesRef.current).forEach((key) => {
      const idx = parseInt(key);
      const player = playersRef.current[idx];
      const iframe = iframesRef.current[idx];
      
      const isCurrent = idx === activeIndex;

      if (isCurrent) {
        if (player) {
          try {
            player.setCurrentTime(0);
            if (isMuted) player.mute(); else player.unmute();
            player.play();
          } catch (e) { /* ignore */ }
        } else if (iframe?.contentWindow) {
          // Fallback if SDK not ready yet
          iframe.contentWindow.postMessage({ method: "setCurrentTime", value: 0 }, "*");
          iframe.contentWindow.postMessage({ method: isMuted ? "mute" : "unmute" }, "*");
          iframe.contentWindow.postMessage({ method: "play" }, "*");
        }
      } else {
        if (player) {
          try {
            player.pause();
            player.mute(); 
          } catch (e) { /* ignore */ }
        }
        // FORCE PAUSE via raw postMessage (Crucial for ghost audio)
        if (iframe?.contentWindow) {
          iframe.contentWindow.postMessage({ method: "pause" }, "*");
          iframe.contentWindow.postMessage({ method: "mute" }, "*");
        }
      }
    });
  };

  // --- 5. Effect: When thumbAt changes, trigger manager ---
  useEffect(() => {
    const t = setTimeout(() => {
      managePlayers(thumbAt);
    }, 50);
    return () => clearTimeout(t);
  }, [thumbAt, playerJsReady]);

  const initPlayer = (iframe, idx) => {
    if (!iframe || !window.playerjs) return;
    iframesRef.current[idx] = iframe;
    
    // create if not exists
    if (!playersRef.current[idx]) {
      try {
        const player = new window.playerjs.Player(iframe);
        playersRef.current[idx] = player;
        
        player.on('ready', () => {
           if (idx === thumbAt) {
             player.setCurrentTime(0);
             if(isMuted) player.mute(); else player.unmute();
             player.play();
           } else {
             player.pause();
             player.mute();
           }
        });
      } catch (e) {
        console.warn("Player init error", e);
      }
    } 
  };

  // --- 7. Overlay Click Handler (Play/Pause Toggle) ---
  const handleOverlayClick = () => {
    const activeIdx = isMobile ? prevIndexRef.current : thumbAt;
    const player = playersRef.current[activeIdx];
    const iframe = iframesRef.current[activeIdx];

    if (player) {
      player.getPaused((isPaused) => {
        if (isPaused) player.play();
        else player.pause();
      });
    } else if (iframe?.contentWindow) {
      // Fallback toggle
      iframe.contentWindow.postMessage({ method: "play" }, "*"); 
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    // Apply immediately to active player
    const activeIdx = isMobile ? prevIndexRef.current : thumbAt;
    const player = playersRef.current[activeIdx];
    if(player) {
        if(newMuted) player.mute();
        else player.unmute();
    }
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
          onSlideChange={(swiper) => {
            const newIndex = swiper.activeIndex;
            prevIndexRef.current = newIndex;
            
            if (newIndex > thumbAt) nextThumb();
            else if (newIndex < thumbAt) prevThumb();
            
            appendNext();
            managePlayers(newIndex);
          }}
        >
          {items.map((item, idx) => (
            <SwiperSlide key={item.id ?? idx}>
              <div className="iframe-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
              
              { !isIframeReady && <ReelShimmer />  }

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
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"  
                  allowFullScreen
                  style={{ width: "100%", height: "100%", border: 0, display: "block"}}
                />
              </div>

              {/* Mobile Product UI */}
              {
                 isIframeReady &&  <div className="mobile-product-bar" style={{ pointerEvents: 'none' }}>
                  <img
                    className="mobile-product-thumb"
                    src={items[idx]?.products?.[0]?.image || boatAirdopesImage}
                    alt="Product"
                  />
                  <div className="mobile-product-info" style={{ pointerEvents: 'auto' }}>
                    <div className="mobile-product-title">{item?.products?.[0]?.title || "Product Title"}</div>
                    <div className="mobile-product-price">
                      <span className="mobile-current">{item?.products[0].price}</span>
                    </div>
                  </div>
                  <button className="mobile-shop-btn" style={{ pointerEvents: 'auto' }}>Shop Now</button>
              </div>

              }
            </SwiperSlide>
          ))}
          
          {
            isIframeReady && <div className="mute-btn" onClick={handleToggleMute} style={{ zIndex: 50 }}>
            { isMuted ? "🔇" : "🔊"}
          </div>
          }
          
        </Swiper>
      ) : (
        // DESKTOP VIEW
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
                { !isIframeReady && <ReelShimmer /> }
                <iframe
                  ref={(el) => initPlayer(el, thumbAt)}
                  id={`bunny-video-desktop-${items[thumbAt].id ?? thumbAt}`}
                  className="modal-card-left-iframe"
                  src={`${items[thumbAt].videoUrl}?autoplay=false&loop=true&muted=true&preload=true`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                  allowFullScreen
                  style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                  onLoad={(e) => {
                    managePlayers(thumbAt)
                    handleShimmirUi()
                  }}
                />
             </div>
          </div>
        </div>
      )}

      {/* RIGHT SIDE (Product Details) */}
      <div className="modal-card-right">
        {
          !items[thumbAt]?.products.length === 0 ? (
            <ProductShimmer />
          ): items[thumbAt]?.products?.map((product, idx) => (
           <ProductDetail key={idx} product={product} />
        ))
      }
      </div>
    </div>
  );
}