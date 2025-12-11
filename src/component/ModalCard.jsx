import { useEffect, useRef, useState } from "react";
import { useItems } from "../context/api";
import { useModal } from "../context/modal";
import { useThumb } from "../context/thumb";
import "swiper/css";
import "swiper/css/pagination";
import { Mousewheel, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const MOBILE_BREAKPOINT = 768; // px, change if you want
const SWIPE_THRESHOLD = 50; // px

export default function ModalCard() {
  const { handleCloseModal } = useModal();
  const items = useItems()?.items || [];
  const { thumbAt = 0, nextThumb, prevThumb } = useThumb();

  const [isMuted, setIsMuted] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT);

  // keep responsive
  useEffect(() => {
    const mq = () => (window.innerWidth <= MOBILE_BREAKPOINT);
    const onResize = () => setIsMobile(mq());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // keyboard handlers (works on both modes)
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

  const toggleMute = () => {
    setIsMuted((p) => !p);
    setIframeKey((k) => k + 1);
  };

  // ------------------------
  // Desktop: single-slide with custom swipe detector
  // ------------------------
  const startYRef = useRef(null);
  const movedRef = useRef(false);

  const onStart = (e) => {
    movedRef.current = false;
    startYRef.current = e.touches ? e.touches[0].clientY : e.clientY;
  };
  const onMove = () => { movedRef.current = true; };
  const onEnd = (e) => {
    if (startYRef.current == null || !movedRef.current) { startYRef.current = null; movedRef.current = false; return; }
    const endY = (e.changedTouches ? e.changedTouches[0].clientY : e.clientY);
    const delta = startYRef.current - endY;
    startYRef.current = null; movedRef.current = false;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) nextThumb(); else prevThumb();
  };

  // ------------------------
  // Mobile: multi-slide Swiper that syncs to context
  // ------------------------
  const prevIndexRef = useRef(thumbAt);
  const onMobileSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex;
    const prevIndex = prevIndexRef.current;
    if (newIndex === prevIndex) return;
    if (newIndex > prevIndex) nextThumb();
    else if (newIndex < prevIndex) prevThumb();
    prevIndexRef.current = newIndex;
  };

  // Ensure we have an item to show
  if (!items || items.length === 0 || !items[thumbAt] || !items[thumbAt].videoUrl) return null;

  // ---------- RENDER ----------
  return (
    <div className="modal-card-container" onClick={(e) => e.stopPropagation()}>
      {isMobile ? (
        // MOBILE: map all items into Swiper slides so native vertical scroll works
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
          style={{ height: "100vh" }}
        >
          {items.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div style={{ position: "relative", height: "100vh", width: "100%" }}>
                <div className="mute-btn" onClick={toggleMute} style={{ zIndex: 20 }}>{isMuted ? "🔇" : "🔊"}</div>
                <div className="iframe-wrapper" style={{ width: "100%", height: "100%" }}>
                  <iframe
                    className="modal-card-left-iframe loading"
                    src={item.videoUrl}
                    key={iframeKey + "-" + idx}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                    onLoad={(e) => e.target.classList.add("loaded")}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        // DESKTOP: keep single slide, use our gesture detector to call nextThumb / prevThumb
        <Swiper
          direction="vertical"
          slidesPerView={1}
          spaceBetween={30}
          mousewheel
          pagination={{ clickable: true }}
          modules={[Mousewheel, Pagination]}
          className="modal-card-left mySwiper"
          allowTouchMove={false} // avoid conflict with our pointer handlers
          style={{ height: "100vh" }}
        >
          <SwiperSlide>
            <div
              className="swipe-catcher"
              onTouchStart={onStart}
              onTouchMove={onMove}
              onTouchEnd={onEnd}
              onPointerDown={onStart}
              onPointerMove={onMove}
              onPointerUp={onEnd}
              style={{ height: "100vh", width: "100%" }}
            >
              <div className="mute-btn" onClick={toggleMute} style={{ zIndex: 20 }}>{isMuted ? "🔇" : "🔊"}</div>

              <div className="iframe-wrapper" style={{ width: "100%", height: "100%" }}>
                <iframe
                  className="modal-card-left-iframe loading"
                  src={items[thumbAt].videoUrl}
                  key={iframeKey}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                  allowFullScreen
                  style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                  onLoad={(e) => e.target.classList.add("loaded")}
                />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      )}

      {/* right column (unchanged) */}
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
