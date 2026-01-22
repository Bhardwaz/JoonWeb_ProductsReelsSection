import React from 'react';
import Card from './Card';
import { useViewerStore } from '../../store/useViewerStore';
import Modal from './Modal';
import { usePlayerJsLoader } from '../../hooks/usePlayerJSLoader';
import { renderPaintedText } from '../common/style-settings.jsx';

const CarouselWidget = ({ items, settings, widgetType, heading, isIntegrated, isLive }) => {
  const activeView = useViewerStore((state) => state.activeView);
  const { isLoaded: playerJsReady } = usePlayerJsLoader();

  if (!items || items.length === 0) return null;
  if (!isLive) return null;

  return (
    <div className="w-full py-10 bg-white">
      {/* Header Section */}
      <div className="mb-6 px-4 md:px-8 flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {renderPaintedText(heading)}
          </h2>
          {/* Optional: Add a tiny decorative line under the heading */}
          <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mt-2"></div>
        </div>
      </div>

      {/* Scrollable Container */}
      <div style={{ marginTop: "20px" }} className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {items.map((item, index) => (
          <div
            key={item._id || index}
            className="w-[200px] flex-shrink-0 snap-start transition-transform duration-300 hover:scale-[1.02]"
          >
            <Card item={item} index={index} widgetType={widgetType} playerJsReady={playerJsReady} />
          </div>
        ))}
      </div>

      {activeView === "Carousel" && playerJsReady && (
        <Modal items={items} playerJsReady={playerJsReady} />
      )}
    </div>
  );
};

export default CarouselWidget;