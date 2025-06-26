import { WebSocketServer } from 'ws';
import { handleMessage } from './handlers';

const PORT = 8080;

const wss = new WebSocketServer({ port: 8080 });
console.log(`✅ WebSocket server started on ws://localhost:${PORT}`);

wss.on('connection', (socket) => {
  console.log('👋 New Client Connected');

  socket.on('message', (data) => {
    handleMessage(socket, data);
  });

  socket.on('error', (error) => {
    console.error('[Socket Error]', error);
  });
});
