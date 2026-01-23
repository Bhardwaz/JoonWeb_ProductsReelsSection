import { useState } from "react";
import { useViewerStore } from "../../store/useViewerStore";
import { useResize } from "../../hooks/useResize";

const Card = ({ item, index, widgetType, playerJsReady }) => {
  const openModal = useViewerStore((state) => state.openModal);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback data
  const product = item?.mediaId?.productJSON || {};
  const productImage = product?.image?.url || product?.image;

  const { isMobile } = useResize()

  const calculateDiscount = (current, original) => {
    if (!original || !current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div
      onClick={() => {
        if (playerJsReady) {
          if (!isMobile) {
            openModal(index, "Carousel", widgetType)
            document.documentElement.classList.add('plugin-overflow-hidden');
            document.body.classList.add('plugin-overflow-hidden');
          }else {
            openModal(index, "Carousel", widgetType)
          }
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col gap-3 w-full"
    >
      <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100">

        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={isHovered ? item?.mediaId?.previewAnimationUrl : item?.mediaId?.thumbnailUrl}
          alt=""
        />

        {/* Dark Gradient (Subtle, only at bottom for depth) */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Floating Product Box (Centered at Bottom) */}
        {productImage && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-lg shadow-lg p-1 z-10 flex items-center justify-center">
            <img
              src={productImage}
              alt="mini-prod"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <div className={`absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <svg className="w-12 h-12 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>

      {/* --- 2. DETAILS SECTION (Below Media) --- */}
      <div className="text-center px-1">
        <h3 className="text-gray-700 text-[10px] font-bold md:text-[16px] leading-tight truncate">
          {product?.title || ""}
        </h3>

        {/* Price Row */}
        <div className="flex items-center justify-center gap-2 mt-1">
          {/* Current Price */}
          <span className="text-gray-900 font-bold">
            ₹{product.variants?.[0]?.sale_price || product.price}
          </span>

          {(product.originalPrice || product.variants?.[0]?.compare_at_price) && (
            <>
              <span className="text-gray-400 line-through decoration-gray-400">
                ₹{product.variants?.[0]?.compare_at_price || product.originalPrice}
              </span>
              <span className="text-green-500 text-xs font-bold">
                {calculateDiscount(
                  product.variants?.[0]?.sale_price || product.price,
                  product.variants?.[0]?.compare_at_price || product.originalPrice
                )}% off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;