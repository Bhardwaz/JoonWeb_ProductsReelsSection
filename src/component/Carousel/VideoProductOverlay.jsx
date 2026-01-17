import { useMemo } from "react";
import { Plus } from 'lucide-react';

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
    <div className="absolute bottom-20 left-4 right-4 z-20">

      <div className="flex flex-row items-center justify-center gap-2 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50">

        <div className="w-8 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200" style={{ width: "75px" }}>
          <img
            src={product.image?.url || "https://placehold.co/100"}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <h3 style={{ textAlign: "left" }} className="text-xs font-bold text-gray-900 truncate pr-2">
            {product.title}
          </h3>
          <p style={{ textAlign: "left" }} className="text-lg font-semibold text-gray-600">
            {priceDisplay}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
              onOpenDetails();
          }}
          className=" flex items-center justify-center w-7 h-7 bg-black/50 hover:bg-black/70 active:bg-black/80 backdrop-blur-md text-white border border-white/30 rounded-full shadow-lg transition-all duration-200 ease-out active:scale-90"
          aria-label="View Product Details"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>


      </div>

    </div>
  );
};

export default VideoProductOverlay;