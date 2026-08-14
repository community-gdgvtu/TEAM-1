import express from "express";

export default function createMessagesApi(db) {
    const router = express.Router();
    const messages = db.collection("messages");

    // Get conversation between two users
    // Input: Sender, Receiver
    // Output: Conversation using the two User IDs
    router.get("/conversation/:user1/:user2", async (req, res) => {
        try {
            const { user1, user2 } = req.params;

            const result = await messages
                .find({
                    $or: [
                        {
                            senderId: user1,
                            receiverId: user2
                        },
                        {
                            senderId: user2,
                            receiverId: user1
                        }
                    ]
                })
                .sort({
                    createdAt: 1
                })
                .toArray();

            res.json(result);

        } catch (error) {
            res.status(500).json({
                message: "Failed to retrieve messages",
                error: error.message
            });
        }
    });

    return router;
}