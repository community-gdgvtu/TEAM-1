import express from "express";

const router = express.Router();

export default function createUserApi(db) {
  const users = db.collection("users");

  // Add a new user
  // Input is: Name
  // Output to MongoDB is: USER ID, UserNAME
  // Example Usage:
  // POST http://localhost:3000/users `
  //   -H "Content-Type: application/json" `
  //   -d '{\"name\":\"Alice\"}' ==> Adds a user with name "Alice", no authentification at the moment
  router.post("/", async (req, res) => {
    try {
      const result = await users.insertOne({
        name: req.body.name
      });

      res.status(201).json({
        message: "User added",
        id: result.insertedId
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to add user",
        error: error.message
      });
    }
  });
  return router;
}