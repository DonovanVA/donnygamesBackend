import { Card } from "@prisma/client";
import { PlayingCard } from "../Assets/Interfaces";
import { AppContext } from "../Types/types";
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

export const getNumberOfZeros = (arr: any) => {
  let counter = 0;
  arr.map((item: number) => {
    if (item === 0) {
      counter = counter + 1;
    }
  });
  return counter;
};

export const checkIfCardsHaveBeenSet = async (
  app: AppContext,
  pokerTable_id: number
) => {
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
