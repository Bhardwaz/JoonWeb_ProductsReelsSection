// components/PlayerDebug.jsx
const PlayerDebug = ({ playerManager }) => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerManager.debugPlayers) {
        playerManager.debugPlayers();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [playerManager]);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-[99999]">
      <div className="font-bold">Player Debug</div>
      <div>Active: {debugInfo.activeIndex}</div>
      <div>Players: {debugInfo.playerCount}</div>
    </div>
  );
};

// Use in ModalPlayer (temporarily for debugging):
{process.env.NODE_ENV === 'development' && (
  <PlayerDebug playerManager={playerManager} />
)}