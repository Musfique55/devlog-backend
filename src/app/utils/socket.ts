import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (server: http.Server, corsOptions: any) => {
  io = new Server(server, {
    cors: corsOptions,
  });
  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket is not initialized");
  }
  return io;
};
