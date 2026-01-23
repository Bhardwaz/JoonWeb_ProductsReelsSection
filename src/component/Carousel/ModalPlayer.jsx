// components/ModalPlayer.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useViewerStore } from "../../store/useViewerStore";
import { useResize } from "../../hooks/useResize";
import ReelShimmer from "../../shimmir/ReelShimmir"; // Ensure this path is correct
import { usePlayerJsLoader } from "../../hooks/usePlayerJSLoader";
import { usePlayerManager } from "../../hooks/usePlayerManager";
import VideoJSPlayer from "./VideoJSPlayer"; // Import the file you created in Step 1
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
import { preload } from "react-dom";

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
  const playerRef = useRef(null);
  const timeTracker = useRef({}); // simple memory for video times

  const {
    initPlayer,
    pauseVideo,
    togglePlayPause
  } = usePlayerManager();

  const handleClose = () => {
    // cleanupAllPlayers();
    closeModal();
    document.documentElement.classList.remove('plugin-overflow-hidden');
    document.body.classList.remove('plugin-overflow-hidden');
  };

  const filteredList = items?.filter(item => !item?.mediaId?.isDeleted)
  // useKeyboardNavigation(filteredList, handleClose);

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

                    {/* {isActive && !isIframeReady && (
                      <div className="absolute inset-0 z-[2] flex items-center justify-center">
                        <ReelShimmer item={item} />
                      </div>
                    )} */}

                    {/* <div
                      className="absolute inset-0 z-20 bg-transparent w-full h-full md:hidden"
                      onClick={() => togglePlayPause(currentIndex)}
                    /> */}

                    {isActive ? (
                      <div className="absolute inset-0 w-full h-full z-10">
                        <VideoJSPlayer
                          options={{
                            autoplay: true,
                            controls: false,
                            responsive: true,
                            fill: true,
                            muted: false,
                            preload: 'auto',
                            sources: [{
                              src: item?.mediaId?.hlsUrl,
                              type: "application/x-mpegURL"
                            }]
                          }}
                          startTime={timeTracker.current[item?.mediaId?._id] || 0}

                          onTimeUpdate={(currentTime) => {
                            timeTracker.current[item?.mediaId?._id] = currentTime;
                          }}

                          onReady={(player) => {
                            player.muted(false);
                            player.play().catch(e => console.log("Autoplay prevented", e));
                          }}
                        />
                      </div>
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
        /* DESKTOP PLAYER - FINAL FIX */
        <div className="hidden md:block md:w-1/2 lg:block lg:w-1/2 relative h-full">
          <div className="relative w-full h-full bg-black">
            
            {!isIframeReady && (
              <div className="absolute inset-0 z-[2]">
                <ReelShimmer />
              </div>
            )}

            <div className="absolute inset-0 w-full h-full z-10">
              <VideoJSPlayer
                /* key ensures a fresh player for every new video, preventing errors */
                key={currentItem?._id || currentIndex} 
                
                options={{
                  autoplay: true,
                  controls: false,
                  responsive: true,
                  fill: true,
                  muted: false,
                  preload: 'auto',
                  sources: [{
                    src: currentItem?.mediaId?.hlsUrl,
                    type: "application/x-mpegURL"
                  }]
                }}
                
                /* Resume time logic */
                startTime={timeTracker.current[currentItem?.mediaId?._id] || 0}
                
                /* Save time logic */
                onTimeUpdate={(currentTime) => {
                  timeTracker.current[currentItem?.mediaId?._id] = currentTime;
                }}

                onReady={(player) => {
                  playerRef.current = player;
                  player.muted(false);
                  // REMOVED player.play() -> Autoplay handles it now!
                  setIframeReady(true);
                }}
              />
            </div>
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