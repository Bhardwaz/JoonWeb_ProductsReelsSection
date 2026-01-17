import { useWidgetData } from "../../hooks/useWidgetsData";
import { useViewerStore } from "../../store/useViewerStore";
import { usePip } from "./hooks/usePIP";

const PipWidget = () => {
    const {
        activeWidgetType,
        currentIndex,
        activeWidgetId,
        isMuted
    } = useViewerStore();

    const { expandToModal, closePip } = usePip();
    const { data } = useWidgetData(activeWidgetId || 'home');
    if (activeWidgetType !== 'PIP' || !data) return null;
    const currentItem = data.items[currentIndex];

    return (
        // Fixed container at bottom right
        <div className="fixed bottom-4 right-4 z-[9999] w-48 h-80 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 animate-in fade-in slide-in-from-bottom-10 bg-black">

            {/* Controls Overlay */}
            <div className="absolute inset-0 z-20 group hover:bg-black/20 transition-all">
                {/* Close Button (X) */}
                <button
                    onClick={(e) => { e.stopPropagation(); closePip(); }}
                    className="absolute top-2 left-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                {/* Expand Button (Maximize) */}
                <button
                    onClick={expandToModal}
                    className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                    <svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                </button>
            </div>

            {/* Video Player (Resume playback from currentIndex) */}
            <iframe
                className="w-full h-full object-cover"
                src={`${currentItem.videoUrl}?autoplay=true&loop=true&muted=${isMuted}&controls=0`}
                allow="autoplay; encrypted-media;"
            />
        </div>
    );
}

export default PipWidget