import { Card, Player, PlayerTableOrderInstance, Value } from "@prisma/client";
import {
  PlayerActions,
  PlayerHandStrength,
  PlayingCard,
} from "../../Assets/Interfaces";
import { AppContext } from "../../Types/types";
export const checkIfThereIsOnlyOneElement = (arr: any) => {
  arr.sort();
  return arr[0] == arr[arr.length - 1];
};

// Function to shuffle an array (Fisher-Yates shuffle algorithm)
export const shuffleCards = (array: Card[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

/*
export const shuffleCards = (deckOfCards: PlayingCard[]) => {
  let copyofDeck = [...deckOfCards];
  for (var i = copyofDeck.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copyofDeck[i];
    copyofDeck[i] = copyofDeck[j];
    copyofDeck[j] = temp;
  }
  return copyofDeck;
};
*/

export const getNumberOfZeros = (arr: any): number => {
  let counter = 0;
  arr.map((item: any) => {
    if (item.order === 0) {
      counter = counter + 1;
    }
  });
  return counter;
};

export const checkIfCardsHaveBeenSet = async (
  app: AppContext,
  pokerTable_id: number
): Promise<boolean> => {
  try {
    const cards = await app.prisma.card.findMany({
      where: {
        pokerTable_id: pokerTable_id,
      },
    });
    // If cards are found, return true; otherwise, return false.
    return cards.length > 0;
  } catch (error) {
    console.error("Error checking if cards have been set:", error);
    // Handle the error appropriately, possibly by emitting an error event
    throw new Error("Error checking if cards have been set");
  }
};

export const determineWinnerFromHandStrength = (
  playerHandStrength: PlayerHandStrength[]
): number | PlayerHandStrength => {
  // help me determine the winner via handstrength
  //1. royal flush
  const royalFlushWinner = playerHandStrength.filter(
    (player: PlayerHandStrength) => {
      return player.royalFlush.hasRoyalFlush;
    }
  );

  if (royalFlushWinner.length > 0) {
    return royalFlushWinner[0];
  }
  //2. straightFlush
  const straightFlushWinner = playerHandStrength.filter(
    (player: PlayerHandStrength) => {
      return player.straightFlush.hasStraightFlush;
    }
  );

  if (straightFlushWinner.length > 0) {
    if (straightFlushWinner.length > 1) {
      let temp = sortByHighestValue(playerHandStrength, "straightFlush");
      return temp[temp.length - 1];
    } else {
      return straightFlushWinner[0];
    }
  }
  //3. quads
  const quadsWinner = playerHandStrength.filter(
    (player: PlayerHandStrength) => {
      return player.quads.hasQuads;
    }
  );
  if (quadsWinner.length > 0) {
    if (quadsWinner.length > 1) {
      let temp = sortByHighestValue(playerHandStrength, "quads");
      return temp[temp.length - 1];
    } else {
      return quadsWinner[0];
    }
  }
  // 4. full house
  const fullHouseWinner = playerHandStrength.filter(
    (player: PlayerHandStrength) => {
      return player.fullHouse.hasFullHouse;
    }
  );
  if (fullHouseWinner.length > 0) {
    if (fullHouseWinner.length > 1) {
      let temp = sortByHighestValue(playerHandStrength, "fullHouse");
      return temp[temp.length - 1];
    } else {
      return fullHouseWinner[0];
    }
  }
  // 5. flush
  const flushWinner = playerHandStrength.filter(
    (player: PlayerHandStrength) => {
      return player.flush.hasFlush;
    }
  );
  if (flushWinner.length > 0) {
    if (flushWinner.length > 1) {
      let temp = sortByHighestValue(playerHandStrength, "flush");
      return temp[temp.length - 1];
    } else {
      return flushWinner[0];
    }
  }
  // 6. straights
  const straightWinner = playerHandStrength.filter(
    (player: PlayerHandStrength) => {
      return player.straights.hasStraights;
    }
  );
  if (straightWinner.length > 0) {
    if (straightWinner.length > 1) {
      // TIE
      let temp = sortByHighestValue(playerHandStrength, "straights");
      return temp[temp.length - 1];
    } else {
      return straightWinner[0];
    }
  }
  // 7. 3 of kind
  const tripsWinner = playerHandStrength.filter(
    (player: PlayerHandStrength) => {
      return player.trips.hasTrips;
    }
  );
  if (tripsWinner.length > 0) {
    if (tripsWinner.length > 1) {
      let temp = sortByHighestValue(playerHandStrength, "trips");
      return temp[temp.length - 1];
    } else {
      return tripsWinner[0];
    }
  }
  // 8. pairs (TIE)
  const pairsWinners = playerHandStrength.filter(
    (player: PlayerHandStrength) => {
      return player.pairs.numberOPairs > 0;
    }
  );
  if (pairsWinners.length > 0) {
    if (pairsWinners.length > 0) {
      // Sort the players with pairs by the number of pairs and then by the highest pair value
      const sortedPairsWinners = pairsWinners.sort((a, b) => {
        // First, compare by the number of pairs
        if (a.pairs.numberOPairs > b.pairs.numberOPairs) {
          return -1; // a should come before b
        } else if (a.pairs.numberOPairs < b.pairs.numberOPairs) {
          return 1; // b should come before a
        } else {
          // If the number of pairs is the same, compare by the highest pair value
          if (a.pairs.highestValue > b.pairs.highestValue) {
            return -1; // a should come before b
          } else if (a.pairs.highestValue < b.pairs.highestValue) {
            return 1; // b should come before a
          } else {
            return 0; // They are equal in pairs and highest pair value
          }
        }
      });
      // The first player in sortedPairsWinners will be the winner (the one with the highest pairs or highest pair value in case of a tie)

      const pairsWinner = sortedPairsWinners[0];
      console.log(
        pairsWinner,
        tripsWinner,
        straightWinner,
        flushWinner,
        fullHouseWinner,
        quadsWinner,
        straightFlushWinner,
        royalFlushWinner
      );
      // TIE
      return pairsWinner;
      // Now you can work with the pairsWinner
    } else {
      return pairsWinners[0];
    }
  }

  return -1;
};

export function sortByHighestValue(
  array: PlayerHandStrength[],
  attribute: Exclude<keyof PlayerHandStrength, "royalFlush" | "player_id">
) {
  return array.slice().sort((a, b) => {
    const valueA = a[attribute].highestValue;
    const valueB = b[attribute].highestValue;

    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;
  });
}
