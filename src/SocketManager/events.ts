export const SOCKETEVENTS = {
  emit: {
    userCreated: "userCreated",
    disconnectedFromTable: "disconnectedFromTable",
    tableCreated: "tableCreated",
    tableJoined: "tableJoined",
    getTableData: "getTableData",
    roundSummary: "roundSummary",
    winner:"getWinner",
    serverError:"serverError",
  },

  on: {
    createTable: "createTable",
    joinTable: "joinTable",
    intentionalDisconnect: "intentionalDisconnect",
    disconnect: "disconnect",
    PlayerAction: "PlayerAction",
  },
};
