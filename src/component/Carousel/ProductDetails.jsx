import { useState, useEffect, useRef, useMemo } from "react";
import { renderPaintedText } from "../common/style-settings";
import { Plus, Minus, ShoppingCart, Check, ChevronLeft, ChevronRight, Star, Zap, Shield, Truck } from 'lucide-react';
import useAddToCart from "../../service/useAddToCart";
import { useViewerStore } from "../../store/useViewerStore";
import useAtcAnalytics from "../../service/useAtcAnalytics";

// --- 1. HELPER: PARSE VARIANT DATA ---
const parseVariantsStructure = (product) => {
  if (!product || !product.variants) return { formattedOptions: [], variantMap: [] };

  // Safety check: Ensure options exists, otherwise default to empty
  const options = product.options || [];
  const optionNames = options.map(opt => opt.name);
  
  const availableOptions = {};
  optionNames.forEach(name => availableOptions[name] = new Set());

  const variantMap = product.variants.map(variant => {
    // Handle split carefully. If no options, title might be "Default Title"
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

// --- ENHANCED IMAGE SWIPER (KEPT VISUAL, FIXED ALIGNMENT) ---
const ImageSwiper = ({ images, activeIndex, onIndexChange }) => {
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isPaused && images?.length > 1) {
      intervalRef.current = setInterval(() => {
        onIndexChange((prev) => (prev + 1) % images.length);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, images?.length, onIndexChange]);

  const handlePrev = () => { setIsPaused(true); onIndexChange((prev) => (prev - 1 + images.length) % images.length); };
  const handleNext = () => { setIsPaused(true); onIndexChange((prev) => (prev + 1) % images.length); };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full group">
      {/* Main Image Container - Visual enhancements only */}
      <div className="relative w-full h-full">
        <img 
          src={images[activeIndex]?.url} 
          alt="Product" 
          className="w-full h-full object-contain transition-all duration-700 group-hover:scale-[1.02] drop-shadow-2xl" 
        />
        
        {/* Badge for Hot/New Product - VISUAL ONLY */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg">
            Hot Item
          </span>
        </div>
      </div>
      
      {images.length > 1 && (
        <>
          {/* Navigation Buttons - Visual enhancements, same alignment */}
          <button 
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-4 h-4 text-gray-800" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-4 h-4 text-gray-800" />
          </button>
          
          {/* Enhanced Dots Indicator - Visual only */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 backdrop-blur-sm bg-black/30 p-1 rounded-full">
            {images.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => { setIsPaused(true); onIndexChange(idx); }} 
                className={`transition-all duration-200 ${idx === activeIndex ? "w-6" : "w-2"}`}
              >
                <div className={`h-2 rounded-full ${idx === activeIndex ? "bg-white shadow-md" : "bg-white/50 hover:bg-white/80"}`} />
              </button>
            ))}
          </div>
          
          {/* Image Counter - Visual only */}
          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
            {activeIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

// --- ENHANCED VARIANT INFO (KEPT VISUAL, FIXED ALIGNMENT) ---
const VariantJSX = ({ variant }) => {
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
          <span className="px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-md">
            -{discountPercentage}% OFF
          </span>
          <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            Save ₹{variant.discount.toLocaleString()}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 mt-1">
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
        
        {/* Rating Badge - VISUAL ONLY */}
        <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 rounded-lg">
          <Star className="w-3 h-3 fill-amber-500" />
          <span className="text-xs font-bold">4.8</span>
          <span className="text-xs text-amber-600">(128)</span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT (KEPT VISUAL, FIXED ALIGNMENT) ---
const ProductDetails = ({ product }) => {
  const { formattedOptions, variantMap } = useMemo(() => parseVariantsStructure(product), [product]);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [imageIndex, setImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { mutate: addToCart } = useAddToCart()
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
  }, [product]);

  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return null;

    if (!product.options || product.options.length === 0) {
       return product.variants[0];
    }

    if (!variantMap.length) return null;
    const currentKey = product.options.map(opt => selectedOptions[opt.name]).join('__');
    return variantMap.find(v => v.selectionKey === currentKey) || null;
  }, [selectedOptions, variantMap, product.options, product.variants]);

  const increaseQuantity = () => {
    if (!activeVariant) return;

    if (!activeVariant.is_trackable) {
      setQuantity(prev => prev + 1);
      return;
    }

    if (activeVariant.inventory_quantity > 0 && quantity < activeVariant.inventory_quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decreaseQuanitity = () => {
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
      setImageIndex(0);
    } else if (product?.images) {
      setCurrentImages(product.images);
    }
    setQuantity(1)
  }, [activeVariant, product]);

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
    addToCart({ payload, site })
    atc(product?.id)
    
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <div className="flex flex-col h-full w-full bg-gradient-to-b from-white to-gray-50/50 font-sans text-gray-900 relative">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 scrollbar-thin scrollbar-thumb-gray-300">

        <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 w-full h-[200px] md:h-[350px] flex items-center justify-center relative overflow-hidden p-6 group">
          <ImageSwiper images={currentImages} activeIndex={imageIndex} onIndexChange={setImageIndex} />
        </div>

        <div className="px-2">

          {product?.title && (
            <div className="m-2">
              <h1 
                style={{ fontSize: "16px" }} 
                className="font-bold leading-snug bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-1"
              >
                {renderPaintedText(product.title)}
              </h1>
              <p className="text-xs text-gray-500">Premium Quality • 1-Year Warranty • Free Returns</p>
            </div>
          )}

          {activeVariant ? (
            <VariantJSX variant={activeVariant} key={activeVariant.id} />
          ) : (
            <div className="py-4 px-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg">
              ⚠️ Unavailable Combination
            </div>
          )}

          {/* Trust Badges - VISUAL ONLY, kept your original structure */}
          <div className="m-2">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Truck className="w-4 h-4 text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-gray-700">Free Shipping</span>
              </div>
              <div className="flex-1 flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Shield className="w-4 h-4 text-green-600 mb-1" />
                <span className="text-xs font-semibold text-gray-700">1-Year Warranty</span>
              </div>
              <div className="flex-1 flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Zap className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-xs font-semibold text-gray-700">Fast Delivery</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            
            {/* 1. OPTIONS */}
            {hasVariants && formattedOptions.map((option) => {
                const isColor = ["color", "colour", "shade"].includes(option.name.toLowerCase());
                return (
                    <div key={option.name} className="mb-3">
                      <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
                        <span className="font-semibold text-gray-900">{option.name}:</span>
                        <span className="text-gray-900 font-bold bg-gradient-to-r from-gray-100 to-gray-200 px-2 py-1 rounded-md border border-gray-200">
                          {selectedOptions[option.name]}
                        </span>
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
                                className={`w-9 h-9 rounded-full border-2 border-gray-300 shadow-md transition-all duration-300 flex items-center justify-center relative hover:scale-110 hover:shadow-lg ${
                                  isActive ? "ring-3 ring-offset-2 ring-black scale-110 shadow-lg" : "hover:border-gray-500"
                                }`}
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
                              className={`text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap border px-4 py-2 shadow-sm ${
                                isActive 
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
              <p className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full"></span>
                Description
              </p>
              <div className="text-sm leading-relaxed text-gray-600 bg-gradient-to-b from-white to-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm whitespace-pre-line">
                {product.body_html}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "28px 12px" }} className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 z-10">
        {(() => {
          const isOutOfStock = !activeVariant || (activeVariant.is_trackable && activeVariant.inventory_quantity <= 0);
          return (
            <button 
              onClick={() => handleAddToCart()} 
              disabled={isOutOfStock} 
              className={`relative w-full py-3 px-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-xl transition-all duration-500 overflow-hidden group ${
                isOutOfStock 
                  ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 cursor-not-allowed border border-gray-300" 
                  : addedToCart
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    : "bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:shadow-2xl hover:-translate-y-0.5"
              }`}
            >
              {/* Animated background effect */}
              {!isOutOfStock && !addedToCart && (
                <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <div className="bg-white/20 p-1.5 rounded-full">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg">Add to Cart • ₹{activeVariant?.sale_price ? (activeVariant.sale_price * quantity).toLocaleString() : '0'}</div>
                      <div className="text-xs font-normal opacity-90">Free shipping & 30-day returns</div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Arrow indicator on hover */}
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

export default ProductDetails;