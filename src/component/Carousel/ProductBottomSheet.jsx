import { useState, useEffect, useRef, useMemo } from "react";
import { Heart, X } from "lucide-react";

// --- 1. HELPER: Parse Variants ---
const parseVariantsStructure = (product) => {
  if (!product || !product.variants || !product.options) return { formattedOptions: [], variantMap: [] };

  const optionNames = product.options.map(opt => opt.name);
  const availableOptions = {};
  optionNames.forEach(name => availableOptions[name] = new Set());

  const variantMap = product.variants.map(variant => {
    const values = variant.title.split(' / ').map(s => s.trim());
    const selectionKey = values.join('__');
    values.forEach((val, index) => {
      if (optionNames[index]) availableOptions[optionNames[index]].add(val);
    });
    return { ...variant, selectionKey };
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
  if (name.includes('green')) return '#10B981';
  if (name.includes('pink')) return '#EC4899';
  if (name.includes('gold')) return '#F59E0B';
  if (name.includes('silver')) return '#D1D5DB';
  if (name.includes('beige')) return '#F5F5DC';
  return null;
};

// --- 3. SUB-COMPONENT: Mobile Image Swiper ---
const MobileImageSwiper = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const nextIndex = (activeIndex + 1) % images.length;
        scrollRef.current.scrollTo({
          left: nextIndex * scrollRef.current.clientWidth,
          behavior: 'smooth'
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeIndex, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-[300px] aspect-square bg-gray-50 mb-4">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center p-6">
            <img src={img.url} alt="Product" className="w-full h-full object-contain drop-shadow-sm" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
        {images.map((_, idx) => (
          <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-6 bg-black" : "w-1.5 bg-gray-300"}`} />
        ))}
      </div>
    </div>
  );
};

// --- 4. MAIN COMPONENT ---
const ProductBottomSheet = ({ isOpen, onClose, product, style }) => {
  // --- Logic Hooks ---
  const { formattedOptions, variantMap } = useMemo(() => parseVariantsStructure(product), [product]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentImages, setCurrentImages] = useState(product?.images || []);
  const [isVisible, setIsVisible] = useState(false); // For animation

  // Animation Effect
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Default Selection
  useEffect(() => {
    if (product?.variants?.length && !Object.keys(selectedOptions).length) {
      const parts = product.variants[0].title.split(' / ').map(s => s.trim());
      const defaults = {};
      product.options.forEach((opt, idx) => { defaults[opt.name] = parts[idx]; });
      setSelectedOptions(defaults);
    }
  }, [product]);

  // Active Variant & Images
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
  }, [activeVariant, product]);

  const handleSelect = (name, val) => setSelectedOptions(prev => ({ ...prev, [name]: val }));

  // If not open and animation done, don't render
  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-end justify-center" 
      style={style} //
    >
      
      {/* 1. BACKDROP (Darken background) */}
      <div 
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ease-out ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* 2. THE SHEET (Slide Up Animation) */}
      <div 
        className={`
          relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl overflow-hidden flex flex-col
          transition-transform duration-300 ease-out transform
          ${isOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ height: "85vh" }}
      >
        
        {/* --- SHEET HEADER --- */}
        <div className="flex-shrink-0 h-8 flex justify-center items-center cursor-pointer" onClick={onClose}>
          
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mt-2" />
    
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="absolute right-4 top-4 p-2 bg-black rounded-full text-white hover:bg-black active:scale-95 transition-all z-50"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-20 px-2 scrollbar-hide">
          
          <MobileImageSwiper images={currentImages} />

          <div className="mb-6">
            <h1 style={{fontSize: "16px" }} className="font-bold text-gray-900 leading-snug mb-2 font-display">{product?.title}</h1>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "24px" }} className="font-bold text-gray-900">
                ₹{activeVariant?.sale_price?.toLocaleString() || product?.variants[0]?.price}
              </span>
              {activeVariant?.discount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                  -₹{activeVariant.discount} OFF
                </span>
              )}
            </div>
          </div>

          {/* Variants */}
          {formattedOptions.map(option => (
            <div key={option.name} className="mb-5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                Select {option.name}
              </span>
              <div className="flex flex-wrap gap-2">
                {option.values.map(value => {
                  const isActive = selectedOptions[option.name] === value;
                  const isColor = ["color", "colour"].includes(option.name.toLowerCase());
                  const colorHex = isColor ? getSwatchColor(value) : null;

                  if (isColor && colorHex) {
                    return (
                      <button 
                        key={value} onClick={() => handleSelect(option.name, value)}
                        className={`w-7 h-7 rounded-full border shadow-sm flex items-center justify-center transition-transform ${isActive ? 'ring-2 ring-offset-2 ring-black scale-110' : ''}`}
                        style={{ backgroundColor: colorHex, borderRadius: "50%" }}
                      >
                         {isActive && <div className={`w-2 h-2 rounded-full ${['white', 'silver'].some(c => value.toLowerCase().includes(c)) ? 'bg-black' : 'bg-white'}`} />}
                      </button>
                    );
                  }
                  return (
                    <button
                      key={value} onClick={() => handleSelect(option.name, value)}
                      className={`p-2 rounded-lg text-sm font-semibold border transition-all ${isActive ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Details</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product?.body_html}</p>
          </div>
        </div>

        {/* --- STICKY FOOTER --- */}
        <StickyFooter activeVariant={activeVariant} />
      </div>
    </div>
  );
};

const StickyFooter = ({ activeVariant }) => {
  const isOOS = !activeVariant || activeVariant.inventory_quantity === 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex gap-3 h-12">
        <button className="w-12 h-full flex items-center justify-center border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 active:scale-95 transition-transform">
          <Heart size={20} />
        </button>
        <button 
          disabled={isOOS}
          className={`flex-1 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isOOS ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-black text-white shadow-lg hover:bg-gray-900"}`}
        >
          {isOOS ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductBottomSheet;