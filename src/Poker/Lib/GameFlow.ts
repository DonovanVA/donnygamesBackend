import { AppContext } from "../../Types/types";
import {
  DefaultCardDeck,
  BettingRound,
  Suit,
  Value,
  Card,
  Player,
} from "@prisma/client";
import {
  checkIfCardsHaveBeenSet,
  shuffleCards,
  determineWinnerFromHandStrength,
} from "./Utils";
import { getTable } from "./Getters";
import { PlayerHandStrength } from "../../Assets/Interfaces";
import { cardValue } from "./HandStrength";
import { getActivePlayers } from "./Getters";
import { combinedHandStrength } from "./HandStrength";

// this function is to check if the players meet the minimum requirements to play the game (big blind, in the future can include side pot)
const SMALLBLINDAMOUNT = 20;
const BIGBLINDAMOUNT = 40;
export const foldThePlayersThatCannotPlay = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    const table = await getTable(app, pokerTable_id);

    if (table) {
      //1. unfold all players
      const unfoldPlayer = await app.prisma.playerTableOrderInstance.updateMany(
        {
          where: {
            pokerTable_id: pokerTable_id,
          },

          data: {
            folded: false,
          },
        }
      );
      //2. fold those that cannot play
      const updatePlayer = await app.prisma.playerTableOrderInstance.updateMany(
        {
          where: {
            pokerTable_id: pokerTable_id,
            player: {
              cash: {
                lte: BIGBLINDAMOUNT - 1,
              },
            },
          },

          data: {
            folded: true,
          },
        }
      );
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not fold ineligible players");
  }
};

// this function is called upon the beginning of every game to set the blinds
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

    if (pokerTable?.players.length < 2) {
      console.log("cannot set blinds due to not enough players");
      return;
    }

    if (pokerTable?.players.length == 2) {
      await setBlind(app, 1, SMALLBLINDAMOUNT, pokerTable_id);
      await setBlind(app, 2, BIGBLINDAMOUNT, pokerTable_id);
    } else {
      await setBlind(app, 2, SMALLBLINDAMOUNT, pokerTable_id);
      await setBlind(app, 3, BIGBLINDAMOUNT, pokerTable_id);
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not set the blinds");
  }
};
// this function is called to set the blind of a player
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

// this function is called whenever a betting round ends, moves the bets to the pot
export const moveBetsToPot = async (app: AppContext, pokerTable_id: number) => {
  try {
    // Get the current poker table
    const pokerTable = await app.prisma.pokerTable.findFirst({
      where: { pokerTable_id: pokerTable_id },
      include: {
        sidePot: true,
        players: {
          include: {
            cards: true, // Include player's cards
            playerTableOrderInstance: true, // Include player's order instance
          },
        },
      },
    });
    const activePlayers = await getActivePlayers(app, pokerTable_id);
    if (!pokerTable) {
      throw new Error("Poker table not found");
    }

    // Calculate the total bets for the current betting round
    const totalBets = pokerTable.players.reduce((sum, player) => {
      return sum + player.bet;
    }, 0);
    // side pot
    // if a player bets his bets all his cash, create a side pot
    // Check if any player has bet their entire cash bet
    const playersBettingAllIn = pokerTable.players.filter((player) => {
      return player.bet === player.cash;
    });

    if (playersBettingAllIn.length > 0) {
      const sidePotAmount = playersBettingAllIn[0].bet * activePlayers.length;
      const remaining_bets = totalBets - sidePotAmount;

      // shift the main pot amount to the side pot, the remaining amounts of the betting round will be moved to the mainpot

      await app.prisma.pokerTable.update({
        where: { pokerTable_id: pokerTable_id },
        data: {
          pot: remaining_bets,
        },
      });
      let arrayOfPlayerId = [];
      for (let i = 0; i < playersBettingAllIn.length; i++) {
        arrayOfPlayerId.push(playersBettingAllIn[i].bet);
      }
      // the player_id indicates the players that will be excluded from the main pot, and can only receive these earnings
      const sidePot = await app.prisma.sidePot.create({
        data: {
          pokerTable_id: pokerTable_id,
          amount: pokerTable.pot + sidePotAmount,
          player_id: arrayOfPlayerId,
          order: pokerTable.sidePot.length + 1,
        },
      });
    } else {
      // Update the pot with the total bets
      await app.prisma.pokerTable.update({
        where: { pokerTable_id: pokerTable_id },
        data: {
          pot: pokerTable.pot + totalBets,
        },
      });

      await app.prisma.player.updateMany({
        where: {
          pokerTable_id: pokerTable_id,
        },
        data: {
          bet: 0,
        },
      });
    }

    console.log("Bets moved to the pot successfully");
  } catch (error) {
    console.error("Error moving bets to the pot:", error);
  }
};
// this function sets the cards for the game while removing data of all previous cards
export const setCards = async (app: AppContext, pokerTable_id: number) => {
  try {
    const cards = await app.prisma.defaultCardDeck.findMany({});
    // Define a mapping from your playingCards to the format expected by Prisma
    // remove all the cards from the table
    const deleteAllCards = await app.prisma.card.deleteMany({
      where: {
        pokerTable_id: pokerTable_id,
      },
    });
    // then configure and create the new cards
    const cardData = cards.map((card: DefaultCardDeck) => {
      return {
        faceDown: true,
        suit: card.suit as Suit,
        value: card.value as Value,
        pokerTable_id: pokerTable_id,
        color: card.color,
        image_url_front: card.image_url_front,
        image_url_back: card.image_url_back,
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
// this function displays the cards onto the table
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
// this function sets the round of the game
export const setBettingRound = async (
  app: AppContext,
  pokerTable_id: number,
  bettingRound: BettingRound
) => {
  try {
    const updatedTable = await app.prisma.pokerTable.update({
      where: {
        pokerTable_id: pokerTable_id,
      },
      data: {
        bettingRound: bettingRound,
        numRaises: 0,
      },
    });
  } catch (error) {
    console.log("could not set the game state");
    throw new Error("Could not set the game state");
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
    const players = await getActivePlayers(app, pokerTable_id);
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
// this function reveals all the cards from the player's hands, defined as cards that have a player_id and is not face down
export const setRevealCards = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    await app.prisma.card.updateMany({
      where: {
        pokerTable_id: pokerTable_id,
        NOT: {
          player: null,
        },
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
// this function sets the winner and allocates the winnings
export const setWinner = async (app: AppContext, pokerTable_id: number) => {
  try {
    // 1.  get active players and the table cards
    const activePlayers = await getActivePlayers(app, pokerTable_id);
    const table = await getTable(app, pokerTable_id);
    if (!table) {
      throw new Error("Table not found");
    }
    let winnerId = 0;
    let arrayOfHandStrength: PlayerHandStrength[] = [];
    // 2. get river cards

    let copyOfTableCards = table.cards.filter((card: Card) => {
      return card.faceDown === false && card.playerId == null;
    });

    // 3. store the handstrength of each player in an array of jsons
    if (activePlayers && activePlayers.length > 0 && table?.cards) {
      for (let i = 0; i < activePlayers.length; i++) {
        arrayOfHandStrength.push({
          player_id: activePlayers[i].player_id,
          ...(await combinedHandStrength(
            copyOfTableCards,
            activePlayers[i].cards
          )),
        });
      }
    }
    console.log(arrayOfHandStrength);
    // 5. find the winner
    if (
      typeof determineWinnerFromHandStrength(arrayOfHandStrength) === "number"
    ) {
      const cards = await app.prisma.card.findMany({
        where: {
          pokerTable_id: pokerTable_id,
          faceDown: false,
        },
      });
      let temp = cards.slice();
      temp.sort((card1: Card, card2: Card) => {
        const value1 = cardValue(card1);
        const value2 = cardValue(card2);
        return value1 - value2;
      });

      winnerId = temp[temp.length - 1]?.playerId as number;
    } else {
      winnerId = (
        determineWinnerFromHandStrength(
          arrayOfHandStrength
        ) as PlayerHandStrength
      )?.player_id;
    }

    // 5. allocate the winnings and update the pot back to 0
    // Get the current poker table with side pots
    const pokerTable = await app.prisma.pokerTable.findFirst({
      where: { pokerTable_id: pokerTable_id },
      include: {
        sidePot: true,
        players: true,
      },
    });

    if (!pokerTable) {
      throw new Error("Poker table not found");
    }

    // Calculate the total pot for the main pot and all side pots
    const totalPot =
      pokerTable.pot +
      pokerTable.sidePot.reduce((sum, sidePot) => sum + sidePot.amount, 0);

    ////////////// Side pot for winners that have side pots
    // Check if the winner is in any side pot
    const relevantSidePots = pokerTable.sidePot.find((sidePot) => {
      return sidePot.player_id.includes(winnerId);
    });

    // Calculate the total amount to add based on lower-order side pots he belongs to
    let totalAmountToAdd = 0;
    if (relevantSidePots) {
      for (let i = 0; i < pokerTable.sidePot.length; i++) {
        if (pokerTable.sidePot[i].order <= relevantSidePots?.order) {
          totalAmountToAdd = totalAmountToAdd + pokerTable.sidePot[i].amount;
        }
      }
    }

    // winner has alled in and has side pot
    if (totalAmountToAdd > 0 && relevantSidePots) {
      await app.prisma.player.update({
        where: {
          player_id: winnerId,
        },
        data: {
          cash: {
            increment: totalAmountToAdd,
          },
        },
      });
    }
    ////////////// Side pot for winners that have side pots
    // winner is not part of any side pot
    else {
      await app.prisma.player.update({
        where: {
          player_id: winnerId,
        },
        data: {
          cash: {
            increment: totalPot,
          },
        },
      });
    }

    console.log("Winnings allocated successfully");
    return winnerId;
  } catch (error) {
    // Handle the error appropriately, possibly by emitting an error event
    console.log(error);
    throw new Error("Error determining winner");
  }
};
// check if there is only 1 player left, return the id if true
export const endGameIfThereIsOnlyOnePlayerLeft = async (
  app: AppContext,
  pokerTable_id: number
) => {
  const activePlayers = await getActivePlayers(app, pokerTable_id);
  const table = await getTable(app, pokerTable_id);
  if (activePlayers.length === 1) {
    const winner = await app.prisma.player.update({
      where: {
        player_id: activePlayers[0].player_id,
      },
      data: {
        cash: {
          increment: table?.pot,
        },
      },
    });
    const updatedTable = await app.prisma.pokerTable.update({
      where: {
        pokerTable_id: pokerTable_id,
      },
      data: {
        pot: 0,
      },
    });
    return activePlayers[0].player_id;
  } else {
    return 0;
  }
};

export const checkIfNeedToShowAllCards = async (
  app: AppContext,
  pokerTable_id: number
) => {
  const activePlayers = await getActivePlayers(app, pokerTable_id);
  let temp = activePlayers.slice();
  temp = activePlayers.filter((player: Player) => {
    return player.cash === 0;
  });
  if (activePlayers.length - temp.length < 2) {
    return true;
  } else {
    false;
  }
};
