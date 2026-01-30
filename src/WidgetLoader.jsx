import { useWidgetData } from './hooks/useWidgetsData';
import CarouselWidget from './component/Carousel/CarouselWidget';
import CardsShimmer from './component/Carousel/Shimmir/CardsShimmer';
import NoItems from './component/Carousel/Shimmir/NoItems';
import { useEffect, useState } from 'react';
import Pip from './component/Pip/Pip';
import { useViewerStore } from './store/useViewerStore';

const WidgetLoader = ({ site }) => {
  const { data: widget, isLoading, isError } = useWidgetData(site);
  const activeView = useViewerStore(state => state.activeView)
  
  if (isLoading) {
    return (
      <div className="flex flex-row gap-7">
        <CardsShimmer />
      </div>
    );
  }

  if (isError || !widget.Carousel) return <NoItems />;

  const { items } = widget.Carousel;
  const  pip = widget?.Pip?.items

  if (items?.length === 0) return <NoItems />

  return(
    <>
       { items?.length > 0 && <CarouselWidget items={items} settings={widget?.Carousel?.carouselSettings} widgetType={widget.page} heading={widget?.Carousel?.heading} isIntegrated={widget?.Carousel?.integrate} isLive={widget?.Carousel?.isLive} pipItems={pip} /> }

       { pip?.length > 0 && activeView === null && <Pip src={pip[0]?.mediaId?.hlsUrl} pip={pip} id={widget.Pip._id} settings={widget?.Pip?.pipSettings} /> }
    </>
  )

};

export default WidgetLoader;