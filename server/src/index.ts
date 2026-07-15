import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket/socketHandler';

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for frontend connection
app.use(cors({
  origin: '*', // In production, replace with specific domain
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Configure Socket.IO handlers
setupSocketHandlers(io);

server.listen(port, () => {
  console.log(`[Server] Verdict server listening on port ${port}`);
});
