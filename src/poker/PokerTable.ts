import { Poker } from './Poker';
import { PokerPlayer } from './PokerPlayer'; // Import the PokerPlayer class definition

class PokerTable {
    private socketio: any; // Update the type based on your needs
    private tableId: number; // Update the type based on your needs
    private players: PokerPlayer[];
  
    private table: Poker;
  
    constructor(socketio: any, tableId: number) {
      this.socketio = socketio;
      this.tableId = tableId;
      this.players = [];
  
      this.table = new Poker();
    }
  
    joinTable = (player: PokerPlayer): void => {
      const maxSeats = 10; // Update with your actual value
      if (this.players.length < maxSeats) {
        this.players.push(player);
      }
    };
  
    updatePlayer = (): void => {
      const { table, socketio } = this;
      const tableData: any = {
        seats: table.getSeats(),
      };
  
      this.players.forEach((player) => {
        const currentSeat = player.getCurrentSeat();
        if (currentSeat !== undefined && currentSeat >= 0 && currentSeat < tableData.seats.length) {
          const user = player.getUser();
          if (user) {
            tableData.seats[currentSeat].name = user.name;
            tableData.seats[currentSeat].socketId = user.socketId;
          }
        }
      });
  
      if (table.isHandInProgress()) {
        tableData.cards = table.getHoleCards();
        tableData.round = table.getRoundOfBetting();
        tableData.community = table.getCommunityCards();
        tableData.potSize = table.getPots()[0].size;
      }
  
      if (table.isBettingRoundInProgress()) {
        tableData.active = table.isActive();
      }
  
      // Emit tableData to connected clients using socketio
      socketio.emit('updateTable', tableData);
    };
  }
  
  export default PokerTable;
