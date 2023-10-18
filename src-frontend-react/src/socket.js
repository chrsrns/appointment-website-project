import { io } from 'socket.io-client';

const env = process.env.NODE_ENV;
const url = env === 'development' ? "localhost:3000" : ""

export const socket = io(url, { autoConnect: false, transports: ['websocket'] });
