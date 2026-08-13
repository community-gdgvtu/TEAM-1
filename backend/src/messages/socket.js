export default function setupMessageSocket(io, db) {
  const messages = db.collection("messages");

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Associate this socket with one of your users
    socket.on("register", (data, callback) => {
      const { userId } = data;

      if (!userId) {
        callback?.({
          success: false,
          message: "userId is required"
        });
        return;
      }

      socket.data.userId = userId;

      // Each user gets their own Socket.IO room
      socket.join(`user:${userId}`);

      console.log(`User ${userId} registered`);

      callback?.({
        success: true
      });
    });


    // Send a message
    socket.on("sendMessage", async (data, callback) => {
      try {
        const senderId = socket.data.userId;

        const {
          receiverId,
          components
        } = data;

        // Make sure the socket registered first
        if (!senderId) {
          return callback?.({
            success: false,
            message: "User is not registered"
          });
        }

        if (
          !receiverId ||
          !Array.isArray(components) ||
          components.length === 0
        ) {
          return callback?.({
            success: false,
            message: "receiverId and components are required"
          });
        }

        const newMessage = {
          senderId,
          receiverId,
          components,
          createdAt: new Date()
        };

        // Save permanently to MongoDB
        const result = await messages.insertOne(newMessage);

        const savedMessage = {
          ...newMessage,
          _id: result.insertedId.toString()
        };

        // Instantly send to receiver
        io
          .to(`user:${receiverId}`)
          .emit("receiveMessage", savedMessage);

        // Tell sender it worked
        callback?.({
          success: true,
          message: savedMessage
        });

      } catch (error) {
        console.error("Message error:", error);

        callback?.({
          success: false,
          message: "Failed to send message"
        });
      }
    });


    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}