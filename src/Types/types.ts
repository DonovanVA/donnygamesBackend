import { PrismaClient } from "@prisma/client";
import { Socket } from "socket.io";
export interface User {
  name: string;
  amount: number;
}

export interface AppContext {
  socket: Socket;
  prisma: PrismaClient;
}

export enum PlayerMoves {
  BET = "BET",
  FOLD = "FOLD",
  BUYIN = "BUYIN",
  STARTGAME = "STARTGAME",
  NEXTROUND ="NEXTROUND",
  ENDGAME = "ENDGAME",
}
