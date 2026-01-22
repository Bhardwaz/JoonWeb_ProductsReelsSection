// components/ModalPlayer.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useViewerStore } from "../../store/useViewerStore";
import { useResize } from "../../hooks/useResize";
import ReelShimmer from "../../shimmir/ReelShimmir"; // Ensure this path is correct
import { usePlayerJsLoader } from "../../hooks/usePlayerJSLoader";
import { usePlayerManager } from "../../hooks/usePlayerManager";

// Swiper Imports
import "swiper/css";
import { Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import ProductDetails from "./ProductDetails";
import SvgButtons from "./SvgButtons";
import VideoProductOverlay from "./VideoProductOverlay";
import ProductBottomSheet from "./ProductBottomSheet";
import VideoSlide from "./VideoSlide";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";

export default function ModalPlayer({ items }) {
  const {
    currentIndex,
    setCurrentIndex,
    isMuted,
    toggleMute,
    isIframeReady,
    setIframeReady,
    closeModal,
  } = useViewerStore();

  const { isMobile } = useResize();
  const [productDetails, setProductDetails] = useState(null);

  const {
    initPlayer,
    playActiveVideo,
    pauseVideo,
    cleanupAllPlayers,
    togglePlayPause
  } = usePlayerManager();

  const handleClose = () => {
    cleanupAllPlayers();
    closeModal();
    document.documentElement.classList.remove('plugin-overflow-hidden');
    document.body.classList.remove('plugin-overflow-hidden');
  };

  const filteredList = items?.filter(item => !item?.mediaId?.isDeleted)
  useKeyboardNavigation(filteredList, handleClose);

  const handleSlideChange = (swiper) => {
    pauseVideo(currentIndex);

    setIframeReady(false);

    const newIndex = swiper.realIndex;
    setCurrentIndex(newIndex);
  };

  const handleVideoReady = useCallback(() => {
    setIframeReady(true);
  }, [setIframeReady]);

  let currentItem = items[currentIndex];
  if (!currentItem) return null;

  const controlBtnClass = "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg z-50";

  return (
    <div className="relative md:mt-8 w-full h-full overflow-hidden bg-black md:flex md:flex-row md:w-[700px] md:h-[600px] md:rounded-xl">

      {isMobile ? (
        <div className="relative h-full w-full md:hidden lg:hidden overflow-hidden">
          <Swiper
            direction="vertical"
            slidesPerView={1}
            mousewheel
            modules={[Mousewheel]}
            className="w-full h-full"
            initialSlide={currentIndex}
            onSlideChange={handleSlideChange}
            loop={true}
            onSwiper={(swiper) => {
            
              setCurrentIndex(swiper.activeIndex);
            }}
          >
            {items?.map((item, idx) => {
              const isActive = currentIndex === idx;

              return (
                <SwiperSlide key={item._id ?? idx}>
                  <div className="relative w-full h-full bg-black">

                    <img
                      src={item.mediaId?.thumbnailUrl}
                      className={`absolute inset-0 w-full h-full object-cover z-0 ${isActive && isIframeReady ? 'opacity-0' : 'opacity-100'}`}
                      alt="poster"
                      loading="eager"
                    />

                    {isActive && !isIframeReady && (
                      <div className="absolute inset-0 z-[2] flex items-center justify-center">
                        <ReelShimmer item={item} />
                      </div>
                    )}

                    <div
                      className="absolute inset-0 z-20 bg-transparent w-full h-full md:hidden"
                      onClick={() => togglePlayPause(currentIndex)}
                    />

            
                    {isActive ? (
                      <VideoSlide
                        item={item}
                        idx={idx}
                        isActive={true}    
                        shouldRender={true}
                        initPlayer={initPlayer}
                        isMuted={isMuted}
                        onReady={handleVideoReady}
                      />
                    ) : null}

                    <VideoProductOverlay
                      product={item?.mediaId?.productJSON}
                      onOpenDetails={() => setProductDetails(item?.mediaId?.productJSON)}
                      onAddToCart={(variant) => console.log("Quick Add", variant)}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <SvgButtons
            controlBtnClass={controlBtnClass}
            closeModal={handleClose}
            toggleMute={toggleMute}
          />

          {productDetails && (
            <ProductBottomSheet
              isOpen={!!productDetails}
              onClose={() => setProductDetails(null)}
              product={productDetails}
              style={{ zIndex: 9999 }}
            />
          )}
        </div>
      ) : (
        /* DESKTOP PLAYER */
        <div className="hidden md:block md:w-1/2 lg:block lg:w-1/2 relative h-full">
          <div className="relative w-full h-full">

            {!isIframeReady && (
              <div className="absolute inset-0 z-[2]">
                <ReelShimmer />
              </div>
            )}

            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={() => togglePlayPause(currentIndex)}
            />

            <VideoSlide
              key={`desktop-${currentIndex}`}
              item={items[currentIndex]}
              idx={currentIndex}
              isActive={true}
              shouldRender={true}
              initPlayer={initPlayer}
              isMuted={isMuted}
              onReady={handleVideoReady}
            />
          </div>

          <SvgButtons
            controlBtnClass={controlBtnClass}
            closeModal={handleClose}
            toggleMute={toggleMute}
          />
        </div>
      )}

      {!isMobile && currentItem?.mediaId?.productJSON && (
        <div className="hidden md:w-1/2 md:block lg:w-1/2 lg:block h-full flex flex-col bg-white">
          <ProductDetails product={currentItem?.mediaId?.productJSON} />
        </div>
      )}

    </div>
  );
}