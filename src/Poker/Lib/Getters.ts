import { GamePhase, PlayerHandStrength } from "../../Assets/Interfaces";
import { AppContext } from "../../Types/types";

import { checkIfThereIsOnlyOneElement } from "./Utils";

// **Getters** //
// this function gets the orders of all of the players
export const getOrders = async (app: AppContext, pokerTable_id: number) => {
  try {
    const table = await app.prisma.pokerTable.findUnique({
      where: {
        pokerTable_id: pokerTable_id,
      },
      include: {
        playerTableOrderInstance: true,
      },
    });

    return table?.playerTableOrderInstance;
  } catch (error) {
    console.log(error);
    throw new Error("Could not get the orders of the players");
  }
};
// get the players who have not folded
export const getActivePlayers = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    const players = await app.prisma.player.findMany({
      where: {
        pokerTable_id: pokerTable_id,
      },
      include: {
        cards: true,
        playerTableOrderInstance: {
          where: {
            folded: false,
          },
        },
      },
    });
    return players;
  } catch (error) {
    console.log(error);
    throw new Error("Could not get the active players");
  }
};

// this function gets the gameState and is used closely with the callback function
export const getGameState = async (app: AppContext, pokerTable_id: number) => {
  try {
    // 1. function to check if everyone who has betted has the same amount bet to begin the flop
    // array of bets

    var betArray = [];
    var nonFoldedPlayers = 0;
    // array of cards held by players
    var cardsArray = [];
    // players
    const players = await getActivePlayers(app, pokerTable_id);
    // table
    const table = await getTable(app, pokerTable_id);
    // number of cards on the table

    // push the bet array of players whose still playing: bet > 0
    for (let i = 0; i < players.length; i++) {
      if (players[i].bet > 0) {
        betArray.push(players[i].bet);
      }
      if (!players[i].playerTableOrderInstance?.folded) {
        nonFoldedPlayers = nonFoldedPlayers + 1;
      }
    }
    if (
      table?.bettingRound === GamePhase.BEGINNING ||
      table?.bettingRound === GamePhase.ENDING
    ) {
      return table?.bettingRound;
    }
    // BETTING ROUND if betting is not equal or there are no bets, continue with betting round
    console.log(betArray);
    if (
      !checkIfThereIsOnlyOneElement(betArray) ||
      betArray.length !== nonFoldedPlayers
    ) {
      return table?.bettingRound;
    }

    //2. if bets are all equal, then
    else {
      switch (table?.bettingRound) {
        case GamePhase.FIRSTBETTINGROUND:
          return GamePhase.FIRSTFLOP; // trigger draw 3 cards

        case GamePhase.SECONDBETTINGROUND:
          return GamePhase.SECONDFLOP; // trigger draw 1 card

        case GamePhase.THIRDBETTINGROUND:
          return GamePhase.THIRDFLOP; // trigger draw 1 card

        case GamePhase.FINALBETTINGROUND:
          return GamePhase.ENDING;
        default:
          console.log("Invalid number of cards");
          return -1;
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not get the state of the game");
  }
};
// this function gets the table
export const getTable = async (app: AppContext, pokerTable_id: number) => {
  try {
    const table = await app.prisma.pokerTable.findUnique({
      where: {
        pokerTable_id: pokerTable_id,
      },
      include: {
        sidePot: true,
        players: {
          include: {
            cards: true,
            playerTableOrderInstance: true,
          },
        },
        cards: true,
        playerTableOrderInstance: true,
      },
    });
    return table;
  } catch (error) {
    console.log(error);
    throw new Error("table not found");
  }
};

// this function is called to get the index of the player who is currently at his turn
export const getActivePlayerTurn = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    const table = await getTable(app, pokerTable_id);

    return table?.activeIndex;
  } catch (error) {
    console.log(error);
    throw new Error("Could not get the active player's turn");
  }
};
// this function is called to get the player's info
export const getPlayerInfo = async (app: AppContext, player_id: number) => {
  try {
    const player = await app.prisma.player.findFirst({
      where: {
        player_id: player_id,
      },
      include: {
        playerTableOrderInstance: true,
      },
    });
    return player;
  } catch (error) {
    console.log(error);
    throw new Error("Could not get the player info");
  }
};
// this function is called to get the host
export const getHost = async (app: AppContext, pokerTable_id: number) => {
  try {
    const host = await app.prisma.player.findFirst({
      where: {
        pokerTable_id: pokerTable_id,
        playerTableOrderInstance: {
          isHost: true,
        },
      },
    });
    return host;
  } catch (error) {
    console.log(error);
    throw new Error("Could not get the host");
  }
};
// this function is called to get the active turn of the person
export const getActiveIndex = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    const pokerTable = await getTable(app, pokerTable_id);
    return pokerTable?.activeIndex;
  } catch (error) {
    console.log(error);
    throw new Error("Could not get the active index");
  }
};
