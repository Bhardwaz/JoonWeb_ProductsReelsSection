// components/VideoPlaybackIcon.jsx
const VideoPlaybackIcon = ({ isPlaying, className = "" }) => {
  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'} ${className}`}>
      <div className="relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-black/30 blur-xl rounded-full scale-125" />
        
        {/* Icon container */}
        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-black/50 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-2xl">
          {isPlaying ? (
            // Pause Icon (shown when video is paused)
            <svg 
              className="w-10 h-10 md:w-12 md:h-12 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            // Play Icon (shown when video is playing)
            <svg 
              className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlaybackIcon;