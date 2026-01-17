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
import JoonWebBadge from "../common/JoonWebBadge";

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

  // Player Hooks
  const { isLoaded: playerJsReady } = usePlayerJsLoader();
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
    document.documentElement.classList.remove('overflow-hidden !important');
    document.body.classList.remove('overflow-hidden !important');
  };

  const filteredList = items?.filter(item => !item?.mediaId?.isDeleted)
  useKeyboardNavigation(filteredList)

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
              // Sync initial state
              setCurrentIndex(swiper.activeIndex);
            }}
          >
            {items?.map((item, idx) => {
              // --- THE NUCLEAR STRATEGY ---
              // Only render the iframe if this is the EXACT active slide.
              const isActive = currentIndex === idx;

              return (
                <SwiperSlide key={item._id ?? idx}>
                  <div className="relative w-full h-full bg-black">

                    {/* 1. POSTER IMAGE (Always Visible) */}
                    {/* This ensures the user sees something while swiping/loading */}
                    <img
                      src={item.mediaId?.thumbnailUrl}
                      className={`absolute inset-0 w-full h-full object-cover z-0 ${isActive && isIframeReady ? 'opacity-0' : 'opacity-100'}`}
                      alt="poster"
                      loading="eager"
                    />

                    {/* 2. SHIMMER (Visible on top until video is ready) */}
                    {isActive && !isIframeReady && (
                      <div className="absolute inset-0 z-[2] flex items-center justify-center">
                        <ReelShimmer item={item} />
                      </div>
                    )}

                    {/* 3. CLICK OVERLAY (Play/Pause) */}
                    <div
                      className="absolute inset-0 z-20 bg-transparent w-full h-full md:hidden"
                      onClick={() => togglePlayPause(currentIndex)}
                    />

                    {/* 4. THE VIDEO PLAYER */}
                    {/* It is only injected into the DOM if isActive is true */}
                    {isActive ? (
                      <VideoSlide
                        item={item}
                        idx={idx}
                        isActive={true}     // Always true if rendered
                        shouldRender={true} // Always true if rendered
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

            {/* Desktop Shimmer */}
            {!isIframeReady && (
              <div className="absolute inset-0 z-[2]">
                <ReelShimmer />
              </div>
            )}

            {/* Click overlay */}
            <div
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={() => togglePlayPause(currentIndex)}
            />

            {/* Desktop Video Slide */}
            {/* We use 'key' to force re-mount on index change */}
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