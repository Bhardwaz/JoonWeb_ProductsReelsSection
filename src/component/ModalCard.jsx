import { useEffect, useRef, useState } from "react";
import { useItems } from "../context/api";
import { useModal } from "../context/modal";
import { useThumb } from "../context/thumb";
import "swiper/css";
import "swiper/css/pagination";
import { Mousewheel, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const MOBILE_BREAKPOINT = 768;
const SWIPE_THRESHOLD = 50;

export default function ModalCard() {
  const { handleCloseModal } = useModal();
  const items = useItems()?.items || [];
  const { thumbAt, nextThumb, prevThumb } = useThumb();

  const [isMuted, setIsMuted] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT);


  useEffect(() => {
    const mq = () => (window.innerWidth <= MOBILE_BREAKPOINT);
    const onResize = () => setIsMobile(mq());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // keyboard handlers
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

  const scrollTimeoutRef = useRef(null);

  const prevIndexRef = useRef(thumbAt);
  const onMobileSlideChange = (swiper) => {
    const newIndex = swiper.activeIndex;
    const prevIndex = prevIndexRef.current;
    if (newIndex === prevIndex) return;
    if (newIndex > prevIndex) nextThumb();
    else if (newIndex < prevIndex) prevThumb();
    prevIndexRef.current = newIndex;
  };

  if (!items || items.length === 0 || !items[thumbAt] || !items[thumbAt].videoUrl) return null;

  return (
    <div className="modal-card-container">
      {isMobile ? (

        <Swiper
          direction="vertical"
          slidesPerView={1}
          spaceBetween={30}
          mousewheel={true}
          pagination={{ clickable: true }}
          modules={[Mousewheel, Pagination]}
          className="modal-card-left mySwiper"
          initialSlide={thumbAt}
          onSlideChange={onMobileSlideChange}
        >
          {items.map((item, idx) => (
            <SwiperSlide key={idx}>
              <div className="iframe-wrapper"> 
                <div className="iframe-block-overlay" attr="overlay"> </div>
                  <iframe
                    className="modal-card-left-iframe loading"
                    src={item.videoUrl}
                    key={iframeKey + "-" + idx}
                    loop={true}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: 0, display: "block" }}
                    onLoad={(e) => e.target.classList.add("loaded")}
                  />
               
              </div>
            </SwiperSlide>
          ))}
          <div className="mute-btn" onClick={toggleMute} style={{ zIndex: 20 }}>{isMuted ? "🔇" : "🔊"}</div>
          <div className="mobile-add-to-cart-bar">
            <button className="mobile-atc-btn"><span className="mobile-cart-icon">🛒</span>Add to Cart</button>
          </div>
        </Swiper>
      ) : (
        // DESKTOP
        <div
          className="modal-card-left"
        >
          <div
            className="swipe-catcher"
            style={{ height: "100vh", width: "100%" }}
          >
            <div className="mute-btn" onClick={toggleMute} style={{ zIndex: 20 }}>{isMuted ? "🔇" : "🔊"}</div>

            <div className="iframe-wrapper">
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