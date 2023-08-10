import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

import { userRoutes } from './Routes/userRoutes';

dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const socketServer = new Server(httpServer, {
  cors: {
    origin: true,
  },
});

app.use(cors({ origin: true, credentials: true }));

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8080; // Set the default port to 3000 or use the one from .env

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});