import {
  getTable,
  getGameState,
  setFlopCards,
  setRevealCards,
  setNextActiveIndex,
  getActivePlayerTurn,
} from "./ClassFunctions";
import { AppContext } from "../Types/types";
import { Socket } from "socket.io";
import { GamePhase } from "../Assets/Interfaces";
import { SOCKETEVENTS } from "../SocketManager/events";
export const gameStateCallBack = async (
  app: AppContext,
  table_id: number,
  socket: Socket
) => {
  const state = await getGameState(app, table_id); // return 0 - betting round, 1 - no cards, 2 - 3 cards, 3 - 4 cards , 4 - 5 cards
  console.log(state);
  switch (state) {
    case GamePhase.BETTINGROUND:
      await setNextActiveIndex(app, table_id); // betting round set the index to the next person

      break;
    case GamePhase.FIRSTFLOP:
      // deal 3 cards
      await setFlopCards(app, table_id, 3);

      break;
    case GamePhase.SECONDFLOP:
      // deal 1 card
      await setFlopCards(app, table_id, 1);

      break;
    case GamePhase.THIRDFLOP:
      // deal 1 card
      await setFlopCards(app, table_id, 1);

      break;
    case GamePhase.ENDING:
      // open everyone's cards
      await setRevealCards(app, table_id);
      // TBD - determine winner and proceed to next round (reset)
      break;
  }

  const table = await getTable(app, table_id);
  const activeIndex = await getActivePlayerTurn(app, table_id);

  socket.emit(SOCKETEVENTS.emit.getTableData, {
    state: state,
    table: table,
  });
};
