export interface ClientMessage {
  type: 'create' | 'join' | 'chat';
  payload: any;
}

export interface User {
  socket: WebSocket;
  room: string;
  name: string;
}
