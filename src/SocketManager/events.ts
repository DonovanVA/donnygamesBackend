export const SOCKETEVENTS = {
  emit: {
    userCreated: "userCreated",
    disconnectedFromTable: "disconnectedFromTable",
    tableCreated: "tableCreated",
    tableJoined: "tableJoined",
    getTableData: "getTableData",
    roundSummary: "roundSummary",
    winner:"getWinner",
  },

  on: {
    createTable: "createTable",
    joinTable: "joinTable",
    intentionalDisconnect: "intentionalDisconnect",
    disconnect: "disconnect",
    PlayerAction: "PlayerAction",
  },
};
