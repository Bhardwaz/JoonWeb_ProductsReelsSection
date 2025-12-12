import { useEffect, useRef, useState } from "react";
import { useItems } from "../context/api";
import { useModal } from "../context/modal";
import { useThumb } from "../context/thumb";
import "swiper/css";
import "swiper/css/pagination";
import { Mousewheel, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const MOBILE_BREAKPOINT = 768;

export default function ModalCard() {
  const { handleCloseModal } = useModal();
  const items = useItems()?.items || [];
  const { thumbAt, nextThumb, prevThumb } = useThumb();

  const playersRef = useRef({});
  const iframesRef = useRef({});
  const prevIndexRef = useRef(thumbAt);

  // states
  const [isMuted, setIsMuted] = useState(true);
  const [playerJsReady, setPlayerJsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT);

  // --- loading PlayerJS script once ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.playerjs) {
      setPlayerJsReady(true);
      return;
    }
    let mounted = true;
    const s = document.createElement("script");
    s.src = "https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js";
    s.async = true;
    s.onload = () => { if (mounted) setPlayerJsReady(true); };
    s.onerror = () => { if (mounted) setPlayerJsReady(false); console.warn("PlayerJS failed to load"); };
    document.head.appendChild(s);
    return () => { mounted = false; };
  }, []);

  // --- window resize watcher ---
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- keyboard handlers ---
  useEffect(() => {
    const smoothScrollToCenter = () => {
      const el = document.querySelector(".modal-card-left");
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    };
    const handleKey = (e) => {
      if (["ArrowRight", "ArrowDown", "d", "s"].includes(e.key)) {
        smoothScrollToCenter();
        nextThumb();
      } else if (["ArrowLeft", "ArrowUp", "a", "w"].includes(e.key)) {
        smoothScrollToCenter();
        prevThumb();
      } else if (e.key === "Escape") {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextThumb, prevThumb, handleCloseModal]);

  // --- initialize player for an iframe ---
  function initPlayerForIframe(iframeEl, idx, activeIndex) {
    if (!iframeEl) return;
    iframesRef.current[idx] = iframeEl;

    // If PlayerJS SDK available, use it
    if (playerJsReady && window.playerjs) {
      try {
        // PlayerJS typically constructed as: new window.playerjs.Player(iframeEl)
        // but some variants return an object with different API. Be defensive.
        const player = new window.playerjs.Player(iframeEl);
        playersRef.current[idx] = player;

        // Ensure background slides are muted; active slide follows global isMuted
        if (typeof player.mute === "function") {
          if (idx === activeIndex) {
            if (isMuted) player.mute(); 
            else player.unmute && player.unmute();
          } else {
            player.mute();
          }
        } else if (typeof player.setMuted === "function") {
          // alternate API shape
          if (idx === activeIndex) player.setMuted(!!isMuted);
          else player.setMuted(true);
        }

        // Pause by default; we'll play the active one later
        if (typeof player.pause === "function") player.pause();
      } catch (err) {
        console.warn("playerjs init failed for idx", idx, err);
        playersRef.current[idx] = null;
      }
      return;
    }

    // Fallback: keep iframe DOM for postMessage control
    playersRef.current[idx] = null;
  }

  // --- pause all except activeIndex and set mute state appropriately ---
  function pauseAllExcept(activeIndex) {
    Object.entries(playersRef.current).forEach(([k, player]) => {
      const i = Number(k);
      if (i === activeIndex) return;

      if (player && typeof player.pause === "function") {
        try {
          player.pause();
          if (typeof player.mute === "function") player.mute();
          else if (typeof player.setMuted === "function") player.setMuted(true);
        } catch (e) { /* ignore */ }
        return;
      }

      // fallback: try postMessage to iframe contentWindow
      const iframe = iframesRef.current[i];
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage({ method: "pause" }, "*");
          iframe.contentWindow.postMessage({ method: "mute" }, "*");
        } catch (e) { /* ignore */ }
      }
    });

    // Play and apply mute state for active player
    const activePlayer = playersRef.current[activeIndex];
    if (activePlayer && typeof activePlayer.play === "function") {
      try { activePlayer.play(); } catch (e) { /* ignore */ }
      try {
        if (typeof activePlayer.mute === "function") {
          if (isMuted) activePlayer.mute(); else activePlayer.unmute && activePlayer.unmute();
        } else if (typeof activePlayer.setMuted === "function") {
          activePlayer.setMuted(!!isMuted);
        }
      } catch (e) { /* ignore */ }
    } else {
      const activeIframe = iframesRef.current[activeIndex];
      if (activeIframe && activeIframe.contentWindow) {
        try {
          activeIframe.contentWindow.postMessage({ method: "play" }, "*");
          activeIframe.contentWindow.postMessage({ method: isMuted ? "mute" : "unmute" }, "*");
        } catch (e) { /* ignore */ }
      }
    }
  }

  // --- when thumbAt changes, sync players (slight delay to let DOM mount) ---
  useEffect(() => {
    const t = setTimeout(() => pauseAllExcept(thumbAt), 100);
    return () => clearTimeout(t);
  }, [thumbAt, playerJsReady, isMuted]);

  // --- mobile slide change handler ---
  const onMobileSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex;
    const prevIndex = prevIndexRef.current;
    if (newIndex === prevIndex) return;
    if (newIndex > prevIndex) nextThumb();
    else prevThumb();
    prevIndexRef.current = newIndex;

    pauseAllExcept(newIndex);
  };

  // --- toggle mute for active player ---
  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const activeIndex = isMobile ? (prevIndexRef.current ?? thumbAt) : thumbAt;
    const activePlayer = playersRef.current[activeIndex];

    if (activePlayer) {
      try {
        if (typeof activePlayer.mute === "function") {
          if (newMuted) activePlayer.mute();
          else activePlayer.unmute && activePlayer.unmute();
        } else if (typeof activePlayer.setMuted === "function") {
          activePlayer.setMuted(!!newMuted);
        } else {
          // unknown API: ignore and fall back to postMessage
          const iframe = iframesRef.current[activeIndex];
          if (iframe?.contentWindow) iframe.contentWindow.postMessage({ method: newMuted ? "mute" : "unmute" }, "*");
        }
      } catch (e) { /* ignore */ }
      return;
    }

    // fallback (no SDK): try postMessage
    const iframe = iframesRef.current[activeIndex];
    if (iframe && iframe.contentWindow) {
      try { iframe.contentWindow.postMessage({ method: newMuted ? "mute" : "unmute" }, "*"); } catch (e) {}
    }
  };

  // guard: nothing to render
  if (!items || items.length === 0 || !items[thumbAt] || !items[thumbAt].videoUrl) return null;

  return (
    <div className="modal-card-container">
      {isMobile ? (
        <Swiper
          direction="vertical"
          slidesPerView={1}
          spaceBetween={30}
          mousewheel
          pagination={{ clickable: true }}
          modules={[Mousewheel, Pagination]}
          className="modal-card-left mySwiper"
          initialSlide={thumbAt}
          onSlideChange={onMobileSlideChange}
        >
          {items.map((item, idx) => {
            const iframeId = `bunny-video-${item.id ?? idx}`;
            return (
              <SwiperSlide key={item.id ?? idx}>
                <div className="iframe-wrapper">
                  <div className="iframe-block-overlay" attr="overlay" />
                  <iframe
                    id={iframeId}
                    ref={(el) => {
                      if (el) {
                        iframesRef.current[idx] = el;
                        // if SDK is ready and player not yet created, init (covers script loaded after DOM)
                        const activeIndex = prevIndexRef.current ?? thumbAt;
                        if (playerJsReady && !playersRef.current[idx]) initPlayerForIframe(el, idx, activeIndex);
                      }
                    }}
                    data-index={idx}
                    className="modal-card-left-iframe loading"
                    src={item.videoUrl}
                    key={item.id ?? idx}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                    onLoad={(e) => {
                      e.target.classList.add("loaded");
                      // init player after load
                      const activeIndex = prevIndexRef.current ?? thumbAt;
                      if (!playersRef.current[idx] && playerJsReady) initPlayerForIframe(e.target, idx, activeIndex);

                      // if this slide is active, ensure others paused and its mute state applied
                      if (activeIndex === idx) {
                        pauseAllExcept(activeIndex);
                        const activePlayer = playersRef.current[activeIndex];
                        if (activePlayer) {
                          try {
                            if (typeof activePlayer.mute === "function") {
                              if (isMuted) activePlayer.mute(); else activePlayer.unmute && activePlayer.unmute();
                            } else if (typeof activePlayer.setMuted === "function") {
                              activePlayer.setMuted(!!isMuted);
                            }
                          } catch (e) { /* ignore */ }
                        } else {
                          const iframe = iframesRef.current[activeIndex];
                          if (iframe?.contentWindow) iframe.contentWindow.postMessage({ method: isMuted ? "mute" : "unmute" }, "*");
                        }
                      }
                    }}
                  />
                </div>
              </SwiperSlide>
            );
          })}

          <div className="mute-btn" onClick={toggleMute} style={{ zIndex: 20 }}>{isMuted ? "🔇" : "🔊"}</div>

          <div className="mobile-add-to-cart-bar">
            <button className="mobile-atc-btn"><span className="mobile-cart-icon">🛒</span>Add to Cart</button>
          </div>
        </Swiper>
      ) : (
        <div className="modal-card-left">
          <div className="swipe-catcher" style={{ height: "100vh", width: "100%" }}>
            <div className="mute-btn" onClick={toggleMute} style={{ zIndex: 20 }}>{isMuted ? "🔇" : "🔊"}</div>
            <div className="iframe-wrapper">
              <iframe
                id={`bunny-video-desktop-${items[thumbAt].id ?? thumbAt}`}
                ref={(el) => {
                  if (el) {
                    iframesRef.current[thumbAt] = el;
                    if (playerJsReady && !playersRef.current[thumbAt]) initPlayerForIframe(el, thumbAt, thumbAt);
                  }
                }}
                className="modal-card-left-iframe loading"
                src={items[thumbAt].videoUrl}
                key={items[thumbAt].id ?? thumbAt}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                allowFullScreen
                style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                onLoad={(e) => {
                  e.target.classList.add("loaded");
                  if (!playersRef.current[thumbAt] && playerJsReady) initPlayerForIframe(e.target, thumbAt, thumbAt);
                  pauseAllExcept(thumbAt);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="modal-card-right">
        {items[thumbAt]?.products?.map((product, idx) => (
          <div
            className="modal-card-right-product"
            style={{ position: "absolute", top: product?.position?.top ?? 0, left: product?.position?.left ?? 0 }}
            key={idx}
          >
            <h2>{product?.title}</h2>
            <h2>{product?.price}</h2>
          </div>
        ))}

        <div className="add-to-cart-bar">
          <button className="atc-btn"><span className="cart-icon">🛒</span>Add to Cart</button>
        </div>
      </div>

      <button className="close-button" onClick={handleCloseModal}>X</button>
    </div>
  );
}
