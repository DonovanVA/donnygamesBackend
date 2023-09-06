// userRoutes.ts

import express from "express";
import { createTable, } from "../Poker/PlayerControls";

const router = express.Router();


//router.post("/joinTable/:tableId", joinTable);

export { router as userRoutes };
