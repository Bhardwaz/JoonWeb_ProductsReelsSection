import { useEffect, useRef, useState } from "react";
import { useItems } from "../context/api";
import { useModal } from "../context/modal";
import { useThumb } from "../context/thumb";
import useReelPressControls from "../hooks/useReelPressControls";

const ModalCard = () => {
  const { handleCloseModal } = useModal()
  const { items } = useItems() || [];
  const { thumbAt, nextThumb, prevThumb } = useThumb();
  const [isMuted, setIsMuted] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    setIframeKey(k => k + 1);
  };

  const smoothScrollToCenter = () => {
    const element = document.querySelector(".modal-card-left");
    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });
  };

  const { handlers } = useReelPressControls({
    onNext: nextThumb,
    onPrev: prevThumb,
    cooldown: 400,
    moveThreshold: 25 
  });


  useEffect(() => {
    const handleKey = (e) => {

      if (["ArrowRight", "ArrowDown", "d", "s"].includes(e.key)) {
        smoothScrollToCenter();
        nextThumb();
      }
      else if (["ArrowLeft", "ArrowUp", "a", "w"].includes(e.key)) {
        smoothScrollToCenter();
        prevThumb();
      }
      else if (e.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [nextThumb, prevThumb, handleCloseModal]);


  if (!items || !items[thumbAt] || !items[thumbAt].videoUrl) {
    return null;
  }

  return (
    <div className="modal-card-container" onClick={(e) => e.stopPropagation()}>

      <div className="modal-card-left" {...handlers}>

        <div className="mute-btn" onClick={toggleMute}>
          {isMuted ? "🔇" : "🔊"}
        </div>

        {
          items[thumbAt] && <div className="iframe-wrapper">
            <iframe
              onLoad={(e) => e.target.classList.add("loaded")}
              className="modal-card-left-iframe loading"
              src={`${items?.[thumbAt]?.videoUrl}`}
              key={iframeKey}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        }
      </div>

      {
        <div className="modal-card-right">
          {
            items && items.length > 0 && (
              <div className="modal-card-right-products">
                {
                  items[thumbAt]?.products?.map((product, idx) => (
                    <div className="modal-card-right-product"
                      style={{
                        position: "absolute",
                        top: product?.position.top,
                        left: product?.position.left
                      }}
                      key={idx}>
                      <h2> {product?.title} </h2>
                      <h2> {product?.price} </h2>
                    </div>
                  ))
                }
              </div>)}

          <div className="add-to-cart-bar">
            <button className="atc-btn">
              <span className="cart-icon">🛒</span>
              Add to Cart
            </button>
          </div>

        </div>
      }
      <button className="close-button" onClick={handleCloseModal}>X</button>
    </div>
  );
}

export default ModalCard;