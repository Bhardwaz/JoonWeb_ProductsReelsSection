import { useMemo } from "react";
import { Plus, ShoppingBag, Sparkles, Zap } from 'lucide-react';

const VideoProductOverlay = ({ product, onOpenDetails, onAddToCart }) => {
  if (!product) return null;

  const priceDisplay = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;

    const prices = product.variants.map(v => v.sale_price || v.price);
    const minPrice = Math.min(...prices);

    return `₹${minPrice.toLocaleString()}`;
  }, [product]);

  const isOutOfStock = useMemo(() => {
    return product.variants.every(v => v.inventory_quantity === 0);
  }, [product]);

  const hasMultipleOptions = product.options.length > 0 && product.variants.length > 1;

  return (
    <div className="absolute bottom-20 left-4 right-4 z-30 animate-fade-in-up">
      {/* Floating Badge Above - VISUAL ENHANCEMENT */}
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
        <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-2xl flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Shop Now
          <Sparkles className="w-3 h-3" />
        </div>
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
          {/* Image Badge - VISUAL ENHANCEMENT */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
            <Zap className="w-2.5 h-2.5 text-white" fill="white" />
          </div>
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
            <p style={{ textAlign: "left" }} className="text-lg font-bold bg-gradient-to-r from-gray-900 to-black bg-clip-text text-transparent">
              {priceDisplay}
            </p>
            {!isOutOfStock && (
              <span className="text-[10px] font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-1.5 py-0.5 rounded-full ml-1">
                In Stock
              </span>
            )}
          </div>

          {/* Shipping Badge - VISUAL ENHANCEMENT */}
          <div className="mt-1 flex items-center gap-1">
            {/* <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
              🚚 Free Shipping
            </span> */}
            {hasMultipleOptions && (
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                {product.options.length} Colors
              </span>
            )}
          </div>
        </div>


        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-900 via-black to-gray-900 hover:from-black hover:to-gray-900 active:from-gray-900 active:via-black active:to-gray-900 backdrop-blur-md text-white border-2 border-white/40 rounded-full shadow-2xl transition-all duration-300 ease-out active:scale-90 group"
          aria-label="View Product Details"
        >
          {/* Button Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          
          {/* Icon Container */}
          <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
            <Plus size={18} strokeWidth={3} className="drop-shadow-sm" />
          </div>
          
          {/* Tooltip Hover Effect */}
          <div className="absolute -top-8 right-0 bg-gray-900 text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
            View Details
          </div>
        </button>

        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-gray-400/50 to-transparent rounded-full opacity-50" />
      </div>

      <div className="absolute -bottom-2 left-1/4 right-1/4 h-3 bg-gradient-to-t from-white/20 to-transparent blur-sm rounded-full -z-10" />
    </div>
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