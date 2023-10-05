import { getTable, getGameState, getPlayerInfo } from "./Lib/Getters";
import {
  setFlopCards,
  setRevealCards,
  moveBetsToPot,
  setBettingRound,
  setWinner,
  endGameIfThereIsOnlyOnePlayerLeft,
  checkIfNeedToShowAllCards,
} from "./Lib/GameFlow";
import { setNextActiveIndex } from "./Lib/TurnOrderManagement";
import { AppContext } from "../Types/types";
import { Socket } from "socket.io";
import { GamePhase } from "../Assets/Interfaces";
import { SOCKETEVENTS } from "../SocketManager/events";
import { BettingRound } from "@prisma/client";


export const gameStateCallBack = async (
  app: AppContext,
  table_id: number,
  player_id: number,
  socket: Socket
) => {
  const state = await getGameState(app, table_id);
  const winner_id = await endGameIfThereIsOnlyOnePlayerLeft(app, table_id);
  if (winner_id !== 0) {
    // if a winner is emitted, the player can choose to next round
    socket.emit(SOCKETEVENTS.emit.winner, {
      winner_id: winner_id,
    });
  } else {
    const show = await checkIfNeedToShowAllCards(app, table_id);
    if (show) {
      const getFlopCards = await app.prisma.card.findMany({
        where: {
          pokerTable_id: table_id,
          faceDown: false,
          playerId: null,
        },
      });

      await setFlopCards(app, table_id, 5 - getFlopCards.length);
      await moveBetsToPot(app, table_id);
      await setRevealCards(app, table_id);
      const winner_id = await setWinner(app, table_id);

      socket.emit(SOCKETEVENTS.emit.winner, {
        winner_id: winner_id,
      });

      socket.to(`table_${table_id}`).emit(SOCKETEVENTS.emit.winner, {
        winner_id: winner_id,
      });
    } else {
      console.log(state);
      switch (state) {
        case GamePhase.FIRSTBETTINGROUND:
          await setNextActiveIndex(app, table_id); // betting round set the index to the next person
          break;
        case GamePhase.SECONDBETTINGROUND:
          await setNextActiveIndex(app, table_id); // betting round set the index to the next person
          break;
        case GamePhase.THIRDBETTINGROUND:
          await setNextActiveIndex(app, table_id); // betting round set the index to the next person
          break;
        case GamePhase.FINALBETTINGROUND:
          await setNextActiveIndex(app, table_id); // betting round set the index to the next person
          break;
        case GamePhase.FIRSTFLOP:
          // deal 3 cards
          await moveBetsToPot(app, table_id);
          await setFlopCards(app, table_id, 3);
          await setBettingRound(app, table_id, BettingRound.SECONDBETTINGROUND);
          await setNextActiveIndex(app, table_id);
          break;
        case GamePhase.SECONDFLOP:
          // deal 1 card
          await moveBetsToPot(app, table_id);
          await setFlopCards(app, table_id, 1);
          await setBettingRound(app, table_id, BettingRound.THIRDBETTINGROUND);
          await setNextActiveIndex(app, table_id);
          break;
        case GamePhase.THIRDFLOP:
          // deal 1 card
          await moveBetsToPot(app, table_id);
          await setFlopCards(app, table_id, 1);
          await setBettingRound(app, table_id, BettingRound.FINALBETTINGROUND);
          await setNextActiveIndex(app, table_id);
          break;
        case GamePhase.ENDING:
          // open everyone's cards
          await moveBetsToPot(app, table_id);
          await setRevealCards(app, table_id);
          const winner_id = await setWinner(app, table_id);
          socket.emit(SOCKETEVENTS.emit.winner, {
            winner_id: winner_id,
          });

          socket.to(`table_${table_id}`).emit(SOCKETEVENTS.emit.winner, {
            winner_id: winner_id,
          });

          break;
      }
    }

    const table = await getTable(app, table_id);
    socket.emit(SOCKETEVENTS.emit.getTableData, {
      state: state,
      table: table,
    });
    // emit to the rest only the table information
    socket
      .to(`table_${table?.pokerTable_id}`)
      .emit(SOCKETEVENTS.emit.getTableData, {
        state: state,
        table: table,
      });
  }
};
