import { useEffect, useRef } from "react";
import { useViewerStore } from "../../store/useViewerStore";
import { useBunnyPlayer } from "../../hooks/useBunnyPlayer";

const BunnyVideo = ({ videoUrl, uniqueId, onReady, idx }) => {
  const iframeRef = useRef(null);

  const { isMuted, currentIndex } = useViewerStore()

  const isActive = idx === currentIndex

  useBunnyPlayer({
    containerId: uniqueId,
    iframeRef,
    videoUrl
  });

  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    const message = isActive ? 'play' : 'pause'
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ method: message }), 
      '*'
    );
  }, [isActive])

  useEffect(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;

    const message = isMuted ? 'mute' : 'unmute';
    
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ method: message }), 
      '*'
    );
  }, [isMuted]);

  return (
    <iframe
      ref={iframeRef}
      onLoad={onReady}
      src={`${videoUrl}?preload=true&autoplay=true&loop=true&muted=false&objectFit=cover`}
      className="w-full h-full object-cover"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
};

export default BunnyVideo