import express from "express";

export const userRoutes = express.Router();

// Define your routes
userRoutes.get("/", (req, res) => {
  // Handle getting a list of users
  res.json({ message: "List of users" });
});
