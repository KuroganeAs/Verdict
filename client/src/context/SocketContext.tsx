import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomState } from '../types/game';

interface SocketContextProps {
  socket: Socket | null;
  roomState: RoomState | null;
  playerId: string;
  error: string | null;
  setError: (err: string | null) => void;
  createRoom: (name: string, avatar: string, color: string) => void;
  joinRoom: (roomId: string, name: string, avatar: string, color: string) => void;
  setReady: (isReady: boolean) => void;
  startGame: () => void;
  submitRanking: (rankingList: string[]) => void;
  submitGuess: (guess: string) => void;
  nextRound: () => void;
  playAgain: () => void;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

// Generate or retrieve persistent playerId from localStorage
const getPlayerId = (): string => {
  let id = localStorage.getItem('verdict_player_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('verdict_player_id', id);
  }
  return id;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerId = getPlayerId();

  useEffect(() => {
    // Determine backend socket connection URL
    const SOCKET_URL = import.meta.env.DEV
      ? `http://${window.location.hostname}:5000`
      : window.location.origin;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    setSocket(newSocket);

    // Event listeners
    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server');
      // If we already have a roomState, try to re-join the room upon reconnecting
      const storedRoomId = sessionStorage.getItem('verdict_room_id');
      const storedName = sessionStorage.getItem('verdict_player_name');
      const storedAvatar = sessionStorage.getItem('verdict_player_avatar');
      const storedColor = sessionStorage.getItem('verdict_player_color');

      if (storedRoomId && storedName && storedAvatar && storedColor) {
        newSocket.emit('join_room', {
          roomId: storedRoomId,
          playerName: storedName,
          avatar: storedAvatar,
          color: storedColor,
          playerId,
        });
      }
    });

    newSocket.on('room_state_update', (state: RoomState) => {
      setRoomState(state);
      setError(null);
      // Cache room details for recovery on disconnect/refresh
      sessionStorage.setItem('verdict_room_id', state.roomId);
    });

    newSocket.on('room_created', (roomId: string) => {
      sessionStorage.setItem('verdict_room_id', roomId);
    });

    newSocket.on('join_error', (msg: string) => {
      setError(msg);
      setRoomState(null);
    });

    newSocket.on('error', (msg: string) => {
      setError(msg);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [playerId]);

  const createRoom = (name: string, avatar: string, color: string) => {
    if (!socket) return;
    sessionStorage.setItem('verdict_player_name', name);
    sessionStorage.setItem('verdict_player_avatar', avatar);
    sessionStorage.setItem('verdict_player_color', color);
    socket.emit('create_room', { playerName: name, avatar, color, playerId });
  };

  const joinRoom = (roomId: string, name: string, avatar: string, color: string) => {
    if (!socket) return;
    sessionStorage.setItem('verdict_player_name', name);
    sessionStorage.setItem('verdict_player_avatar', avatar);
    sessionStorage.setItem('verdict_player_color', color);
    socket.emit('join_room', { roomId, playerName: name, avatar, color, playerId });
  };

  const setReady = (isReady: boolean) => {
    socket?.emit('set_ready', isReady);
  };

  const startGame = () => {
    socket?.emit('start_game');
  };

  const submitRanking = (rankingList: string[]) => {
    socket?.emit('submit_ranking', rankingList);
  };

  const submitGuess = (guess: string) => {
    socket?.emit('submit_guess', guess);
  };

  const nextRound = () => {
    socket?.emit('next_round');
  };

  const playAgain = () => {
    socket?.emit('play_again');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        roomState,
        playerId,
        error,
        setError,
        createRoom,
        joinRoom,
        setReady,
        startGame,
        submitRanking,
        submitGuess,
        nextRound,
        playAgain,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
