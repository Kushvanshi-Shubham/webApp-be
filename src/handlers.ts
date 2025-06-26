import WebSocketType from 'ws';
import { allSockets, rooms } from './state';
import { ClientMessage } from './type';

function generateRoomCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

export function handleMessage(socket: WebSocketType, rawMessage: any) {
  try {
    const parsed: ClientMessage = JSON.parse(rawMessage);
    const { type, payload } = parsed;

    switch (type) {
      case 'create': {
        const { name } = payload;
        if (!name) {
          socket.send(errorMsg('Missing name'));
          return;
        }
        const roomId = generateRoomCode();
        rooms.add(roomId);
        // @ts-ignore
        allSockets.push({ socket, room: roomId, name });
        socket.send(successMsg(`Joined room ${roomId}`, roomId));
        break;
      }

      case 'join': {
        const { roomId, name } = payload;
        if (!roomId || !name) {
          socket.send(errorMsg('Missing roomId or name'));
          return;
        }
        if (!rooms.has(roomId)) {
          socket.send(errorMsg(`Room ${roomId} does not exist.`));
        } else {
          // @ts-ignore
          allSockets.push({ socket, room: roomId, name });
          socket.send(successMsg(`Joined room ${roomId}`, roomId));
        }
        break;
      }

case 'chat': {
  // @ts-ignore
  const user = allSockets.find((user) => user.socket === socket);
  if (!user) {
    socket.send(errorMsg('You have not joined any room.'));
    return;
  }
  const { message } = payload;

  // @ts-ignore
  for (const u of allSockets.filter((s) => s.room === user.room && s.socket !== socket)) {
    u.socket.send(
      JSON.stringify({ from: user.name, message })
    );
  }
  break;
}


      default:
        socket.send(errorMsg('Invalid message type.'));
    }
  } catch (error) {
    console.error(error);
    socket.send(errorMsg('Invalid message format.'));
  }
}

function errorMsg(error: string) {
  return JSON.stringify({ error });
}
function successMsg(success: string, roomId?: string) {
  return JSON.stringify({ success, roomId });
}
