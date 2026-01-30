import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useViewerStore = create(devtools((set, get) => ({
  activeWidgetType: null,
  activeView: null,
  activeWidgetId: null,
  site: "",
  userPlan: "",

  widgets: {
    Carousel: null,
    Pip: null,
  },

  pipOpen: true,

  globlaData: null,

  activePlayerId: null,

  currentIndex: 0,
  isMuted: false,
  isIframeReady: false,

  isBunnyPIPMode: false,

  openModal: (index, widgetType, widgetId, data) => {
    set((state) => ({
      activeView: widgetType,
      activeWidgetType: widgetType,
      activeWidgetId: widgetId,
      currentIndex: index,
      isIframeReady: false,

      widgets: {
        ...state.widgets,
        [widgetType]: data
      }
    }));
  },

  closeModal: () => set({
    activeView: null,
    activePlayerId: null,
  }),

  setSite: (site) => set({ site: site }),

  setPlayingWidget: (id) => set({ activePlayerId: id }),

  setCurrentIndex: (index) => set({ currentIndex: index }),
  setIframeReady: (status) => set({ isIframeReady: status }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  expandToModal: () => set((state) => ({
    activeView: state.activeWidgetType
  })),

  closePip: () => set({
    activeView: null,
    activePlayerId: null,
    pipOpen: false,
  }),

  nextSlide: (totalLength) => {
    const current = get().currentIndex;
    set({ currentIndex: (current + 1) % totalLength });
  },

  prevSlide: (totalLength) => {
    const current = get().currentIndex;
    set({ currentIndex: (current - 1 + totalLength) % totalLength });
  },
})));