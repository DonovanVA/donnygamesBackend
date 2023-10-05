import { Socket } from "socket.io"; // Import the appropriate type for Socket from your dependencies
import { AppContext, PlayerMoves, User } from "../Types/types";
import { SOCKETEVENTS } from "../SocketManager/events";
import { PlayerInput } from "../Assets/Interfaces";
import { getTable } from "./Lib/Getters";
import { setOrder, setRotateOrder } from "./Lib/TurnOrderManagement";
import { BettingRound } from "@prisma/client";
import {
  setBettingRound,
  setEndGame,
  setCards,
  setBlinds,
  setDealCards,
  foldThePlayersThatCannotPlay,
} from "./Lib/GameFlow";
import { checkIfCanRaise, setBet, setBuyIn, setFold } from "./Lib/PlayerAction";

// this function creates a user
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
    const isHost = !existingHost;
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
        playerTableOrderInstance: {
          create: {
            order: 0, // Initialize the order to 0 (or the appropriate value)
            isHost: isHost,
            pokerTable_id: table.pokerTable_id,
            hasBetted: false,
          },
        },
      },
      include: {
        playerTableOrderInstance: true,
      },
    });

    // Determine if the newUser should be the host

    // Emit the userCreated event with the newUser's ID
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    // Handle the error and emit an error event if needed
  }
};
// this function disconnects a user from the table
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
      console.log("player disconnected clean up successful");
    }
  } catch (error) {
    console.error("Error disconnecting from table:", error);
    // Handle the error and emit an error event if needed
  }
};
// this function creates a new table and socket instance
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

// this function connects a user to a table and an active socket instance
export const joinTable = async (app: AppContext, table_id: number) => {
  try {
    // Find the PokerTable to join
    const pokerTable = await app.prisma.pokerTable.findUnique({
      where: { pokerTable_id: table_id },
    });
    if (!pokerTable) {
      return -1;
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
// this function starts the game
export const startGame = async (app: AppContext, table_id: number) => {
  // Add logic to start the game here
  // For example, deal cards and set blinds
  try {
    const table = await getTable(app, table_id);

    if (table && table?.players.length < 2) {
      throw new Error("Not enough players to start the game");
    }
    // 1. fold the players that cannot play the game
    await foldThePlayersThatCannotPlay(app, table_id);
    // 2. set the orders of the players
    await setOrder(app, table_id);
    // 3. set the blinds
    await setBlinds(app, table_id);
    // 4. set the cards for the game
    await setCards(app, table_id);
    // 5. deal the cards to the players
    await setDealCards(app, table_id);
    // 6. set the betting round
    await setBettingRound(app, table_id, BettingRound.FIRSTBETTINGROUND);
  } catch (error) {
    console.log(error);
    //throw new Error("Error starting game");
  }
};
// this function deletes the game and closes the socket instance
export const endGame = async (app: AppContext, table_id: number) => {
  // delete the table and close the socket connection
  try {
    setEndGame(app, table_id);
  } catch (error) {
    console.log(error);
    throw new Error("Error ending game and closing socket");
  }
};
// this function sets the next round of an existing game in an existing socket instance
export const setNextRound = async (app: AppContext, table_id: number) => {
  // rotate order and set Blinds again
  try {
    // 1. fold the players that cannot play the game
    await foldThePlayersThatCannotPlay(app, table_id);
    // 2. shift the order by 1
    await setRotateOrder(app, table_id);
    // 3. set the blinds
    await setBlinds(app, table_id);
    // 4. set the cards for the game
    await setCards(app, table_id);
    // 5. deal the cards to the players
    await setDealCards(app, table_id);
    // 6. set the betting round
    await setBettingRound(app, table_id, BettingRound.FIRSTBETTINGROUND);
  } catch (error) {
    console.log(error);
    throw new Error("Error setting next round game");
  }
};

// this function sets the player's action for the game
export const setPlayerAction = async (
  app: AppContext,
  player_id: number,
  table_id: number,
  playerMove: PlayerMoves,
  host: boolean,
  amount?: number
) => {
  if (playerMove === PlayerMoves.BET && amount && amount > 0) {
    await setBet(app, player_id, table_id, amount, false); // working
  } else if (playerMove === PlayerMoves.BET) {
    await setBet(app, player_id, table_id, 0, false); // working
  } else if (playerMove === PlayerMoves.BUYIN && amount) {
    await setBuyIn(app, player_id, table_id, amount); // working
  } else if (playerMove === PlayerMoves.FOLD) setFold(app, player_id, table_id);
  else if (playerMove === PlayerMoves.STARTGAME && host) {
    await startGame(app, table_id); // working
  } else if (playerMove === PlayerMoves.ENDGAME && host) {
    await endGame(app, table_id); // working
  } else if (playerMove === PlayerMoves.NEXTROUND) {
    await setNextRound(app, table_id);
  } else {
    console.log("Invalid player move");
    //throw new Error("Invalid move");
  }
};
