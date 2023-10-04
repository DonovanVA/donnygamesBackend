import { AppContext } from "../../Types/types";
import { getActiveIndex, getActivePlayers, getTable } from "./Getters";

// this function is called to set the next player's turn, the next active index
export const setNextActiveIndex = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    const players = await app.prisma.player.findMany({
      where: {
        pokerTable_id: pokerTable_id,
      },
      include: {
        playerTableOrderInstance: true,
      },
    });

    const activeIndex = await getActiveIndex(app, pokerTable_id);
    const sortedPlayers = players // filter players that have not folded and sort them to ascending order
      .filter(
        (player) =>
          player.playerTableOrderInstance?.order !== 0 &&
          player.playerTableOrderInstance?.folded === false
      )
      .sort((a, b) => {
        const orderA = a.playerTableOrderInstance?.order || 0;
        const orderB = b.playerTableOrderInstance?.order || 0;
        return orderA - orderB;
      });

    const IndexOfPrevActivePlayer = sortedPlayers.find((player) => {
      return activeIndex === player.playerTableOrderInstance?.order;
    });

    let updatedIndex = 0;

    if (activeIndex === sortedPlayers.length) {
      updatedIndex = 1;
    } else {
      updatedIndex = activeIndex! + 1; // set the active index to be the next value in the array
    }
    const updateActiveIndex = await app.prisma.pokerTable.update({
      where: {
        pokerTable_id: pokerTable_id,
      },
      data: {
        activeIndex: updatedIndex,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const setRotateOrder = async (
  app: AppContext,
  pokerTable_id: number
) => {
  try {
    // 1. Get all players in the poker table
    const players = await app.prisma.player.findMany({
      where: {
        pokerTable_id: pokerTable_id,
      },
      include: {
        playerTableOrderInstance: true,
      },
    });
    const pivotIndex = players.findIndex(
      (player) => player.playerTableOrderInstance?.order === 1
    );

    // Split the players into two parts: after the pivot and before the pivot
    // [a,b,prevBanker,c,d] => [ c,d,a,b,prevBanker]
    if (pivotIndex !== -1) {
      const playersAfterPivot = players.slice(0, pivotIndex);
      const playersBeforePivot = players.slice(pivotIndex + 1);
      const reorderedPlayers = [
        ...playersBeforePivot,
        ...playersAfterPivot,
        players[pivotIndex],
      ];

      // Reorder the list by placing playersAfterPivot in front
      let counter = 1;
      for (let i = 0; i < reorderedPlayers.length; i++) {
        if (reorderedPlayers[i].playerTableOrderInstance?.folded) {
          const updatedPlayer =
            await app.prisma.playerTableOrderInstance.update({
              where: {
                player_id: players[i].player_id,
                pokerTable_id: pokerTable_id,
              },
              data: {
                order: 0,
              },
            });
        } else {
          const updatedPlayer =
            await app.prisma.playerTableOrderInstance.update({
              where: {
                player_id: players[i].player_id,
                pokerTable_id: pokerTable_id,
              },
              data: {
                order: counter,
              },
            });
          counter = counter + 1;
        }
      }
    } else {
      console.log("banker not found");
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not set the order for players");
  }
};
// this function is called to set the order of the players (banker is 1)
export const setOrder = async (app: AppContext, pokerTable_id: number) => {
  try {
    //1. Get all players in the poker table
    const players = await app.prisma.player.findMany({
      where: {
        pokerTable_id: pokerTable_id,
      },
      include: {
        playerTableOrderInstance: true,
      },
    });

    //2. Sort players by player_id to ensure consistent order assignment
    players.sort((a, b) => a.player_id - b.player_id);
    //3. set the active indexes
    if (players.length < 4) {
      const updatedPlayer = await app.prisma.pokerTable.update({
        where: {
          pokerTable_id: pokerTable_id,
        },
        data: {
          activeIndex: 1,
        },
      });
    } else {
      const updatedPlayer = await app.prisma.pokerTable.update({
        where: {
          pokerTable_id: pokerTable_id,
        },
        data: {
          activeIndex: players.length,
        },
      });
    }

    //4. Set orders from 1 to n for n players that have not folded, and 0 for those who have folded/not playing
    let counter = 1;
    for (let i = 0; i < players.length; i++) {
      if (players[i].playerTableOrderInstance?.folded) {
        const updatedPlayer = await app.prisma.playerTableOrderInstance.update({
          where: {
            player_id: players[i].player_id,
            pokerTable_id: pokerTable_id,
          },
          data: {
            order: 0,
          },
        });
      } else {
        const updatedPlayer = await app.prisma.playerTableOrderInstance.update({
          where: {
            player_id: players[i].player_id,
            pokerTable_id: pokerTable_id,
          },
          data: {
            order: counter,
          },
        });
        counter = counter + 1;
      }
    }
  } catch (error) {
    console.log(error);
    throw new Error("Could not set the order for players");
  }
};
