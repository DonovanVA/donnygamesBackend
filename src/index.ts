import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { userRoutes } from "./Routes/userRoutes";
import {
  createTable,
  disconnectFromTable,
  createUser,
  setPlayerAction,
  joinTable,
} from "./Poker/PlayerControls";
import { gameStateCallBack } from "./Poker/Callbacks";
import { PlayerInput } from "./Assets/Interfaces";
import { PrismaClient } from "@prisma/client";
import { AppContext, PlayerMoves } from "./Types/types";
import { SOCKETEVENTS } from "./SocketManager/events";
import {
  getActivePlayerTurn,
  getGameState,
  getHost,
  getPlayerInfo,
  getTable,
} from "./Poker/Lib/Getters";
//NOTE: each method in a class should emit a socket event, index.ts handles the event listener in this observer design pattern
const app = express();
const prisma = new PrismaClient();
const httpServer = http.createServer(app);
const socketServer = new Server(httpServer, {
  cors: {
    origin: true,
  },
});

socketServer.on("connection", (socket) => {
  console.log("A user connected");
  const app: AppContext = {
    socket: socket,
    prisma: prisma,
  };
  //////////////////// Handle "createTable" event from client
  socket.on(SOCKETEVENTS.on.createTable, async (playerInput: PlayerInput) => {
    // Create a new PokerPlayer instance for each connected socket
    try {
      const table = await createTable(app); // This will create a new table and update the players
      if (table) {
        const player = await createUser(app, playerInput, table);
        const newTableData = await getTable(app, table.pokerTable_id);
        const state = await getGameState(app, table.pokerTable_id); // return 0 - betting round, 1 - no cards, 2 - 3 cards, 3 - 4 cards , 4 - 5 cards
        state &&
          newTableData &&
          app.socket.emit(SOCKETEVENTS.emit.tableJoined, {
            state: state,
            player: player,
            table: newTableData,
          });
        state &&
          newTableData &&
          socket.emit(SOCKETEVENTS.emit.tableCreated, {
            state: state,
            player: player,
            table: newTableData,
          });
      }
    } catch (error) {
      console.log("error creating table");
      throw new Error("Could not create table");
    }
  });

  // Handle "joinTable" event from client
  socket.on(
    SOCKETEVENTS.on.joinTable,
    async (table_id: number, playerInput: PlayerInput) => {
      // Implement the logic to join the specified table using the tableId
      // Call your existing "joinActiveTable" method here
      try {
        const table = await joinTable(app, table_id);

        if (table === -1) {
          app.socket.emit(SOCKETEVENTS.emit.serverError, {
            error: "Table not found",
          });
        } else {
          const player = await createUser(app, playerInput, table);
          const newTableData = await getTable(app, table_id);
          const state = await getGameState(app, table_id); // return 0 - betting round, 1 - no cards, 2 - 3 cards, 3 - 4 cards , 4 - 5 cards
          state &&
            newTableData &&
            app.socket.emit(SOCKETEVENTS.emit.tableJoined, {
              state: state,
              player: player,
              table: newTableData,
            });
          state &&
            newTableData &&
            player &&
            (await gameStateCallBack(app, table_id, player?.player_id, socket));
        }
      } catch (error) {
        console.log("error joining table");
        throw new Error("Could not join table");
      }
    }
  );
  socket.on(SOCKETEVENTS.on.intentionalDisconnect, async () => {
    console.log("User intentionally disconnected");
    // Perform actions like removing the user from the table
  });
  // ... (other event handlers)
  socket.on(
    SOCKETEVENTS.on.disconnect,
    async (player_id: string, table_id: string) => {
      await disconnectFromTable(app, parseInt(player_id));
      app.socket
        .in(`table_${table_id}`)
        .emit(SOCKETEVENTS.emit.disconnectedFromTable);
      console.log("A user disconnected");
    }
  );

  socket.on(
    SOCKETEVENTS.on.PlayerAction,
    async (
      player_id: number,
      table_id: number,
      playerInput: PlayerMoves,
      amount?: number
    ) => {
      const activeIndex = await getActivePlayerTurn(app, table_id);
      const player = await getPlayerInfo(app, player_id);
      const host = await getHost(app, table_id);
      if (
        (player?.playerTableOrderInstance?.order === activeIndex &&
          player?.player_id === player_id) ||
        host?.player_id === player_id
      ) {
        await setPlayerAction(
          app,
          player_id,
          table_id,
          playerInput,
          host?.player_id === player_id,
          amount
        );
        await gameStateCallBack(app, table_id, player_id, socket);
      } else {
        console.log("It is not the requestor's turn");
        throw new Error("It is not the requestor's turn");
      }
    }
  );
});

app.use(cors({ origin: true, credentials: true })); // cors settings

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 8080; // Set the default port to 3000 or use the one from .env

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
