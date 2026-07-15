import React, { useEffect, useState } from 'react';
import { useSocket, SocketProvider } from './context/SocketContext';
import { LandingPage } from './pages/LandingPage';
import { LobbyPage } from './pages/LobbyPage';
import { GamePage } from './pages/GamePage';
import { AnimatedBackground } from './components/AnimatedBackground';

const GameContainer: React.FC = () => {
  const {
    roomState,
    playerId,
    error,
    createRoom,
    joinRoom,
    setReady,
    startGame,
    submitRanking,
    submitGuess,
    nextRound,
    playAgain
  } = useSocket();

  const [urlPath, setUrlPath] = useState(window.location.pathname);

  // Synchronize history popping (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setUrlPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Parse room ID from path: /room/ABCD12
  const match = urlPath.match(/\/room\/([A-Za-z0-9]+)/);
  const urlRoomId = match ? match[1].toUpperCase() : '';

  // Synchronize URL path to current room ID
  useEffect(() => {
    if (roomState?.roomId && window.location.pathname !== `/room/${roomState.roomId}`) {
      const newPath = `/room/${roomState.roomId}`;
      window.history.pushState(null, '', newPath);
      setUrlPath(newPath);
    }
  }, [roomState?.roomId]);

  // Click logo to return home / leave room
  const handleLogoClick = () => {
    if (roomState) {
      if (confirm("Are you sure you want to leave this room? Your score and active state will be reset.")) {
        sessionStorage.clear();
        window.history.pushState(null, '', '/');
        setUrlPath('/');
        window.location.reload(); // Perform hard client reconnect
      }
    }
  };

  const handleCreateRoom = (name: string, avatar: string, color: string) => {
    createRoom(name, avatar, color);
  };

  const handleJoinRoom = (roomIdToJoin: string, name: string, avatar: string, color: string) => {
    joinRoom(roomIdToJoin, name, avatar, color);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between">
      <AnimatedBackground />

      {/* Header bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <img src="/logo.png" alt="Verdict Logo" className="w-8 h-8 rounded-lg shadow-md shadow-red-500/20" />
          <span className="text-xl font-extrabold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-[#ed64a6] select-none">
            Verdict
          </span>
        </button>
        {roomState && (
          <div className="text-xs font-bold text-gray-400 bg-[#121217] border border-[#222230] px-3.5 py-1.5 rounded-full select-none">
            ROOM: <span className="text-white tracking-wider font-mono">{roomState.roomId}</span>
          </div>
        )}
      </header>

      {/* Content wrapper */}
      <main className="flex-1 flex items-center justify-center w-full relative z-10 px-4">
        {!roomState ? (
          <LandingPage
            prefilledRoomId={urlRoomId}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            error={error}
          />
        ) : roomState.phase === 'LOBBY' ? (
          <LobbyPage
            roomState={roomState}
            playerId={playerId}
            onSetReady={setReady}
            onStartGame={startGame}
          />
        ) : (
          <GamePage
            roomState={roomState}
            playerId={playerId}
            onSubmitRanking={submitRanking}
            onSubmitGuess={submitGuess}
            onNextRound={nextRound}
            onPlayAgain={playAgain}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-4 text-[10px] text-gray-500 font-bold select-none border-t border-[#121217]/20 mt-auto">
        &copy; {new Date().getFullYear()} VERDICT. NO ACCOUNTS. NO DATABASE. PURE FUN.
      </footer>
    </div>
  );
};

function App() {
  return (
    <SocketProvider>
      <GameContainer />
    </SocketProvider>
  );
}

export default App;
