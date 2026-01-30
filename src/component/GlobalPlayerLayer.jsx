// component/GlobalPlayerLayer.js
import React from 'react';
import { useViewerStore } from '../store/useViewerStore';
import { useWidgetData } from '../hooks/useWidgetsData';

const GlobalPlayerLayer = () => {
  const { activeWidgetType, activeView, activeWidgetId } = useViewerStore();

  const { data } = useWidgetData(); 
  
  if (!data) return null;

  return (
    <>
      {/* {activeView === 'Carousel' && (
        <Modal items={data?.Carousel?.items} />
      )}

      {activeView === 'Pip' && (
         <Modal items={data?.Pip?.items} />
      )} */}
    </>
  );
};

export default GlobalPlayerLayer;