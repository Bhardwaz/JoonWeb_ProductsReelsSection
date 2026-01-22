import { useState, useEffect, useRef, useMemo } from "react";
import { X, Plus, Minus, ShoppingBag, Check, Sparkles, Star, Shield, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { useViewerStore } from "../../store/useViewerStore";
import useAddToCart from "../../service/useAddToCart";
import useAtcAnalytics from "../../service/useAtcAnalytics";
import { Toaster } from "react-hot-toast";

// --- 1. HELPER: Parse Variants (Synced with ProductDetails) ---
const parseVariantsStructure = (product) => {
  if (!product || !product.variants || !product.options) return { formattedOptions: [], variantMap: [] };

  const optionNames = product.options.map(opt => opt.name);
  const availableOptions = {};
  optionNames.forEach(name => availableOptions[name] = new Set());

  const variantMap = product.variants.map(variant => {
    const values = variant.title.split(' / ').map(s => s.trim());
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

// --- 2. HELPER: Color Hex Codes ---
const getSwatchColor = (variantName) => {
  const name = variantName.toLowerCase();
  if (name.includes('black')) return '#171717';
  if (name.includes('white')) return '#FFFFFF';
  if (name.includes('red')) return '#EF4444';
  if (name.includes('blue')) return '#3B82F6';
  if (name.includes('green')) return '#22C55E';
  if (name.includes('pink')) return '#F472B6';
  if (name.includes('gold')) return '#FFD700';
  if (name.includes('silver')) return '#C0C0C0';
  if (name.includes('beige')) return '#F5F5DC';
  if (name.includes('grey') || name.includes('gray')) return '#6B7280';
  if (name.includes('purple')) return '#A855F7';
  if (name.includes('navy')) return '#000080';
  return null;
};

// --- 3. SUB-COMPONENT: Enhanced Mobile Image Swiper ---
const MobileImageSwiper = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
      setActiveIndex(index);
    }
  };

  const handlePrev = () => {
    setIsPaused(true);
    if (scrollRef.current && images.length > 1) {
      const newIndex = (activeIndex - 1 + images.length) % images.length;
      scrollRef.current.scrollTo({
        left: newIndex * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleNext = () => {
    setIsPaused(true);
    if (scrollRef.current && images.length > 1) {
      const newIndex = (activeIndex + 1) % images.length;
      scrollRef.current.scrollTo({
        left: newIndex * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (!isPaused && images.length > 1) {
      const interval = setInterval(() => {
        const nextIndex = (activeIndex + 1) % images.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            left: nextIndex * scrollRef.current.clientWidth,
            behavior: 'smooth'
          });
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeIndex, images.length, isPaused]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 via-white to-gray-50 mb-4 rounded-2xl overflow-hidden shadow-xl group">
      {/* Hot Item Badge */}
      <div className="absolute top-3 left-3 z-20">
        <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-xl flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Hot Item
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-8">
            <img src={img.url} alt="Product" className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105" />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-2xl backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 hover:scale-110 z-10"
          >
            <ChevronLeft className="w-4 h-4 text-gray-800" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-2xl backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 hover:scale-110 z-10"
          >
            <ChevronRight className="w-4 h-4 text-gray-800" />
          </button>
        </>
      )}

      {/* Enhanced Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
          <div className="backdrop-blur-sm bg-black/30 px-3 py-2 rounded-full">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`inline-block mx-0.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-3 h-3 bg-white shadow-lg" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute top-3 right-3 bg-black/80 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm z-20">
        {activeIndex + 1}/{images.length}
      </div>
    </div>
  );
};

// --- 4. SUB-COMPONENT: Enhanced Variant Info ---
const VariantInfo = ({ variant }) => {
  if (!variant) return (
    <div className="py-4 px-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl mb-4">
      ⚠️ Unavailable Combination
    </div>
  );
  
  const discountPercentage = variant?.price && variant?.sale_price 
    ? Math.round(((variant.price - variant.sale_price) / variant.price) * 100)
    : 0;

  return (
    <div className="mt-1 mb-6 space-y-4">
      {/* Price Section */}
      <div className="flex items-baseline gap-3">
        {variant?.sale_price && (
          <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">
            ₹{variant.sale_price.toLocaleString()}
          </span>
        )}
        {variant?.price && variant.price !== variant.sale_price && (
          <span className="text-base line-through text-gray-400 font-medium">
            ₹{variant.price.toLocaleString()}
          </span>
        )}
      </div>

      {/* Discount Badges */}
      {variant?.discount > 0 && (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-md">
            -{discountPercentage}% OFF
          </span>
          <span className="text-sm font-semibold text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-1 rounded-lg border border-emerald-200">
            Save ₹{variant.discount.toLocaleString()}
          </span>
        </div>
      )}

      {/* Stock Status with Visual Indicators */}
      <div className="flex items-center gap-3">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${!variant?.is_trackable || variant?.inventory_quantity > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <div className={`w-2 h-2 rounded-full ${!variant?.is_trackable || variant?.inventory_quantity > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {!variant?.is_trackable ? (
            <span className="text-sm font-semibold">In Stock • Ready to Ship</span>
          ) : variant?.inventory_quantity > 0 ? (
            <span className="text-sm font-semibold">In Stock: {variant.inventory_quantity} units</span>
          ) : (
            <span className="text-sm font-semibold">Out of stock</span>
          )}
        </div>
        
        {/* Rating Badge */}
        {/* <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
          <Star className="w-4 h-4 fill-amber-500" />
          <span className="text-sm font-bold">4.8</span>
          <span className="text-xs text-amber-600">(128)</span>
        </div> */}
      </div>
    </div>
  );
};

// --- 5. MAIN COMPONENT ---
const ProductBottomSheet = ({ isOpen, onClose, product, style }) => {
  // --- Data Parsing ---
  const { formattedOptions, variantMap } = useMemo(() => parseVariantsStructure(product), [product]);
  
  // --- State ---
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentImages, setCurrentImages] = useState(product?.images || []);
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // --- Hooks ---
  const site = useViewerStore(state => state.site);
  const { mutate: addToCart } = useAddToCart();
  const { mutate: atc } = useAtcAnalytics();

  // --- Animation Effect ---
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to trigger animation after DOM render
      setTimeout(() => {
        setShouldAnimate(true);
      }, 10);
    } else {
      // Trigger closing animation
      setShouldAnimate(false);
      // Delay hiding component until animation completes
      const timer = setTimeout(() => setIsVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // default selection
  useEffect(() => {
    if (product?.variants?.length && !Object.keys(selectedOptions).length) {
      const parts = product.variants[0].title.split(' / ').map(s => s.trim());
      const defaults = {};
      product.options.forEach((opt, idx) => { defaults[opt.name] = parts[idx]; });
      setSelectedOptions(defaults);
    }
  }, [product]);

  // --- Active Variant Logic ---
  const activeVariant = useMemo(() => {
    const key = product?.options.map(opt => selectedOptions[opt.name]).join('__');
    return variantMap.find(v => v.selectionKey === key);
  }, [selectedOptions, variantMap, product]);

  useEffect(() => {
    if (activeVariant?.variant_id) {
      const filtered = product.images.filter(img =>
        img.variant_id === activeVariant.variant_id ||
        (img.variants && img.variants.includes(String(activeVariant.variant_id)))
      );
      setCurrentImages(filtered.length ? filtered : product.images);
    }
    setQuantity(1);
  }, [activeVariant, product]);

  const handleSelect = (name, val) => setSelectedOptions(prev => ({ ...prev, [name]: val }));

  // --- Quantity Logic ---
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

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCartFn = () => {
    if (!activeVariant?.id) return;

    const payload = {
      action: "add",
      id: activeVariant.id,
      quantity,
      properties: {}
    };

    addToCart({ payload, site });
    atc(product?.id);
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (!isOpen && !isVisible) return null;

  const hasVariants = formattedOptions.length > 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center" style={style}>
      
      <Toaster position="top-center" />

      {/* 1. BACKDROP WITH ANIMATION */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          shouldAnimate 
            ? "opacity-100 backdrop-blur-sm" 
            : "opacity-0 backdrop-blur-0"
        }`}
        onClick={onClose}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-amber-900/10 transition-opacity duration-700 ${
          shouldAnimate ? "opacity-100" : "opacity-0"
        }`} />
        
        {/* Animated glow particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/4 left-1/4 w-1 h-1 bg-blue-400/30 rounded-full transition-all duration-1000 ${
            shouldAnimate ? "opacity-100 animate-float" : "opacity-0"
          }`} style={{ animationDelay: "200ms" }} />
          <div className={`absolute top-1/3 right-1/4 w-1 h-1 bg-pink-400/30 rounded-full transition-all duration-1000 ${
            shouldAnimate ? "opacity-100 animate-float" : "opacity-0"
          }`} style={{ animationDelay: "400ms" }} />
        </div>
      </div>

      {/* 2. THE SHEET WITH ENHANCED ANIMATION */}
      <div
        className={`
          relative w-full max-w-md bg-gradient-to-b from-white via-white to-gray-50/50 rounded-t-3xl shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col
          transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${shouldAnimate ? "translate-y-0" : "translate-y-full"}
          border-t border-x border-white/50
        `}
        style={{ 
          height: "85vh", 
          maxHeight: "85vh",
          transform: shouldAnimate ? "translateY(0)" : "translateY(100%)",
          opacity: shouldAnimate ? 1 : 0
        }}
      >
        {/* Top glow effect */}
        <div className={`absolute top-0 left-1/4 right-1/4 h-3 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-lg transition-all duration-500 ${
          shouldAnimate ? "opacity-100 -translate-y-1/2" : "opacity-0 -translate-y-full"
        }`} />
        
        {/* HEADER WITH ENHANCED ANIMATION */}
        <div className="flex-shrink-0 h-14 flex justify-center items-center relative z-30 bg-gradient-to-b from-white to-white/95 backdrop-blur-sm border-b border-gray-100/50">
          {/* Drag handle with animation */}
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 transition-all duration-500 ${
            shouldAnimate ? "opacity-100" : "opacity-0"
          }`}>
            <div className="w-16 h-1.5 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full shadow-inner" />
          </div>
          
          {/* Close button with entry animation */}
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              setShouldAnimate(false);
              setTimeout(() => onClose(), 300);
            }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-300 group ${
              shouldAnimate 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-50"
            }`}
            style={{ transitionDelay: "100ms" }}
          >
            <X size={20} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
          
          {/* Title in header with animation */}
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
            shouldAnimate ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`} style={{ transitionDelay: "150ms" }}>
            <span className="text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Product Details
            </span>
          </div>
        </div>

        {/* SCROLLABLE CONTENT with staggered animation */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden pb-36 px-5 scrollbar-thin scrollbar-thumb-gray-300 transition-opacity duration-300 ${
          shouldAnimate ? "opacity-100" : "opacity-0"
        }`}>
          
          {/* Trust Badges with staggered animation */}
          <div className={`mb-4 mt-2 transition-all duration-400 ${
            shouldAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`} style={{ transitionDelay: "200ms" }}>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col items-center p-3 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm">
                <Truck className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-xs font-semibold text-gray-700">Free Shipping</span>
              </div>
              <div className="flex-1 flex flex-col items-center p-3 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm">
                <Shield className="w-5 h-5 text-green-600 mb-1" />
                <span className="text-xs font-semibold text-gray-700">1-Year Warranty</span>
              </div>
              <div className="flex-1 flex flex-col items-center p-3 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-100 shadow-sm">
                <Check className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-xs font-semibold text-gray-700">Free Returns</span>
              </div>
            </div>
          </div>

          {/* Image Swiper with animation */}
          <div className={`transition-all duration-500 ${
            shouldAnimate ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`} style={{ transitionDelay: "250ms" }}>
            <MobileImageSwiper images={currentImages} />
          </div>

          {/* Title with gradient and animation */}
          <div className={`transition-all duration-400 ${
            shouldAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`} style={{ transitionDelay: "300ms" }}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-snug mb-2">
              {product?.title}
            </h1>
          </div>
          
          {/* Price & Info with animation */}
          <div className={`transition-all duration-400 ${
            shouldAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`} style={{ transitionDelay: "350ms" }}>
            <VariantInfo variant={activeVariant} />
          </div>

          {/* Variants Section with staggered animation */}
          {hasVariants && (
            <div className={`mb-6 bg-gradient-to-b from-white to-gray-50/30 p-4 rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 ${
              shouldAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`} style={{ transitionDelay: "400ms" }}>
                {formattedOptions.map(option => {
                    const isColor = ["color", "colour", "shade"].includes(option.name.toLowerCase());
                    
                    return (
                        <div key={option.name} className="mb-5">
                            <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-3">
                                <span className="font-semibold text-gray-900 uppercase tracking-wide">{option.name}</span>
                                <span className="text-gray-900 font-bold bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 rounded-lg border border-gray-200">
                                    {selectedOptions[option.name]}
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {option.values.map((value, idx) => {
                                    const isActive = selectedOptions[option.name] === value;
                                    const colorHex = isColor ? getSwatchColor(value) : null;

                                    if (isColor && colorHex) {
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => handleSelect(option.name, value)}
                                                className={`w-10 h-10 rounded-xl border-2 border-gray-300 shadow-md flex items-center justify-center relative transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                                                    isActive ? 'ring-3 ring-offset-2 ring-black scale-110 shadow-xl' : 'hover:border-gray-400'
                                                }`}
                                                style={{ 
                                                  backgroundColor: colorHex,
                                                  animation: shouldAnimate ? `fadeInUp 0.5s ease-out ${450 + (idx * 50)}ms both` : 'none'
                                                }}
                                            >
                                                {isActive && (
                                                  <Check className={`absolute w-5 h-5 ${['white', 'beige', 'silver', 'yellow'].some(c => value.toLowerCase().includes(c)) ? 'text-black' : 'text-white'}`} />
                                                )}
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            key={value}
                                            onClick={() => handleSelect(option.name, value)}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-300 hover:scale-[1.02] ${
                                                isActive 
                                                    ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white border-gray-900 shadow-lg scale-[1.02]' 
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md'
                                            }`}
                                            style={{ 
                                              animation: shouldAnimate ? `fadeInUp 0.5s ease-out ${450 + (idx * 50)}ms both` : 'none'
                                            }}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* ENHANCED QUANTITY SELECTOR with animation */}
                <div className={`mt-1 pt-1 border-t border-gray-100 transition-all duration-500 ${
                  shouldAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`} style={{ transitionDelay: "550ms" }}>
                    <p className="text-sm font-semibold text-gray-900 mb-3">Quantity</p>
                    <div className="flex items-center gap-1 bg-gradient-to-b from-white to-gray-50 border border-gray-300 rounded-xl p-1 w-fit shadow-sm hover:shadow-md transition-shadow">
                        <button
                            onClick={decreaseQuantity}
                            disabled={quantity <= 1}
                            className="p-2.5 hover:bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            <Minus className="w-5 h-5 text-gray-700" />
                        </button>
                        <span className="font-bold text-lg w-8 text-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg py-2 transition-all duration-200">{quantity}</span>
                        <button
                            onClick={increaseQuantity}
                            disabled={activeVariant?.is_trackable && quantity >= activeVariant?.inventory_quantity}
                            className="p-2.5 hover:bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            <Plus className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </div>
          )}

          {/* Description with animation */}
          <div className={`mt-6 border-t border-gray-100 pt-6 transition-all duration-500 ${
            shouldAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`} style={{ transitionDelay: "600ms" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-gradient-to-r from-gray-900 to-gray-700 rounded-full"></span>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Product Details</h3>
            </div>
            <div className="bg-gradient-to-b from-white to-gray-50/30 p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product?.body_html}</p>
            </div>
          </div>
        </div>

        {/* ENHANCED STICKY FOOTER with animation */}
        <StickyFooter 
          activeVariant={activeVariant} 
          handleAddToCart={handleAddToCartFn}
          addedToCart={addedToCart}
          shouldAnimate={shouldAnimate}
        />
      </div>

      {/* Add CSS animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(120deg);
          }
          66% {
            transform: translateY(5px) rotate(240deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
      `}</style>
    </div>
  );
};

const StickyFooter = ({ activeVariant, handleAddToCart, addedToCart, shouldAnimate }) => {
  const isOOS = !activeVariant || (activeVariant.is_trackable && activeVariant.inventory_quantity === 0);
  const totalPrice = activeVariant?.sale_price ? (activeVariant.sale_price * 1).toLocaleString() : '0';

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-gray-200/50 p-4 pb-8 z-30 shadow-[0_-20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 ${
      shouldAnimate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
    }`} style={{ transitionDelay: "650ms" }}>
      <button
        onClick={handleAddToCart}
        disabled={isOOS}
        className={`relative w-full rounded-2xl font-bold text-base py-4 flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden group ${
          isOOS 
            ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 cursor-not-allowed border border-gray-300" 
            : addedToCart
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl scale-[1.02]"
              : "bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white shadow-2xl hover:shadow-3xl hover:-translate-y-0.5"
        }`}
      >
        {/* Animated background effect */}
        {!isOOS && !addedToCart && (
          <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        <div className="relative z-20 flex items-center gap-3">
          {isOOS ? (
            <span className="inline-flex items-center gap-2 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Out of Stock
            </span>
          ) : addedToCart ? (
            <>
              <div className="bg-white/20 p-2 rounded-full">
                <Check className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">Added to Cart!</div>
                <div className="text-sm font-normal opacity-90">Tap to view cart</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/20 p-2 rounded-full">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">Add to Cart • ₹{totalPrice}</div>
                <div className="text-sm font-normal opacity-90">Free shipping • 30-day returns</div>
              </div>
            </>
          )}
        </div>
        
        {/* Arrow indicator on hover */}
        {!isOOS && !addedToCart && (
          <span className="absolute right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 text-2xl">
            →
          </span>
        )}
      </button>
    </div>
  );
};

export default ProductBottomSheet;