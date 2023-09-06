import { GamePhase, PlayingCard } from "../Assets/Interfaces";
import { AppContext } from "../Types/types";
import { checkIfCardsHaveBeenSet, shuffleCards } from "./Utils";
import { playingCards } from "../Assets/Cards";
import { checkIfThereIsOnlyOneElement, getNumberOfZeros } from "./Utils";
import { Color, Suit, Value } from "@prisma/client";
// return 0 - betting round, 1 - no cards, 2 - 3 cards, 3 - 4 cards , 4 - 5 cards

export const getGameState = async (app: AppContext, pokerTable_id: number) => {
  try {
    // 1. function to check if everyone who has betted has the same amount bet to begin the flop
    // array of bets
    var betArray = [];
    // array of cards held by players
    var cardsArray = [];
    // players
    const players = await getActivePlayers(app, pokerTable_id);
    // table
    const table = await getTable(app, pokerTable_id);
    // number of cards on the table
    const numberOfCards = table?.cards.length;
    // configuring the players and the table
    for (let i = 0; i < players.length; i++) {
      betArray.push(players[i].bet);
    }
    for (let j = 0; j < players.length; j++) {
      cardsArray.push(players[j]);
    }

    // BETTING ROUND if betting is not equal or there are no bets, continue with betting round
    if (!checkIfThereIsOnlyOneElement(betArray) || betArray.length !== 0) {
      return GamePhase.BETTINGROUND;
    }

    //2. if bets are all equal, then
    else {
      switch (numberOfCards) {
        case 0:
          return GamePhase.FIRSTFLOP; // draw 3 cards
        case 3:
          return GamePhase.SECONDFLOP; // draw 1 card
        case 4:
          return GamePhase.THIRDFLOP; // draw 1 card
        case 5:
          return GamePhase.ENDING; // reveal all cards
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
export const getTable = async (app: AppContext, pokerTable_id: number) => {
  try {
    const table = await app.prisma.pokerTable.findUnique({
      where: {
        pokerTable_id: pokerTable_id,
      },
      include: {
        players: {
          include: {
            cards: true,
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

export const getHost = async (app: AppContext, pokerTable_id: number) => {
  try {
    const host = await app.prisma.pokerTable.findFirst({
      where: {
        pokerTable_id: pokerTable_id,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Could not get the host");
  }
};
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
//
export const setNextActiveIndex = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    const pokerTable = await getTable(app, pokerTable_id);

    const numPlayers = pokerTable?.players.length;
    // last index => set the next index to 0
    if (
      numPlayers &&
      pokerTable?.activeIndex &&
      pokerTable?.activeIndex > numPlayers - 2
    ) {
      const updateIndex = await app.prisma.pokerTable.update({
        where: {
          pokerTable_id: pokerTable_id,
        },
        data: {
          activeIndex: 0,
        },
      });
    } else {
      const updateIndex = await app.prisma.pokerTable.update({
        where: {
          pokerTable_id: pokerTable_id,
        },
        data: {
          activeIndex: {
            increment: 1,
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// TBD - rotate order after the end of each round
export const setRotateOrder = async (
  app: AppContext,
  pokerTable_id: number
) => {};

export const setOrder = async (app: AppContext, pokerTable_id: number) => {
  try {
    const orders = await getOrders(app, pokerTable_id);
    const nPlayers = orders?.length;
    // Check if any player has an order of 0
    if (getNumberOfZeros(orders) > 0) {
      // Get all players in the poker table
      const players = await app.prisma.player.findMany({
        where: {
          pokerTable_id: pokerTable_id,
        },
      });

      // Sort players by player_id to ensure consistent order assignment
      players.sort((a, b) => a.player_id - b.player_id);

      // Set orders from 1 to n
      for (let i = 0; i < players.length; i++) {
        await app.prisma.playerTableOrderInstance.update({
          where: {
            player_id: players[i].player_id,
            pokerTable_id: pokerTable_id,
          },
          data: {
            order: i - 1 + 1,
          },
        });
      }
    }
    // rotate order
  } catch (error) {
    console.log(error);
    throw new Error("Could not set the order for players");
  }
};

export const setBlinds = async (app: AppContext, pokerTable_id: number) => {
  try {
    const pokerTable = await app.prisma.pokerTable.findFirst({
      where: {
        pokerTable_id: pokerTable_id,
      },
      include: {
        players: true,
      },
    });

    if (!pokerTable?.players) {
      console.log("error setting blinds");
      return;
    }

    const smallBlindAmount = 20;
    const bigBlindAmount = 40;

    if (pokerTable?.players.length < 2) {
      console.log("cannot set blinds due to not enough players");
      return;
    }

    if (pokerTable?.players.length >= 2) {
      await setBlind(app, 0, smallBlindAmount, pokerTable_id);
      await setBlind(app, 1, bigBlindAmount, pokerTable_id);
    }

    for (let order = 1; order < pokerTable?.players.length - 1; order++) {
      await setBlind(app, order, smallBlindAmount, pokerTable_id);
      await setBlind(app, order + 1, bigBlindAmount, pokerTable_id);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not set the blinds");
  }
};

export const setBlind = async (
  app: AppContext,
  order: number,
  betAmount: number,
  pokerTable_id: number
) => {
  try {
    await app.prisma.player.updateMany({
      where: {
        pokerTable_id: pokerTable_id,
        playerTableOrderInstance: {
          order: order,
        },
      },
      data: {
        bet: betAmount,
        cash: {
          decrement: betAmount,
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Could not set blind");
  }
};
//
export const setBet = async (
  app: AppContext,
  player_id: number,
  pokerTable_id: number,
  bet: number
) => {
  try {
    const playerInfo = await getPlayerInfo(app, player_id);

    if (playerInfo && bet > playerInfo?.cash) {
      throw new Error("Bet amount exceeds available cash");
    } else {
      const placeBets = await app.prisma.player.update({
        where: {
          player_id: player_id,
          pokerTable_id: pokerTable_id,
        },
        data: {
          bet: bet,
          cash: {
            decrement: bet,
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not place the bet");
  }
};
//
export const setFold = async (
  app: AppContext,
  player_id: number,
  pokerTable_id: number
) => {
  try {
    const fold = await app.prisma.playerTableOrderInstance.update({
      where: {
        player_id: player_id,
        pokerTable_id: pokerTable_id,
      },
      data: {
        folded: true,
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Could not fold");
  }
};
//
export const setBuyIn = async (
  app: AppContext,
  player_id: number,
  pokerTable_id: number,
  amount: number
) => {
  try {
    const buyIn = await app.prisma.player.update({
      where: {
        pokerTable_id: pokerTable_id,
        player_id: player_id,
      },
      data: {
        totalBuyIn: {
          increment: amount,
        },
        cash: {
          increment: amount,
        },
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Could not buy in");
  }
};

export const setCards = async (app: AppContext, pokerTable_id: number) => {
  try {
    // Define a mapping from your playingCards to the format expected by Prisma
    const cardData = playingCards.map((card: PlayingCard) => {
      return {
        faceDown: true,
        suit: card.suit as Suit,
        value: card.name as Value,
        pokerTable_id: pokerTable_id,
        color: card.isRed ? Color.RED : Color.BLACK,
      };
    });

    // Use Prisma's createMany method to insert the cards into the database
    const createdCards = await app.prisma.card.createMany({
      data: cardData,
    });

    console.log(`Created cards.`);
  } catch (error) {
    console.error("Error creating cards:", error);
    // Handle the error appropriately, possibly by emitting an error event
    throw new Error("Error creating cards");
  }
};

export const setFlopCards = async (
  app: AppContext,
  pokerTable_id: number,
  numberOfCards: number
) => {
  try {
    // Get all cards in the specified poker table
    const cards = await app.prisma.card.findMany({
      where: {
        pokerTable_id: pokerTable_id,
        playerId: null,
        faceDown: true,
      },
    });

    // Create an array of indices representing all cards
    const cardIndices = Array.from(
      { length: cards.length },
      (_, index) => index
    );

    // Shuffle the array of indices randomly
    for (let i = cardIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardIndices[i], cardIndices[j]] = [cardIndices[j], cardIndices[i]];
    }

    // Select the first `numberOfCards` indices
    const indicesToSetFaceDown = cardIndices.slice(0, numberOfCards);

    // Update the corresponding cards to have faceDown as true
    for (const index of indicesToSetFaceDown) {
      await app.prisma.card.update({
        where: {
          card_id: cards[index].card_id,
        },
        data: {
          faceDown: false,
        },
      });
    }

    console.log(`${numberOfCards} cards set to faceDown: false.`);
  } catch (error) {
    console.log(error);
    console.error("Error setting faceDown cards:", error);
    // Handle the error and emit an error event if needed
  }
};
// this function will always have to be called before the game starts
export const setDealCards = async (app: AppContext, pokerTable_id: number) => {
  try {
    // Check if cards have been set
    const cardsHaveBeenSet = await checkIfCardsHaveBeenSet(app, pokerTable_id);

    if (!cardsHaveBeenSet) {
      throw new Error("Cards have not been set. Cannot deal cards.");
    }

    // Retrieve the players associated with the poker table
    const players = await app.prisma.player.findMany({
      where: {
        pokerTable_id: pokerTable_id,
      },
    });
    // Retrieve the deck of cards on the table
    const tableCards = await app.prisma.card.findMany({
      where: {
        pokerTable_id: pokerTable_id,
        playerId: null, // Cards that have not been assigned to any player
      },
    });
    // Ensure that there are enough cards on the table to deal (at least 2 cards per player)
    if (tableCards.length < players.length * 2) {
      throw new Error("Not enough cards on the table to deal.");
    }
    // Distribute the cards to the players

    // Shuffle the deck of cards on the table (optional but recommended)
    shuffleCards(tableCards);
    // Distribute 2 cards to each player
    for (const player of players) {
      const playerCards = tableCards.splice(0, 2); // Remove 2 cards from the deck
      for (const card of playerCards) {
        // Update the card's playerId to associate it with the player
        await app.prisma.card.update({
          where: { card_id: card.card_id },
          data: {
            playerId: player.player_id,
            faceDown: true, // You can set this based on game rules
          },
        });
      }
      // Update the player's cards field with the assigned cards
      await app.prisma.player.update({
        where: { player_id: player.player_id },
        data: {
          cards: {
            connect: playerCards.map((card) => ({ card_id: card.card_id })),
          },
        },
      });
    }

    console.log("Cards have been dealt to players.");
  } catch (error) {
    console.error("Error dealing cards:", error);
    // Handle the error appropriately, possibly by emitting an error event
    throw new Error("Error dealing cards");
  }
};

export const setRevealCards = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    await app.prisma.card.updateMany({
      where: {
        pokerTable_id,
      },
      data: {
        faceDown: false,
      },
    });
  } catch (error) {
    console.log("Could not reveal cards");
    throw new Error("Could not reveal cards");
  }
};

// this function ends the game and removes the resources from the database
export const setEndGame = async (app: AppContext, pokerTable_id: number) => {
  try {
    // Get the table information
    const tableInfo = await getTable(app, pokerTable_id);

    if (!tableInfo) {
      throw new Error("Table not found");
    }

    // Delete the poker table from the database
    const removeTable = await app.prisma.pokerTable.delete({
      where: {
        pokerTable_id: pokerTable_id,
      },
    });

    if (removeTable) {
      return tableInfo;
    }
  } catch (error) {
    // Handle the error appropriately, possibly by emitting an error event
    console.log(error);
    throw new Error("Error ending game");
  }
};
// TBD - set winner
export const setWinner = async (app: AppContext, pokerTable_id: number) => {};
