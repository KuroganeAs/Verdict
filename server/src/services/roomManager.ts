import { Room } from '../models/Room';

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  public getOrCreateRoom(roomId: string): Room {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Room(roomId);
      this.rooms.set(roomId, room);
      console.log(`[RoomManager] Created Room: ${roomId}`);
    }
    return room;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public deleteRoom(roomId: string): boolean {
    console.log(`[RoomManager] Deleting Room: ${roomId}`);
    return this.rooms.delete(roomId);
  }

  public generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded easily confused chars: I, O, 0, 1
    let result = '';
    for (let i = 6; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    if (this.rooms.has(result)) {
      return this.generateRoomId();
    }
    return result;
  }

  public cleanRoomIfEmpty(roomId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      const activeCount = room.players.filter(p => !p.isDisconnected).length;
      if (activeCount === 0) {
        console.log(`[RoomManager] Room ${roomId} has 0 active players. Cleaning up.`);
        this.deleteRoom(roomId);
      }
    }
  }
}

export const roomManager = new RoomManager();
