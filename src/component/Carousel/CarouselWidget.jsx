import { useMemo } from 'react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import Card from './Card';
import Modal from './Modal';
import { useViewerStore } from '../../store/useViewerStore';
import { usePlayerJsLoader } from '../../hooks/usePlayerJSLoader';
import { renderPaintedText } from '../common/style-settings.jsx';
import { useResize } from '../../hooks/useResize.jsx';

const CarouselWidget = ({
  items,
  settings,
  widgetType,
  heading,
  isLive,
  pipItems
}) => {
  const activeView = useViewerStore((state) => state.activeView);
  const { isLoaded: playerJsReady } = usePlayerJsLoader();

  if (!items || items.length === 0 || !isLive) return null;
  const { isMobile } = useResize();

  const config = useMemo(() => {
    return {
      navigation: {
        showNavigation: settings?.navigation?.showNavigation,
        showDots: settings?.navigation?.showDots,
      },

      colors: {
        nav: settings?.navigation?.navColor || '#000',
        base: settings?.navigation?.baseColor || '#EF4444',
        highlight: settings?.navigation?.highlightColor || '#171717',
      },

      header: {
        show: settings?.header?.show ?? true,
        text: settings?.header?.text || heading,
        align: settings?.header?.alignment || 20,
        fontSize: settings?.header?.fontSize || 24,
        fontWeight: settings?.header?.fontWeight || 'bold',
        isGradient: settings?.header?.isGradient || false,
      },

      card: {
        hover: settings?.cardSettings?.hoverEffect || 'scale',
        showInfo: settings?.cardSettings?.showProductInfo ?? true,
        pt: settings?.cardSettings?.paddingTop,
        pb: settings?.cardSettings?.paddingBottom,
      },

      modal: {
        ...settings?.modal,
        base: settings?.navigation?.baseColor,
        highlight: settings?.navigation?.highlightColor,
      },

      responsive: {
        ...settings?.responsive
      }
    };
  }, [settings, items.length, heading]);

  console.log(settings, "settings")

  return (
    <div style={{ paddingTop: `${config?.card?.pt}px`, paddingBottom: `${config?.card?.pb}px` }} className="mx-auto shoppable-carousel max-w-[90%] relative">
      {config.header.show && (
        <h2
          style={{
            fontSize: `${config.header.fontSize}px`,
            fontWeight: config.header.fontWeight,
            textAlign:
              config.header.align < 34
                ? 'left'
                : config.header.align < 67
                  ? 'center'
                  : 'right',
            color: config.colors.highlight
          }}
        >
          {config.header.isGradient
            ? renderPaintedText(
              config.header.text,
              config.colors.base,
              config.colors.highlight
            )
            : config.header.text}
        </h2>
      )}

      <swiper-container
        slides-per-view={isMobile ? config?.responsive?.mobile?.cardsNumber : config?.responsive?.desktop?.cardsNumber}
        navigation={config?.navigation?.showNavigation}
        pagination={config?.navigation?.showDots}
        navigation-next-el=".custom-next-button"
        navigation-prev-el=".custom-prev-button"
        pagination-clickable={config?.navigation?.showDots}
        autoplay={true}
        autoplay-delay={2500}
        autoplay-disable-on-interaction={true}
        pagination-dynamic-bullets={config?.navigation?.showDots}
        center-slides={true}
        mousewheel-invert="true"
        space-between="15"
        style={
          {
            "--swiper-navigation-color": `${config?.colors?.nav}`,
            "--swiper-pagination-color": `${config?.colors?.nav}`,
            "--swiper-pagination-margin-top": "20px",
            "--swiper-pagination-bottom": "0px",
          }
        }
      >

        {items.map((item, index) => (
          <swiper-slide key={item._id || index} lazy={true}>
            <Card
              item={item}
              index={index}
              widgetType={widgetType}
              playerJsReady={playerJsReady}
              settings={config}
              loading='lazy'
            />
          </swiper-slide>
        ))}
      </swiper-container>

      <div className="nav-btn custom-prev-button" style={{ '--nav-hover-color': config?.colors?.nav }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="main-grid-item-icon" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <line x1="19" x2="5" y1="12" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </div>

      <div className="nav-btn custom-next-button" style={{ '--nav-hover-color': config?.colors?.nav }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="main-grid-item-icon" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <line x1="5" x2="19" y1="12" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>

      {
        activeView === 'Carousel' && playerJsReady && (
          <Modal items={items} playerJsReady={playerJsReady} modalSettings={config.modal} />
        )
      }

      {
        activeView === 'Pip' && playerJsReady && (
          <Modal items={pipItems} playerJsReady={playerJsReady} />
        )
      }
    </div >
  );
};

export default CarouselWidget;