// Modal.jsx
import React, { Suspense } from "react";
import { useViewerStore } from "../../store/useViewerStore";
import { useWidgetData } from "../../hooks/useWidgetsData";
import { useResize } from "../../hooks/useResize";
import JoonWebBadge from "../common/JoonWebBadge";
import { Toaster } from "react-hot-toast";
import SvgButtons from "./SvgButtons";

// Lazy load the heavy player logic
const ModalPlayer = React.lazy(() => import("./ModalPlayer"));

const Modal = ({ items, playerJsReady, modalSettings }) => {
  const { currentIndex, closeModal, nextSlide, prevSlide } = useViewerStore();
  const { isMobile } = useResize();

  if (!items || !playerJsReady) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    nextSlide(items.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    prevSlide(items.length);
  };

  const prevIndex = (currentIndex - 1 + items.length) % items.length;
  const nextIndex = (currentIndex + 1) % items.length;

  const arrowBtnClass = "hidden md:flex fixed top-1/2 -translate-y-1/2 z-[100] w-[4rem] h-[4rem] items-center justify-center rounded-full bg-white/90 text-black shadow-2xl cursor-pointer border-none transition-all duration-300 hover:bg-white hover:scale-110 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]";
  const sideThumbClass = "hidden md:block md:w-[310px] md:h-[560px] relative cursor-pointer transition-all duration-500 ease-out object-cover rounded-xl shadow-2xl hover:brightness-90 hover:scale-95 scale-90";

  const controlBtnClass = "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg z-50";

  const handleClose = () => {
    // cleanupAllPlayers();
    closeModal();
    document.documentElement.classList.remove('plugin-overflow-hidden');
    document.body.classList.remove('plugin-overflow-hidden');
  };

  return (
    <div className="fixed w-full h-full inset-0 flex items-center justify-center md:p-4 overflow-hidden z-[9999] md:bg-black/40 md:backdrop-blur-md">

      <Toaster position="top-center" />

      {!isMobile && items?.length > 1 && (
        <>
          <div style={{ color: `${modalSettings?.highlight}` }} className={`${arrowBtnClass} left-8 w-[50px] h-[50px] p-3`} onClick={handlePrev}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </div>
          <div style={{ color: `${modalSettings?.highlight}` }} className={`${arrowBtnClass} right-8 w-[50px] h-[50px] p-3`} onClick={handleNext}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </>
      )}

      <div className="flex items-center justify-center w-full h-full">

        {!isMobile && items?.length > 1 && (
          <div
            className={`${sideThumbClass} z-10`}
            onClick={handlePrev}
          >
            <img
              src={items[prevIndex]?.mediaId?.thumbnailUrl}
              alt="Previous"
              className="hidden md:block w-full h-full object-cover rounded-xl"
            />
          </div>
        )}

        <Suspense fallback={<div className="w-[300px] h-[550px] bg-gray-200 animate-pulse rounded-2xl"></div>}>
          <ModalPlayer items={items} modalSettings={modalSettings} />
        </Suspense>

        {!isMobile && items?.length > 1 && (
          <div
            className={`${sideThumbClass} z-10`}
            onClick={handleNext}
          >
            <img
              src={items[nextIndex]?.mediaId?.thumbnailUrl}
              alt="Next"
              className="hidden md:block w-full h-full object-cover rounded-xl"
            />
          </div>
        )}

      </div>

      <SvgButtons
            controlBtnClass={controlBtnClass}
            closeModal={handleClose}
      />

      <JoonWebBadge />
    </div>
  );
};

export default Modal;