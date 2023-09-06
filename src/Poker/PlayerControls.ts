import { Socket } from "socket.io"; // Import the appropriate type for Socket from your dependencies
import { AppContext, PlayerMoves, User } from "../Types/types";
import { SOCKETEVENTS } from "../SocketManager/events";
import { PlayerInput } from "../Assets/Interfaces";
import {
  setBet,
  setBuyIn,
  setFold,
  setDealCards,
  setBlinds,
  setEndGame,
  setCards,
  getTable,
} from "./ClassFunctions";
import { BettingRound } from "@prisma/client";

// Define your event handler methods here
const SMALL_BLIND = 20;
const BIG_BLIND = 40;

/**
 * This function creates a user
 */
export const createUser = async (
  app: AppContext,
  playerInput: PlayerInput,
  table: any
) => {
  try {
    // Check if there is already a host in the game
    const existingHost = await app.prisma.playerTableOrderInstance.findFirst({
      where: { pokerTable_id: table.pokerTable_id, isHost: true },
    });

    // Create a new user entry in the database
    const newUser = await app.prisma.player.create({
      data: {
        name: playerInput.name,
        cash: 1000,
        totalBuyIn: 1000,
        bet: 0,
        pokerTable: {
          connect: { pokerTable_id: table.pokerTable_id }, // Connect the user to the existing pokerTable using its ID
        },
      },
    });

    // Determine if the newUser should be the host
    const isHost = !existingHost;

    // Create a PlayerTableOrderInstance entry for the newUser
    await app.prisma.playerTableOrderInstance.create({
      data: {
        player_id: newUser.player_id,

        pokerTable_id: table.pokerTable_id,
        order: 0, // Initialize the order to 0 (or the appropriate value)
        isHost: isHost,
      },
    });

    // Emit the userCreated event with the newUser's ID
    return newUser;
    //app.socket.emit(SOCKETEVENTS.emit.userCreated, newUser.player_id);
  } catch (error) {
    console.error("Error creating user:", error);
    // Handle the error and emit an error event if needed
  }
};
/**
 *  This function disconnects a table
 */
export const disconnectFromTable = async (
  app: AppContext,
  playerId: number
) => {
  try {
    // Find the player's PokerTable

    const player = await app.prisma.player.findUnique({
      where: { player_id: playerId },
      include: { pokerTable: true },
    });

    if (player && player.pokerTable) {
      const tableId = player.pokerTable.pokerTable_id;

      // Remove the player's cards from the database
      await app.prisma.card.deleteMany({
        where: { playerId: player.player_id },
      });

      // If only one player is left, delete the PokerTable
      const remainingPlayers = await app.prisma.player.count({
        where: { pokerTable_id: tableId },
      });

      if (remainingPlayers === 1) {
        await app.prisma.pokerTable.delete({
          where: { pokerTable_id: tableId },
        });
      }

      // Leave the socket room and emit the disconnectedFromTable event
      app.socket.leave(`table_${tableId}`);
      app.socket.emit(SOCKETEVENTS.emit.disconnectedFromTable);
      console.log("player disconnected clean up successful");
    }
  } catch (error) {
    console.error("Error disconnecting from table:", error);
    // Handle the error and emit an error event if needed
  }
};
/**
 *
 * This function creates a table and then joins it
 * @returns table object
 */
export const createTable = async (app: AppContext) => {
  try {
    // Create a new PokerTable entry in the database
    const pokerTable = await app.prisma.pokerTable.create({
      data: {
        // You can add more properties here if needed
        pot: 0, // Initialize the pot to 0
        activeIndex: 0,
        bettingRound: BettingRound.BEGINNING,
      },
    });
    console.log("Creating table");

    // Emit the tableCreated event with the newTable's ID

    console.log("Table created, joining...");
    app.socket.join(`table_${pokerTable.pokerTable_id}`);
    console.log("Successfully joined");
    return pokerTable;
  } catch (error) {
    console.error("Error creating table:", error);
    // Handle the error and emit an error event if needed
  }
};
/**
 *  This function joins a table
 *  @returns table object
 */

export const joinTable = async (app: AppContext, table_id: number) => {
  try {
    // Find the PokerTable to join
    const pokerTable = await app.prisma.pokerTable.findUnique({
      where: { pokerTable_id: table_id },
    });

    if (!pokerTable) {
      console.error("Table not found");
      return;
    }

    // Emit the playerJoined event
    app.socket.join(`table_${pokerTable.pokerTable_id}`);
    console.log("Player joined the table");
    return pokerTable;
  } catch (error) {
    console.error("Error joining table:", error);
    // Handle the error and emit an error event if needed
  }
};

export const startGame = async (app: AppContext, table_id: number) => {
  // Add logic to start the game here
  // For example, deal cards and set blinds
  try {
    const table = await getTable(app, table_id);

    if (table && table?.players.length < 2) {
      throw new Error("Not enough players to start the game");
    }

    await setBlinds(app, table_id);
    await setCards(app, table_id);
    await setDealCards(app, table_id);
  } catch (error) {
    console.log(error);
    throw new Error("Error starting game");
  }
};

export const endGame = async (app: AppContext, table_id: number) => {
  // Add logic to end the game here
  // For example, determine the winner, distribute chips, and reset the game state
  try {
    setEndGame(app, table_id);
  } catch (error) {
    console.log(error);
    throw new Error("Error ending game and closing socket");
  }
};

// implements check hand fold hand etc
export const setPlayerAction = async (
  app: AppContext,
  player_id: number,
  table_id: number,
  playerMove: PlayerMoves,
  amount?: number
) => {
  console.log(playerMove);
  if (playerMove === PlayerMoves.BET && amount) {
    setBet(app, player_id, table_id, amount); // working
  } else if (playerMove === PlayerMoves.BUYIN && amount) {
    setBuyIn(app, player_id, table_id, amount); // working
  } else if (playerMove === PlayerMoves.FOLD) setFold(app, player_id, table_id);
  else if (playerMove === PlayerMoves.STARTGAME) {
    startGame(app, table_id); // working
  } else if (playerMove === PlayerMoves.ENDGAME) {
    endGame(app, table_id); // working
  } else {
    console.log("Invalid player move");
    throw new Error("Invalid move");
  }
};

