import { useViewerStore } from "../../../store/useViewerStore";

export const usePip = () => {
  // We select the specific functions/state we need from the store
  const minimizeToPip = useViewerStore((state) => state.minimizeToPip);
  const expandToModal = useViewerStore((state) => state.expandToModal);
  const closePip = useViewerStore((state) => state.closePip);
  const activeWidgetType = useViewerStore((state) => state.activeWidgetType);

  const isPipActive = activeWidgetType === 'PIP';

  return {
    minimizeToPip,
    expandToModal,
    closePip,
    isPipActive
  };
};