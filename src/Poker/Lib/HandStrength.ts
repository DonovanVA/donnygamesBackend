import { Card, Value } from "@prisma/client";
import { HandStrength } from "../../Assets/Interfaces";
// does not check high card
export const combinedHandStrength = async (
  tableCards: Card[],
  playerCards: Card[]
) => {
  let combinedCards = [...tableCards, ...playerCards];
  combinedCards.sort((card1: Card, card2: Card) => {
    // Compare the card values, returning a negative value for ascending order
    return cardValue(card1) - cardValue(card2);
  });

  const handStrength: HandStrength = {
    pairs: {
      ...numberOfPairs(combinedCards),
    },
    trips: {
      ...hasTrips(combinedCards),
    },
    fullHouse: {
      ...hasFullHouse(combinedCards),
    },
    quads: {
      ...hasQuads(combinedCards),
    },
    straights: {
      ...hasStraights(combinedCards),
    },
    straightFlush: {
      ...hasStraightFlush(combinedCards),
    },
    flush: {
      ...hasFlush(combinedCards),
    },
    royalFlush: {
      ...hasRoyalFlush(combinedCards),
    },
  };

  return handStrength;
};

export const cardValue = (card: Card): number => {
  switch (card.value) {
    case Value.ACE:
      return 14;
    case Value.KING:
      return 13;
    case Value.QUEEN:
      return 12;
    case Value.JACK:
      return 11;
    case Value.TEN:
      return 10;
    case Value.NINE:
      return 9;
    case Value.EIGHT:
      return 8;
    case Value.SEVEN:
      return 7;
    case Value.SIX:
      return 6;
    case Value.FIVE:
      return 5;
    case Value.FOUR:
      return 4;
    case Value.THREE:
      return 3;
    case Value.TWO:
      return 2;
    default:
      return 0;
  }
};
//array must be sorted first
const numberOfPairs = (cards: Card[]) => {
  let tempCards = cards.slice(); // Create a copy of the original array to avoid modifying it directly
  let pairscount = 0;
  let highestPairValue = 0;
  
  for (let i = 0; i < tempCards.length - 1; i++) {
    // Check if the current card has the same value as the next card
    if (cardValue(tempCards[i]) === cardValue(tempCards[i + 1])) {
      pairscount++;
      if (cardValue(tempCards[i]) > highestPairValue) {
        highestPairValue = cardValue(tempCards[i]);
      }
      // Skip the next card to avoid counting the same pair multiple times
      i++;
    }
  }
  console.log(cards)
  return { numberOPairs: pairscount, highestValue: highestPairValue };
};

const hasTrips = (cards: Card[]) => {
  let tempCards = cards.slice();
  let hasTrips = false;
  let highestTripsValue = 0;
  for (let i = 0; i < tempCards.length - 2; i++) {
    if (
      cardValue(tempCards[i]) === cardValue(tempCards[i + 1]) &&
      cardValue(tempCards[i + 1]) === cardValue(tempCards[i + 2])
    ) {
      hasTrips = true;
      if (cardValue(tempCards[i]) > highestTripsValue) {
        highestTripsValue = cardValue(tempCards[i]);
      }
      i = i + 2;
    }
  }
  return { hasTrips: hasTrips, highestValue: highestTripsValue };
};
const hasFullHouse = (cards: Card[]) => {
  let tempCards = cards.slice(); // Create a copy of the original array to avoid modifying it directly

  let highestTripsValue = 0;
  for (let i = 0; i < tempCards.length - 1; i++) {
    // Check if the current card has the same value as the next car
    //# 1 churn the highest trips val
    if (
      i < tempCards.length - 2 &&
      cardValue(tempCards[i]) === cardValue(tempCards[i + 1]) &&
      cardValue(tempCards[i + 1]) === cardValue(tempCards[i + 2])
    ) {
      if (cardValue(tempCards[i]) > highestTripsValue) {
        highestTripsValue = cardValue(tempCards[i]);
      }
      i = i + 2;
      //# 2 churn the highest pair val
    }
    // Skip the next card to avoid counting the same pair multiple times
    if (highestTripsValue !== 0) {
      return {
        hasFullHouse: true,
        highestValue: highestTripsValue,
      };
    }
  }
  return {
    hasFullHouse: false,
    highestValue: 0,
  };
};

const hasQuads = (cards: Card[]) => {
  let tempCards = cards.slice(); // Create a copy of the original array to avoid modifying it directly
  let hasQuads = false;
  let highestQuadsValue = 0;
  for (let i = 0; i < tempCards.length - 3; i++) {
    if (
      cardValue(tempCards[i]) === cardValue(tempCards[i + 1]) &&
      cardValue(tempCards[i + 1]) === cardValue(tempCards[i + 2]) &&
      cardValue(tempCards[i + 2]) === cardValue(tempCards[i + 3])
    ) {
      hasQuads = true;
      if (cardValue(tempCards[i]) > highestQuadsValue) {
        highestQuadsValue = cardValue(tempCards[i]);
      }
      i = i + 3;
    }
  }
  return {
    hasQuads: true,
    highestValue: highestQuadsValue,
  };
};
//
const hasStraights = (cards: Card[]) => {
  let tempCards = cards.slice(); // Create a copy of the original array to avoid modifying it directly
  let hasStraights = false;
  let highestStraightsValue = 0;

  for (let i = 0; i < tempCards.length - 4; i++) {
    // Check if the next 4 consecutive cards have consecutive values
    if (
      cardValue(tempCards[i]) + 1 === cardValue(tempCards[i + 1]) &&
      cardValue(tempCards[i]) + 2 === cardValue(tempCards[i + 2]) &&
      cardValue(tempCards[i]) + 3 === cardValue(tempCards[i + 3]) &&
      cardValue(tempCards[i]) + 4 === cardValue(tempCards[i + 4])
    ) {
      hasStraights = true;
      highestStraightsValue = cardValue(tempCards[i + 4]); // Store the highest value in the sequence
    }
  }

  return {
    hasStraights: hasStraights,
    highestValue: highestStraightsValue,
  };
};
const hasFlush = (cards: Card[]) => {
  let tempCards = cards.slice();
  const suitCounts = {
    HEARTS: 0,
    DIAMONDS: 0,
    CLUBS: 0,
    SPADES: 0,
  };

  // Count the number of cards for each suit
  tempCards.forEach((card) => {
    suitCounts[card.suit]++;
  });

  // Check if any suit has 5 or more cards
  const hasFlush = Object.values(suitCounts).some((count) => count >= 5);

  if (!hasFlush) {
    return { hasFlush: false, highestValue: 0 };
  }

  // Find the highest card value of the flush
  let highestFlushValue = 0;
  cards.forEach((card) => {
    if (suitCounts[card.suit] >= 5 && cardValue(card) > highestFlushValue) {
      highestFlushValue = cardValue(card);
    }
  });

  return { hasFlush: true, highestValue: highestFlushValue };
};
const hasStraightFlush = (cards: Card[]) => {
  let tempCards = cards.slice();
  const suitCounts = {
    HEARTS: 0,
    DIAMONDS: 0,
    CLUBS: 0,
    SPADES: 0,
  };

  // Count the number of cards for each suit
  tempCards.forEach((card) => {
    suitCounts[card.suit]++;
  });

  // Check for a straight flush
  for (let i = 0; i < cards.length - 4; i++) {
    const straightFlush = cards.slice(i, i + 5);

    if (
      straightFlush.every(
        (card, index) =>
          card.suit === straightFlush[0].suit &&
          cardValue(card) === cardValue(straightFlush[0]) + index
      )
    ) {
      return {
        hasStraightFlush: true,
        highestValue: cardValue(straightFlush[4]),
      };
    }
  }
  return { hasStraightFlush: false, highestValue: 0 };
};
const hasRoyalFlush = (cards: Card[]) => {
  let tempCards = cards.slice();
  const suitCounts = {
    HEARTS: 0,
    DIAMONDS: 0,
    CLUBS: 0,
    SPADES: 0,
  };

  // Count the number of cards for each suit
  tempCards.forEach((card) => {
    suitCounts[card.suit]++;
  });

  // Sort the cards by value
  cards.sort((a, b) => cardValue(a) - cardValue(b));

  // Check for a Royal Flush
  for (let i = 0; i <= cards.length - 5; i++) {
    const royalFlush = cards.slice(i, i + 5);

    if (
      royalFlush.every(
        (card, index) =>
          card.suit === royalFlush[0].suit &&
          cardValue(card) === cardValue(royalFlush[0]) + index + 10 // Check for values 10, 11, 12, 13, 14
      )
    ) {
      return {
        hasRoyalFlush: true,
        highestRoyalFlushValue: cardValue(royalFlush[4]),
      };
    }
  }

  return { hasRoyalFlush: false, highestValue: 0 };
};
