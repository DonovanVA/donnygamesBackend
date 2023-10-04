export interface PlayingCard {
  unicode: string;
  name: string;
  suit: Suit;
  isRed: boolean;
}
export enum Suit {
  SPADES = "SPADES",
  CLUBS = "CLUBS",
  DIAMONDS = "DIAMONDS",
  HEARTS = "HEARTS",
}

export enum GamePhase {
  BEGINNING = "BEGINNING",
  FIRSTBETTINGROUND = "FIRSTBETTINGROUND",
  FIRSTFLOP = "FIRSTFLOP",
  SECONDBETTINGROUND = "SECONDBETTINGROUND",
  SECONDFLOP = "SECONDFLOP",
  THIRDBETTINGROUND = "THIRDBETTINGROUND",
  THIRDFLOP = "THIRDFLOP",
  FINALBETTINGROUND = "FINALBETTINGROUND",
  ENDING = "ENDING",
}

export interface PlayerInput {
  name: string;
}

export enum PlayerActions {
  CALL = "CALL",
  RAISE = "RAISE",
  CHECK = "CHECK",
  FOLD = "FOLD",
}

export enum Value {
  TWO = "TWO",
  THREE = "THREE",
  FOUR = "FOUR",
  FIVE = "FIVE",
  SIX = "SIX",
  SEVEN = "SEVEN",
  EIGHT = "EIGHT",
  NINE = "NINE",
  TEN = "TEN",
  JACK = "JACK",
  QUEEN = "QUEEN",
  KING = "KING",
  ACE = "ACE",
}

export interface HandStrength {
  pairs: {
    numberOPairs: number;
    highestValue: number;
  };
  trips: {
    hasTrips: boolean;
    highestValue: number;
  };
  fullHouse: {
    hasFullHouse: boolean;
    highestValue: number;
  };
  quads: {
    hasQuads: boolean;
    highestValue: number;
  };
  straights: {
    hasStraights: boolean;
    highestValue: number;
  };
  flush: {
    hasFlush: boolean;
    highestValue: number;
  };
  straightFlush: {
    hasStraightFlush: boolean;
    highestValue: number;
  };
  royalFlush: {
    hasRoyalFlush: boolean;
  };
}
export interface PlayerHandStrength extends HandStrength{
  player_id:number;
}
