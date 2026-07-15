import React from 'react';
import { ShieldAlert, Play, CheckCircle2, Circle } from 'lucide-react';
import { RoomState } from '../types/game';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/Avatar';
import { RoomInvite } from '../components/RoomInvite';

interface LobbyPageProps {
  roomState: RoomState;
  playerId: string;
  onSetReady: (isReady: boolean) => void;
  onStartGame: () => void;
}

export const LobbyPage: React.FC<LobbyPageProps> = ({
  roomState,
  playerId,
  onSetReady,
  onStartGame
}) => {
  const { players, roomId } = roomState;
  const localPlayer = players.find(p => p.id === playerId);
  const isHost = localPlayer?.isHost || false;
  const isReady = localPlayer?.isReady || false;

  const activePlayers = players.filter(p => !p.isDisconnected);
  const readyCount = activePlayers.filter(p => p.isReady || p.isHost).length; // Host is auto-ready
  const canStart = activePlayers.length >= 3 && readyCount === activePlayers.length;

  const handleStart = () => {
    if (canStart) {
      onStartGame();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 text-white max-w-4xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Left Column: Room Code & Share */}
        <div className="flex flex-col justify-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#9f7aea] to-[#ed64a6]">
              Game Lobby
            </h1>
            <p className="text-gray-400 mt-2 text-sm font-semibold">
              Waiting for players to join. Copy the invite code or link below to invite your friends.
            </p>
          </div>

          <RoomInvite roomId={roomId} />
        </div>

        {/* Right Column: Player List & Lobby status */}
        <Card className="flex flex-col gap-5 p-6 h-[500px]" glow="purple">
          <div className="flex justify-between items-center border-b border-[#222230] pb-3 select-none">
            <h2 className="text-lg font-bold">Players ({activePlayers.length}/12)</h2>
            <span className="text-xs bg-[#222230] text-gray-300 font-bold px-3 py-1 rounded-full">
              {readyCount} Ready
            </span>
          </div>

          {/* Players scrollable list */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 no-scrollbar">
            {players.map((player) => {
              const showReady = player.isReady || player.isHost;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between bg-[#0a0a0c]/50 border border-[#222230] px-4 py-3 rounded-2xl transition-all duration-200
                    ${player.isDisconnected ? 'opacity-40 border-dashed' : ''}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Avatar emoji={player.avatar} color={player.color} size="sm" isHost={player.isHost} isDisconnected={player.isDisconnected} />
                    <span className="font-bold text-base truncate text-white">
                      {player.name} {player.id === playerId && <span className="text-xs font-semibold text-gray-500 font-sans ml-1">(You)</span>}
                    </span>
                  </div>

                  <div className="shrink-0 flex items-center justify-center">
                    {player.isDisconnected ? (
                      <span className="text-[10px] text-red-500 font-bold uppercase">OFFLINE</span>
                    ) : showReady ? (
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    ) : (
                      <Circle className="text-gray-600 animate-pulse" size={20} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 border-t border-[#222230] pt-4 mt-auto">
            {isHost ? (
              <>
                <Button
                  variant={canStart ? 'primary' : 'secondary'}
                  size="lg"
                  onClick={handleStart}
                  disabled={!canStart}
                  className="w-full"
                >
                  Start Game <Play className="ml-2" size={18} />
                </Button>
                {activePlayers.length < 3 ? (
                  <p className="text-xs text-center text-amber-500 font-semibold flex items-center justify-center gap-1 select-none">
                    <ShieldAlert size={14} /> Need at least 3 players to start.
                  </p>
                ) : readyCount < activePlayers.length ? (
                  <p className="text-xs text-center text-gray-400 font-semibold select-none">
                    Waiting for everyone to be ready.
                  </p>
                ) : null}
              </>
            ) : (
              <Button
                variant={isReady ? 'secondary' : 'primary'}
                size="lg"
                onClick={() => onSetReady(!isReady)}
                className="w-full"
              >
                {isReady ? 'Not Ready' : 'I am Ready!'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
