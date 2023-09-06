export const SOCKETEVENTS = {
  emit: {
    userCreated: "userCreated",
    disconnectedFromTable: "disconnectedFromTable",
    tableCreated: "tableCreated",
    tableJoined: "tableJoined",
    getPlayerAction: "getPlayerAction",
    getTableData: "getTableData",
  },

  on: {
    createTable: "createTable",
    joinTable: "joinTable",
    intentionalDisconnect: "intentionalDisconnect",
    disconnect: "disconnect",
    PlayerAction: "PlayerAction",
    RequestGameState: "onRequestGameState",
  },
};
