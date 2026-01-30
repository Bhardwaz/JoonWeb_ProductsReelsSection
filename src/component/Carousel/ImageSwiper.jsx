import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageSwiper = ({ product, images, interval = 3000, isAutoPlay = true }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
    setIsPaused(false);
  }, [images]);

  useEffect(() => {
    if (isAutoPlay && !isPaused && images?.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }, interval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, isAutoPlay, interval, images?.length]);

  const handlePrev = (e) => { 
    e.stopPropagation();
    setIsPaused(true); 
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length); 
  };

  const handleNext = (e) => { 
    e.stopPropagation();
    setIsPaused(true); 
    setActiveIndex((prev) => (prev + 1) % images.length); 
  };

  const handleDotClick = (idx) => {
      e.stopPropagation();
      setIsPaused(true);
      setActiveIndex(idx);
  }

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full group">
      <div className="relative w-full h-full">
        <img
          src={images[activeIndex]?.url || images[activeIndex]?.src}
          alt={product?.title || "Product Image"}
          className="w-full h-full object-contain transition-all duration-700 group-hover:scale-[1.02] drop-shadow-2xl"
        />

       {product?.ribbon && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg">
            {product?.ribbon}
          </span>
        </div>
       )}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
          >
            <ChevronLeft className="w-4 h-4 text-gray-800" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-xl backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
          >
            <ChevronRight className="w-4 h-4 text-gray-800" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 backdrop-blur-sm bg-black/30 p-1 rounded-full z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); handleDotClick(idx); }}
                className={`transition-all duration-200 ${idx === activeIndex ? "w-6" : "w-2"}`}
              >
                <div className={`h-2 rounded-full ${idx === activeIndex ? "bg-white shadow-md" : "bg-white/50 hover:bg-white/80"}`} />
              </button>
            ))}
          </div>

          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
            {activeIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSwiper;