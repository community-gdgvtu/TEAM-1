import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

import createUserApi from "./src/users/api.js";
import createWordsApi from "./src/words/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Lets Express read JSON request bodies
app.use(express.json());

// Connect to MongoDB
const client = new MongoClient(process.env.MONGODB_URI);

await client.connect();

const db = client.db("wordtree");

console.log("Connected to MongoDB");

// API routes
// These are the routes that the API uses 
app.use("/users", createUserApi(db));
app.use("/words", createWordsApi(db));

// Simple test route
app.get("/", (req, res) => {
  res.json({
    message: "API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});