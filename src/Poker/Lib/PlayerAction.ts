import { Player } from "@prisma/client";
import { AppContext } from "../../Types/types";
import {
  getActiveIndex,
  getActivePlayers,
  getPlayerInfo,
  getTable,
} from "./Getters";
// this function is called by the user to bet
export const setBet = async (
  app: AppContext,
  player_id: number,
  pokerTable_id: number,
  bet: number,
  toSidePot: boolean
) => {
  try {
    const canRaise = await checkIfCanRaise(app, pokerTable_id);
    const playerInfo = await getPlayerInfo(app, player_id);
  
    if (playerInfo && bet > playerInfo?.cash) {
      
      throw new Error("Bet amount exceeds available cash");
    } else {
      const activePlayers = await getActivePlayers(app, pokerTable_id);
      let highestBet = 0; // Initialize the highest bet to 0
      activePlayers.forEach((activePlayer: Player) => {
        if (activePlayer.bet > highestBet) {
          highestBet = activePlayer.bet; // Update the highest bet if a higher bet is found
        }
      });
      if (bet > highestBet && canRaise) {
        const updateTable = await app.prisma.pokerTable.update({
          where: {
            pokerTable_id: pokerTable_id,
          },
          data: {
            numRaises: {
              increment: 1,
            },
          },
        });
      }
      else if(bet > highestBet && !canRaise){
        throw new Error("Max raises restriction reached")
      }

      const placeBets = await app.prisma.player.update({
        where: {
          player_id: player_id,
          pokerTable_id: pokerTable_id,
        },
        data: {
          bet: {
            increment: bet,
          },
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
// this function is called by the user to fold
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
// this function is called by the user to buy in
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

export const checkIfCanRaise = async (
  app: AppContext,
  pokerTable_id: number
) => {
  const table = await getTable(app, pokerTable_id);
  if (table && table?.numRaises < 1) {
    return true;
  } else {
    return false;
  }
};
