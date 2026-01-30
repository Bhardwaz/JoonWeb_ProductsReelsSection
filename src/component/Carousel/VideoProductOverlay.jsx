import { useMemo } from "react";
import { Plus, ShoppingBag, Sparkles, Zap } from 'lucide-react';

const VideoProductOverlay = ({ product, onOpenDetails, onAddToCart }) => {
  if (!product) return null;

  const isOutOfStock = useMemo(() => {
    return product.variants.every(v => v.inventory_quantity === 0);
  }, [product]);

  const hasMultipleOptions = product.options.length > 0 && product.variants.length > 1;

  const calculateDiscount = (current, original) => {
    if (!original || !current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <>
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
        {/* <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-2xl flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Shop Now
          <Sparkles className="w-3 h-3" />
        </div> */}
      </div>

      {/* Main Container - VISUAL ENHANCEMENTS */}
      <div className="relative flex flex-row items-center justify-center gap-2 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-white/80 shadow-black/10">

        {/* Glow Effect - VISUAL ENHANCEMENT */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl -z-10" />

        <div className="relative w-8 flex-shrink-0 bg-gradient-to-br from-gray-100 to-white rounded-xl overflow-hidden border-2 border-white shadow-lg" style={{ width: "75px" }}>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
          <img
            src={product.image?.url || "https://placehold.co/100"}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />

        </div>

        {/* Product Info - VISUAL ENHANCEMENTS */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h3
            style={{ textAlign: "left" }}
            className="text-xs font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent truncate pr-2 drop-shadow-sm"
          >
            {product.title}
          </h3>

          {/* Price Display with Visual Enhancement */}
          <div className="flex items-baseline gap-1 mt-0.5">
            <div className="flex flex-row gap-2 justify-center items-center">

              <p style={{ textAlign: "left" }} className="text-lg font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
                {product.variants?.[0]?.sale_price || product.price}
              </p>

              <p className="text-lg font-medium text-gray-400 line-through">
                { product.variants?.[0]?.compare_at_price || product.originalPrice}
              </p>

              <span className="text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-md px-2 py-1">
                {calculateDiscount(
                  product.variants?.[0]?.sale_price || product.price,
                  product.variants?.[0]?.compare_at_price || product.originalPrice
                )}% off
              </span>

            </div>

            {!isOutOfStock && (
              <span className="text-[10px] font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-1.5 py-0.5 rounded-full ml-1">
                In Stock
              </span>
            )}
          </div>

          {/* Shipping Badge - VISUAL ENHANCEMENT */}
          {/* <div className="mt-1 flex items-center gap-1"> */}
          {/* <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              🚚 Free Shipping
            </span> */}
          {/* {hasMultipleOptions && (
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                {product.options.length} Colors
              </span>
            )} */}
          {/* </div> */}
        </div>


        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="relative flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 text-white font-semibold text-xs rounded-lg shadow-lg transition-all duration-200 ease-out active:scale-95 group overflow-hidden border border-white/20"
          aria-label="View Product Details"
        >
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

          {/* Button text */}
          <div className="relative z-10 flex items-center gap-1.5">
            <span>Buy Now</span>
            <svg
              className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-gray-400/50 to-transparent rounded-full opacity-50" />
      </div>

      <div className="absolute -bottom-2 left-1/4 right-1/4 h-3 bg-gradient-to-t from-white/20 to-transparent blur-sm rounded-full -z-10" />
    </>
  );
};

// Add custom animation to Tailwind config (you can add this to your tailwind.config.js)
// In your CSS file, you can add:
// @keyframes fade-in-up {
//   0% {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   100% {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
// .animate-fade-in-up {
//   animation: fade-in-up 0.5s ease-out;
// }

export default VideoProductOverlay;