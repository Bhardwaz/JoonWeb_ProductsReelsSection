import { useEffect, useRef } from 'react';
import { useViewerStore } from '../store/useViewerStore';

export const useBunnyPlayer = ({ 
  containerId,   
  iframeRef,     
  videoUrl 
}) => {

  const activePlayerId = useViewerStore((state) => state.activePlayerId);
  const isMuted = useViewerStore((state) => state.isMuted);

  // Am I the chosen one?
  const isMyTurn = activePlayerId === containerId;

  const playerInstanceRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current || !window.playerjs) return;
    
    if (playerInstanceRef.current) return;

    try {
      // Create the PlayerJS instance
      const player = new window.playerjs.Player(iframeRef.current);
      playerInstanceRef.current = player;

      player.on("ready", () => {
        const currentActiveId = useViewerStore.getState().activePlayerId;

         player.on('enterpictureinpicture', () => {
           console.log("Entering Native PiP...");
           
           // 1. Tell the store we are now in PiP mode
           useViewerStore.getState().minimizeToPip(); 
           
           // 2. OR if you prefer to just close the modal completely:
           // useViewerStore.getState().closeModal();
        });
        
        if (currentActiveId === containerId) {
           player.unmute(); // Ensure audio channel is open
           if (useViewerStore.getState().isMuted) player.mute(); // Apply global mute pref
           player.play();
        } else {
           player.pause();
           player.mute();
        }
      });
      // Optional: Add listeners for progress saving here
      // player.on("timeupdate", (data) => saveProgress(containerId, data.seconds));

    } catch (e) {
      console.warn("Bunny Player Init Error:", e);
    }
  }, [iframeRef, containerId]); // Only runs when iframe is attached


  // --- EFFECT 2: REACTION (Runs when Store updates) ---
  useEffect(() => {
    const player = playerInstanceRef.current;
    const iframeWindow = iframeRef.current?.contentWindow;

    // Helper to send commands safely (via Object or PostMessage)
    const sendCommand = (action, value = null) => {
      if (player) {
        if (action === 'play') player.play();
        if (action === 'pause') player.pause();
        if (action === 'mute') player.mute();
        if (action === 'unmute') player.unmute();
      } 
      else if (iframeWindow) {
        iframeWindow.postMessage({ method: action, value }, "*");
      }
    };

    if (isMyTurn) {
      isMuted ? sendCommand('mute') : sendCommand('unmute');

      sendCommand('play');
    } else {
      sendCommand('pause');
      sendCommand('mute');
    }

  }, [isMyTurn, isMuted]);
};