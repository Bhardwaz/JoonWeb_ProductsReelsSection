// component/GlobalPlayerLayer.js
import React from 'react';
import { useViewerStore } from '../store/useViewerStore';
import { useWidgetData } from '../hooks/useWidgetsData';
import Modal from '../component/Carousel/Modal';
import PipWidget from '../component/Pip/PipWidget';

const GlobalPlayerLayer = () => {
  const { activeWidgetType, activeView, activeWidgetId } = useViewerStore();

  const { data } = useWidgetData(activeWidgetId); 
  
  if (!data) return null;

  return (
    <>
      {/* SCENARIO A: Fullscreen Modal is Open */}
      {activeView === 'Carousel' && (
        <Modal items={data.items} />
      )}
    </>
  );
};

export default GlobalPlayerLayer;