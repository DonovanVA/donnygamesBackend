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
  BETTINGROUND = "BETTINGROUND",
  FIRSTFLOP = "FIRSTFLOP",
  SECONDFLOP = "SECONDFLOP",
  THIRDFLOP = "THIRDFLOP",
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
