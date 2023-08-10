interface Seat {
  holeCards: any[]; // Placeholder type, should be an array of cards
  // Add more seat-related properties as needed
}

interface Pot {
  size: number;
  // Add more pot-related properties as needed
}

export class Poker {
  seats: Seat[];
  communityCards: any[]; // Placeholder type, should be an array of cards
  roundOfBetting: string;
  active: boolean;
  pots: Pot[];

  constructor() {
    this.seats = [];
    this.communityCards = [];
    this.roundOfBetting = "pre-flop";
    this.active = true;
    this.pots = [{ size: 0 }];
  }

  getSeats(): Seat[] {
    return this.seats;
  }

  getHoleCards(): any[][] {
    // Return hole cards for each player
    return this.seats.map((seat) => seat.holeCards);
  }

  getCommunityCards(): any[] {
    return this.communityCards;
  }

  getRoundOfBetting(): string {
    return this.roundOfBetting;
  }

  isActive(): boolean {
    return this.active;
  }

  isHandInProgress(): boolean {
    // Check if a hand is in progress
    return this.communityCards.length > 0;
  }

  isBettingRoundInProgress(): boolean {
    // Check if a betting round is in progress
    return this.roundOfBetting !== "completed";
  }

  getPots(): Pot[] {
    return this.pots;
  }
}
