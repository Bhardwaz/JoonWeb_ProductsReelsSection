import { useState, useEffect, useRef, useMemo, memo } from "react";
import { Plus, Minus, ShoppingCart, Check, ChevronLeft, ChevronRight, Star, Zap, Shield, Truck } from 'lucide-react';
import useAddToCart from "../../service/useAddToCart";
import { useViewerStore } from "../../store/useViewerStore";
import useAtcAnalytics from "../../service/useAtcAnalytics";
import toast from "react-hot-toast";
import ImageSwiper from './ImageSwiper';

// ... (Your existing parseVariantsStructure function) ...
const parseVariantsStructure = (product) => {
  if (!product || !product.variants) return { formattedOptions: [], variantMap: [] };
  const options = product.options || [];
  const optionNames = options.map(opt => opt.name);
  const availableOptions = {};
  optionNames.forEach(name => availableOptions[name] = new Set());
  const variantMap = product.variants.map(variant => {
    const values = variant.title.includes(' / ')
      ? variant.title.split(' / ').map(s => s.trim())
      : [variant.title];
    const optionsMap = {};
    values.forEach((val, index) => {
      const name = optionNames[index];
      if (name) {
        optionsMap[name] = val;
        availableOptions[name].add(val);
      }
    });
    const selectionKey = values.join('__');
    return { ...variant, selectionKey, optionsMap };
  });
  const formattedOptions = optionNames.map((name) => ({
    name,
    values: Array.from(availableOptions[name])
  }));
  return { formattedOptions, variantMap };
};

// ... (Your existing getSwatchColor function) ...
const getSwatchColor = (variantName) => {
  const name = variantName.toLowerCase();
  if (name.includes('black')) return '#171717';
  if (name.includes('white')) return '#FFFFFF';
  if (name.includes('red')) return '#EF4444';
  if (name.includes('blue')) return '#3B82F6';
  if (name.includes('green')) return '#22C55E';
  if (name.includes('pink')) return '#F472B6';
  if (name.includes('silver')) return '#C0C0C0';
  if (name.includes('gold')) return '#FFD700';
  if (name.includes('grey') || name.includes('gray')) return '#6B7280';
  if (name.includes('purple')) return '#A855F7';
  if (name.includes('navy')) return '#000080';
  if (name.includes('beige')) return '#F5F5DC';
  return null;
};

// ... (Your existing VariantJSX component) ...
const VariantJSX = ({ variant, modalSettings }) => {
  if (!variant) return null;
  const discountPercentage = variant?.price && variant?.sale_price
    ? Math.round(((variant.price - variant.sale_price) / variant.price) * 100)
    : 0;
  return (
    <div className="bg-white border-t border-gray-100 mt-2">
      <div className="flex items-baseline gap-3 mb-3">
        {variant?.sale_price && (
          <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
            ₹{variant.sale_price.toLocaleString()}
          </span>
        )}
        {variant?.price && variant.price !== variant.sale_price && (
          <span className="text-lg line-through text-gray-400 font-medium">
            ₹{variant.price.toLocaleString()}
          </span>
        )}
      </div>
      {variant?.discount > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold rounded-full shadow-md px-2 py-1"
          style={{ color: "#fff", backgroundColor: modalSettings?.highlight }}
          >
            {discountPercentage}% OFF
          </span>
          <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md px-2 py-1">
            Save ₹{variant.discount.toLocaleString()}
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 mt-1 mb-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${!variant?.is_trackable || variant?.inventory_quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          <div className={`w-2 h-2 rounded-full ${!variant?.is_trackable || variant?.inventory_quantity > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {!variant?.is_trackable ? (
            <span className="text-sm font-semibold">In Stock</span>
          ) : variant?.inventory_quantity > 0 ? (
            <span className="text-sm font-semibold">In Stock: {variant.inventory_quantity}</span>
          ) : (
            <span className="text-sm font-semibold">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductDetails = ({ product, isMobile, isOpen, onClose, style, modalSettings }) => {
  const productId = product?.id || product?._id
  const { formattedOptions, variantMap } = useMemo(() => parseVariantsStructure(product), [productId]);
  
  // Debug log
  // console.log(modalSettings, "modal settings");

  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentImages, setCurrentImages] = useState([]);
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { mutateAsync: addToCart, isPending: isAtcPending } = useAddToCart()
  const { mutate: atc } = useAtcAnalytics()
  const site = useViewerStore(state => state.site)

  useEffect(() => {
    if (product.variants && product.variants.length > 0 && Object.keys(selectedOptions).length === 0) {
      if (product.options && product.options.length > 0) {
        const firstVariant = product.variants[0];
        const parts = firstVariant.title.includes(' / ')
          ? firstVariant.title.split(' / ').map(s => s.trim())
          : [firstVariant.title];
        const defaults = {};
        product.options.forEach((opt, idx) => { defaults[opt.name] = parts[idx]; });
        setSelectedOptions(defaults);
      }
    }
  }, [productId, isMobile, product.variants, product.options]); // Cleaned deps

  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    if (!product.options || product.options.length === 0) {
      return product.variants[0];
    }
    if (!variantMap.length) return null;
    const currentKey = product.options.map(opt => selectedOptions[opt.name]).join('__');
    return variantMap.find(v => v.selectionKey === currentKey) || null;
  }, [selectedOptions, variantMap, product.options, product.variants, productId]);

  const increaseQuantity = () => {
    if (!activeVariant) return;
    if (addedToCart) setAddedToCart(false);
    if (!activeVariant.is_trackable) {
      setQuantity(prev => prev + 1);
      return;
    }
    if (activeVariant.inventory_quantity > 0 && quantity < activeVariant.inventory_quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuanitity = () => {
    if (addedToCart) setAddedToCart(false);
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  useEffect(() => {
    const getVariantImages = (variantId) => {
      if (!product?.images) return [];
      const variantImages = product.images.filter(img => {
        if (img.variant_id === variantId) return true;
        if (Array.isArray(img.variants) && img.variants.includes(String(variantId))) return true;
        return false;
      });
      if (variantImages.length === 0) return product.images.filter(img => img.level === "product" || !img.variant_id);
      return variantImages;
    };
    if (activeVariant?.variant_id) {
      const images = getVariantImages(activeVariant.variant_id);
      setCurrentImages(images.length > 0 ? images : product?.images || []);
    } else if (product?.images) {
      setCurrentImages(product.images);
    }
    setQuantity(1)
  }, [activeVariant, productId, product?.images]);

  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const hasVariants = formattedOptions.length > 0;

  const handleAddToCart = () => {
    if (!activeVariant?.id) return;
    const payload = {
      action: "add",
      id: activeVariant.id,
      quantity,
      properties: {}
    }
    toast.promise(
      addToCart({ payload, site }), {
      loading: 'Adding to cart...',
      success: 'Added successfully!',
      error: (err) => `Error: ${err.message}`,
    })
    atc(product?.id)
    setAddedToCart(true)
  }

  function handleGoToCheckout() {
    location.href = location.origin + "/cart"
  }
  
  console.log(modalSettings, 'in product component')

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-white to-gray-50/50 font-sans text-gray-900 relative jwshopewalreel" style={{zIndex: "100000"}}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 scrollbar-thin scrollbar-thumb-gray-300">

        {/* IMAGE SWIPER */}
        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 w-full h-[200px] md:h-[350px] flex items-center justify-center relative overflow-hidden p-6 group">
          <ImageSwiper 
            product={product} 
            images={currentImages} 
            interval={modalSettings?.autoPlayInterval} 
            isAutoPlay={modalSettings?.isAutoPlay} 
          />
        </div>

        <div className="p-2">
          {product?.title && (
              <h4 className="font-bold leading-snug bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-1">
                {product.title}
              </h4>
          )}

          {activeVariant ? (
            <VariantJSX variant={activeVariant} key={activeVariant.id} modalSettings={modalSettings} />
          ) : (
            <div className="py-4 px-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg">
              ⚠️ Unavailable Combination
            </div>
          )}

          <div className="mb-4">
            {/* 1. OPTIONS */}
            {hasVariants && formattedOptions.map((option) => {
              const isColor = ["color", "colour", "shade"].includes(option.name.toLowerCase());
              return (
                <div key={option.name} className="mb-3">
                  <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
                    <span className="font-semibold text-gray-900">{option.name}:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {option.values.map((value) => {
                      const isActive = selectedOptions[option.name] === value;
                      const swatchColor = isColor ? getSwatchColor(value) : null;
                      if (isColor && swatchColor) {
                        return (
                          <button
                            key={value}
                            onClick={() => handleOptionSelect(option.name, value)}
                            title={value}
                            className={`w-9 h-9 rounded-full border-2 border-gray-300 shadow-md transition-all duration-300 flex items-center justify-center relative hover:scale-110 hover:shadow-lg ${isActive ? "ring-3 ring-offset-2 ring-black scale-110 shadow-lg" : "hover:border-gray-500"}`}
                            style={{ backgroundColor: swatchColor }}
                          >
                            {isActive && (
                              <Check className={`w-4 h-4 ${['white', 'beige', 'silver'].some(c => value.toLowerCase().includes(c)) ? 'text-black' : 'text-white'}`} />
                            )}
                          </button>
                        );
                      }
                      return (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(option.name, value)}
                          className={`text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap border px-3 py-1 shadow-sm ${isActive
                            ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white border-gray-900 shadow-lg scale-[1.02]"
                            : "bg-white text-gray-600 border-gray-300 hover:border-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md"
                            }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 2. QUANTITY SELECTOR */}
            {activeVariant && (
              <div className="flex items-center gap-2 border border-gray-300 bg-white rounded-lg p-2 w-fit mt-4 shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={decreaseQuanitity}
                  disabled={quantity <= 1}
                  className="p-1.5 hover:bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Minus size={18} className="text-gray-700" />
                </button>
                <span className="font-bold w-6 text-center text-gray-900">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="p-1.5 hover:bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg transition-all"
                >
                  <Plus size={18} className="text-gray-700" />
                </button>
              </div>
            )}
          </div>

          {product?.body_html && (
            <div className="py-6 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2 p-2">
                Description
              </p>
              <div dangerouslySetInnerHTML={{ __html: product.body_html }} className="text-sm leading-relaxed text-gray-600 bg-gradient-to-b from-white to-gray-50 p-2 rounded-lg" />
            </div>
          )}
        </div>
      </div>

      <div className="p-2 sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 z-10">
        {(() => {
          const isOutOfStock = !activeVariant || (activeVariant.is_trackable && activeVariant.inventory_quantity <= 0);
          
          // Helper to check if we are using custom colors
          const hasCustomColors = modalSettings?.ctaColor && !isOutOfStock && !addedToCart;

          // Define dynamic styles
          const buttonStyle = hasCustomColors 
            ? { backgroundColor: modalSettings.ctaColor, color: modalSettings.ctaTextColor || '#fff' }
            : {};

          return (
            <button
              id="plugin-atc-button"
              onClick={() => addedToCart ? handleGoToCheckout() : handleAddToCart()}
              disabled={isOutOfStock}
              // If custom colors are used, we remove the default bg-gradient classes
              className={`relative w-full p-2 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-xl transition-all duration-500 overflow-hidden group 
                ${isOutOfStock
                  ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                  : addedToCart
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : hasCustomColors 
                      ? "hover:shadow-2xl hover:-translate-y-0.5" // Custom color active, just hover effects
                      : "bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:shadow-2xl hover:-translate-y-0.5" // Default gradient
                }`}
              style={buttonStyle}
            >
              {/* Animated background effect - Only show if NO custom color is set, to avoid clashing */}
              {!isOutOfStock && !addedToCart && !hasCustomColors && (
                <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              
              {/* Slight dark overlay on hover for Custom Colors to provide interaction feedback */}
              {!isOutOfStock && !addedToCart && hasCustomColors && (
                 <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              )}

              <div className="relative z-20 flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {activeVariant ? "Out of Stock" : "Unavailable"}
                  </span>
                ) : addedToCart ? (
                  <>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <Check className="w-5 h-5" />
                    </div>
                    <span> Checkout Now </span>
                  </>
                ) : (
                  <>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg"> { modalSettings?.ctaText || "Buy Now" } </div>
                    </div>
                  </>
                )}
              </div>

              {!isOutOfStock && !addedToCart && (
                <span className="absolute right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                  →
                </span>
              )}
            </button>
          );
        })()}
      </div>
    </div>
  );
};

export default memo(ProductDetails);