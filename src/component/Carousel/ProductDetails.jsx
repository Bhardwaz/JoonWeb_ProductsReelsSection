import { useState, useEffect, useRef, useMemo, act } from "react";
import { renderPaintedText } from "../common/style-settings";
import { Plus, Minus } from 'lucide-react';
import useAddToCart from "../../service/useAddToCart";
import { useViewerStore } from "../../store/useViewerStore";

// --- 1. HELPER: PARSE VARIANT DATA ---
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

// --- 2. HELPER: COLOR SWATCH LOGIC ---
// Maps text names to CSS colors
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

  return null; // Return null if no color found (will use text fallback)
};

// --- 4. SUB-COMPONENTS (Unchanged) ---

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
      <img src={images[activeIndex]?.url} alt="Product" className="w-full h-full object-contain transition-transform duration-500 drop-shadow-md group-hover:scale-105" />
      {images.length > 1 && (
        <>
          <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button key={idx} onClick={() => { setIsPaused(true); onIndexChange(idx); }} className={`w-2 h-2 rounded-full transition-all ${idx === activeIndex ? "bg-white w-6" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const VariantJSX = ({ variant }) => {
  if (!variant) return null;
  return (
    <div className="bg-white border-t border-gray-100 mt-2">
      <div className="flex items-baseline gap-3 mb-3">
        {variant?.sale_price && <span className="text-3xl font-bold text-gray-900 tracking-tight">₹{variant.sale_price.toLocaleString()}</span>}
        {variant?.price && variant.price !== variant.sale_price && <span className="text-lg line-through text-gray-400 font-medium">₹{variant.price.toLocaleString()}</span>}
      </div>

      {variant?.discount > 0 && <span className="inline-block mb-3 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-md border border-emerald-200">Save ₹{variant.discount.toLocaleString()}</span>}

      <p className="text-sm text-green-600 font-semibold mt-1 flex items-center gap-1.5">
        <span className="text-xs">●</span>
        {!variant?.is_trackable ? (
          <span className="text-green-600">In Stock</span>
        ) : (
          variant?.inventory_quantity > 0 ? (
            <span className="text-green-600">In stock: {variant.inventory_quantity}</span>
          ) : (
            <span className="text-red-500">Out of stock</span>
          )
        )}
      </p>
    </div>
  );
};

// --- 5. MAIN COMPONENT (INTEGRATED & BEAUTIFIED) ---

const ProductDetails = ({ product }) => {
  const { formattedOptions, variantMap } = useMemo(() => parseVariantsStructure(product), [product]);

  const [selectedOptions, setSelectedOptions] = useState({});
  const [imageIndex, setImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [quantity, setQuantity] = useState(1)
  const { mutate: addToCart } = useAddToCart()
  const site = useViewerStore(state => state.site)

  useEffect(() => {
    if (product.variants && product.variants.length > 0 && Object.keys(selectedOptions).length === 0) {
      const firstVariant = product.variants[0];
      const parts = firstVariant.title.split(' / ').map(s => s.trim());
      const defaults = {};
      product.options.forEach((opt, idx) => { defaults[opt.name] = parts[idx]; });
      setSelectedOptions(defaults);
    }
  }, [product]);

  // D. DERIVE ACTIVE VARIANT
  const activeVariant = useMemo(() => {
    if (!variantMap.length) return null;
    const currentKey = product.options.map(opt => selectedOptions[opt.name]).join('__');
    return variantMap.find(v => v.selectionKey === currentKey) || null;
  }, [selectedOptions, variantMap, product.options]);

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

  // E. IMAGE LOGIC
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

  // add to cart logic
  const handleAddToCart = () => {
    if (!activeVariant?.id) return;

    const payload = {
      action: "add",
      id: activeVariant.id,
      quantity,
      properties: {}
    }

    addToCart({ payload, site })
  }

  return (
    <div className="flex flex-col h-full w-full bg-white font-sans text-gray-900 relative">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 scrollbar-thin scrollbar-thumb-gray-300">

        {/* IMAGE WRAPPER (Unchanged) */}
        <div className="bg-gray-50 w-full h-[200px] md:h-[350px] flex items-center justify-center relative overflow-hidden p-6 group">
          <ImageSwiper images={currentImages} activeIndex={imageIndex} onIndexChange={setImageIndex} />
        </div>

        {/* CONTENT */}
        <div className="px-2">

          {/* TITLE */}
          {product?.title && (
            <h1 style={{ fontSize: "16px" }} className="font-bold m-2 leading-snug text-gray-900">{renderPaintedText(product.title)}</h1>
          )}

           {activeVariant ? (
                <VariantJSX variant={activeVariant} key={activeVariant.id} />
              ) : (
                <div className="py-4 text-red-500 text-sm font-semibold">Unavailable Combination</div>
              )}

          {/* VARIANTS SECTION */}
          {hasVariants && (
            <div className="mb-4">

              {/* DYNAMIC OPTIONS RENDERER */}
              {formattedOptions.map((option) => {
                // Check if this option is a color/shade
                const isColor = ["color", "colour", "shade"].includes(option.name.toLowerCase());

                return (
                  <>
                    <div key={option.name} className="mb-3">
                      <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                        {option.name}:
                        <span className="text-gray-900 font-bold">{selectedOptions[option.name]}</span>
                      </p>

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
                                className={`
                                w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-all duration-200
                                flex items-center justify-center relative
                                ${isActive
                                    ? "ring-2 ring-offset-2 ring-black scale-105"
                                    : "hover:scale-105 hover:border-gray-400"
                                  }
                              `}
                                style={{ backgroundColor: swatchColor }}
                              >
                                {/* White checkmark for dark colors, Black checkmark for light colors (optional) */}
                                {isActive && (
                                  <span className={`block w-1.5 h-1.5 rounded-full ${['white', 'beige', 'silver'].some(c => value.toLowerCase().includes(c)) ? 'bg-black' : 'bg-white'}`} />
                                )}
                              </button>
                            );
                          }

                          // RENDER STYLE 2: BEAUTIFIED PILL BUTTONS (For Storage/RAM/etc)
                          return (
                            <button
                              key={value}
                              onClick={() => handleOptionSelect(option.name, value)}
                              className={`
                              text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap border px-4 py-2 shadow-sm
                              ${isActive
                                  ? "bg-black text-white border-black ring-1 ring-black shadow-md transform scale-[1.02]"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                }
                            `}
                            >
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })}

              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-2 w-fit">

                <button
                  onClick={decreaseQuanitity}
                  disabled={quantity <= 1}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={18} />
                </button>

                <span className="font-bold w-6 text-center">{quantity}</span>

                <button

                  onClick={increaseQuantity}
                  className="p-1 hover:bg-gray-100 rounded active:bg-gray-200"
                >
                  <Plus size={18} />
                </button>

              </div>
 
            </div>
          )}

          {/* DESCRIPTION */}
          {product?.body_html && (
            <div className="py-6 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Description</p>
              <div className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{product.body_html}</div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS (Sticky - Unchanged) */}
      <div style={{ padding: "28px 12px" }} className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-7 py-3 z-10">
        {(() => {
          const isOutOfStock = !activeVariant || activeVariant.inventory_quantity === 0;
          return (
            <button onClick={() => handleAddToCart()} disabled={isOutOfStock} className={`relative w-full py-3 px-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 overflow-hidden group ${isOutOfStock ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200" : "bg-black text-white hover:bg-gray-900 hover:-translate-y-0.5"}`}>
              <div className="relative z-20 flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    {activeVariant ? "Out of Stock" : "Unavailable"}
                  </span>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    <span>Add to Cart</span>
                  </>
                )}
              </div>
            </button>
          );
        })()}
      </div>
    </div>
  );
};

export default ProductDetails;