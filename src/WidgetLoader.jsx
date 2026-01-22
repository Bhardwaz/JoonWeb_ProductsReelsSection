import { useWidgetData } from './hooks/useWidgetsData';
import CarouselWidget from './component/Carousel/CarouselWidget';
import CardsShimmer from './component/Carousel/Shimmir/CardsShimmer';
import NoItems from './component/Carousel/Shimmir/NoItems';

const WidgetLoader = ({ site }) => {
  const { data: widget, isLoading, isError } = useWidgetData(site);

  if (isLoading) {
    return (
      <div className="flex flex-row gap-7">
        <CardsShimmer />
      </div>
    );
  }

  if (isError || !widget) return <NoItems />;

  const { items } = widget;

  if (items?.length === 0) return <NoItems />

  switch (widget.widgetType) {
    case 'Carousel':
      return <CarouselWidget items={items} settings={widget.settings} widgetType={widget.page} heading={widget?.heading} isIntegrated={widget?.integrate} isLive={widget.isLive} />;

    default:
      console.warn('Unknown widget type:', widget.widgetType);
      return null;
  }
};

export default WidgetLoader;