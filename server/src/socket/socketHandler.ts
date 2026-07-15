import { Server, Socket } from 'socket.io';
import { roomManager } from '../services/roomManager';

// Store guessing timeouts for rooms
const guessingTimeouts: Record<string, NodeJS.Timeout> = {};

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join room event
    socket.on('join_room', ({ roomId, playerName, avatar, color, playerId }) => {
      const cleanRoomId = roomId.toUpperCase().trim();
      const room = roomManager.getRoom(cleanRoomId);

      if (!room) {
        socket.emit('join_error', 'Room not found.');
        return;
      }

      // Check if room is full
      const activePlayers = room.players.filter(p => !p.isDisconnected);
      if (activePlayers.length >= 12) {
        socket.emit('join_error', 'Room is full (max 12 players).');
        return;
      }

      // If game is in progress, check if this is a reconnecting player
      const existingPlayer = room.players.find(p => p.id === playerId);
      if (room.phase !== 'LOBBY' && !existingPlayer) {
        socket.emit('join_error', 'Game in progress. Cannot join now.');
        return;
      }

      // Add player to the room
      const finalPlayerId = playerId || socket.id;
      const player = room.addPlayer(finalPlayerId, playerName, avatar, color);

      // Save credentials in socket session
      socket.data.roomId = cleanRoomId;
      socket.data.playerId = finalPlayerId;

      socket.join(cleanRoomId);
      console.log(`[Socket] Player ${playerName} (${finalPlayerId}) joined room: ${cleanRoomId}`);

      // Broadcast updated room state
      io.to(cleanRoomId).emit('room_state_update', room.toStateJSON());
    });

    // Create room event
    socket.on('create_room', ({ playerName, avatar, color, playerId }) => {
      const roomId = roomManager.generateRoomId();
      const room = roomManager.getOrCreateRoom(roomId);
      
      const finalPlayerId = playerId || socket.id;
      room.addPlayer(finalPlayerId, playerName, avatar, color);

      socket.data.roomId = roomId;
      socket.data.playerId = finalPlayerId;

      socket.join(roomId);
      console.log(`[Socket] Room created: ${roomId} by host ${playerName} (${finalPlayerId})`);

      socket.emit('room_created', roomId);
      io.to(roomId).emit('room_state_update', room.toStateJSON());
    });

    // Toggle Ready status
    socket.on('set_ready', (isReady: boolean) => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      room.setReady(playerId, isReady);
      io.to(roomId).emit('room_state_update', room.toStateJSON());
    });

    // Start Game (Host only)
    socket.on('start_game', () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      // Verify sender is host
      if (room.hostId !== playerId) {
        socket.emit('error', 'Only the host can start the game.');
        return;
      }

      try {
        room.startGame();
        io.to(roomId).emit('room_state_update', room.toStateJSON());
      } catch (err: any) {
        socket.emit('error', err.message || 'Failed to start game.');
      }
    });

    // Submit Ranking (Ranker only)
    socket.on('submit_ranking', (rankingList: string[]) => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      try {
        room.submitRanking(playerId, rankingList);
        
        // Start a 45 second guess countdown timer
        if (guessingTimeouts[roomId]) {
          clearTimeout(guessingTimeouts[roomId]);
        }
        
        // Broadcast state change
        io.to(roomId).emit('room_state_update', room.toStateJSON());

        guessingTimeouts[roomId] = setTimeout(() => {
          const currentRoom = roomManager.getRoom(roomId);
          if (currentRoom && currentRoom.phase === 'GUESSING') {
            console.log(`[Timer] Guessing timeout for room ${roomId}`);
            currentRoom.forceReveal();
            io.to(roomId).emit('room_state_update', currentRoom.toStateJSON());
          }
        }, 45000);

      } catch (err: any) {
        socket.emit('error', err.message || 'Failed to submit ranking.');
      }
    });

    // Submit Guess
    socket.on('submit_guess', (guessPrompt: string) => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      try {
        room.submitGuess(playerId, guessPrompt);
        
        // Check if room transitioned out of GUESSING
        if (room.phase !== 'GUESSING') {
          if (guessingTimeouts[roomId]) {
            clearTimeout(guessingTimeouts[roomId]);
            delete guessingTimeouts[roomId];
          }
        }

        io.to(roomId).emit('room_state_update', room.toStateJSON());
      } catch (err: any) {
        socket.emit('error', err.message || 'Failed to submit guess.');
      }
    });

    // Next Round (Host only)
    socket.on('next_round', () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      if (room.hostId !== playerId) {
        socket.emit('error', 'Only the host can advance the round.');
        return;
      }

      room.startNextRound();
      io.to(roomId).emit('room_state_update', room.toStateJSON());
    });

    // Play Again (Host only)
    socket.on('play_again', () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      if (room.hostId !== playerId) {
        socket.emit('error', 'Only the host can restart the game.');
        return;
      }

      room.playAgain();
      io.to(roomId).emit('room_state_update', room.toStateJSON());
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const { roomId, playerId } = socket.data;
      if (!roomId || !playerId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      console.log(`[Socket] Disconnected player ${playerId} from room ${roomId}`);
      const { isEmpty } = room.removePlayer(playerId);

      if (isEmpty) {
        // Delay deletion slightly in case of momentary connection drops / page reloads
        setTimeout(() => {
          roomManager.cleanRoomIfEmpty(roomId);
        }, 10000);
      } else {
        io.to(roomId).emit('room_state_update', room.toStateJSON());
      }
    });
  });
}
