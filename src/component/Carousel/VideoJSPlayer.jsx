import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoJSPlayer = ({ options, onReady, startTime, onTimeUpdate }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      
      videoElement.style.pointerEvents = 'none';

      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        onReady && onReady(player);
      });

      player.on('loadedmetadata', () => {
        if (startTime > 0) {
          player.currentTime(startTime);
        }
      });

      player.one('canplay', () => {
        if (startTime > 0 && player.currentTime() < 1) {
          player.currentTime(startTime);
        }
      });

      player.on('timeupdate', () => {
        const currentTime = player.currentTime();
        if (currentTime > 0 && onTimeUpdate) {
          onTimeUpdate(currentTime);
        }
      });

    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation(); 
    const player = playerRef.current;
    if (player) {
      if (player.paused()) {
        player.play();
      } else {
        player.pause();
      }
    }
  };

  return (
    <div 
      data-vjs-player 
      style={{ width: "100%", height: "100%", pointerEvents: 'auto' }}
      onClick={handleToggle}
    >
      <div ref={videoRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default VideoJSPlayer;