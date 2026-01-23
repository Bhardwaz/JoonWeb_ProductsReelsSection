import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import Card from './Card';
import Modal from './Modal';
import { useViewerStore } from '../../store/useViewerStore';
import { usePlayerJsLoader } from '../../hooks/usePlayerJSLoader';
import { renderPaintedText } from '../common/style-settings.jsx';

const CarouselWidget = ({
  items,
  settings,
  widgetType,
  heading,
  isIntegrated,
  isLive
}) => {
  const activeView = useViewerStore((state) => state.activeView);
  const { isLoaded: playerJsReady } = usePlayerJsLoader();

  if (!items || items.length === 0) return null;
  if (!isLive) return null;

  return (
    <div className="w-full px-4 md:max-w-2xl lg:max-w-4xl mx-auto md:px-6 lg:px-8">
  
      <div className="mb-6 px-4 md:px-8">
        <h2 className="text-xl md:text-4xl font-extrabold tracking-tight">
          {renderPaintedText(heading)}
        </h2>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full mt-2" />
      </div>

      <div className="px-4 md:px-8 mt-4">
        <Swiper
          spaceBetween={12}
          slidesPerView={2.5}
          grabCursor
          breakpoints={{
            640: { 
              slidesPerView: 4,
              spaceBetween: 8
            },
            1024: { 
              slidesPerView: 4,
              spaceBetween: 8 
            },
            1280: { 
              slidesPerView: 4, 
              spaceBetween: 8
            }
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide key={item._id || index}>
              <div className="transition-transform duration-300 hover:scale-[1.02]">
                <Card
                  item={item}
                  index={index}
                  widgetType={widgetType}
                  playerJsReady={playerJsReady}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Modal */}
      {activeView === 'Carousel' && playerJsReady && (
        <Modal items={items} playerJsReady={playerJsReady} />
      )}
    </div>
  );
};

export default CarouselWidget;
