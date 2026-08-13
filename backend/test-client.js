import { io } from "socket.io-client";
import readline from "readline";

const userId = process.argv[2];
const receiverId = process.argv[3];

if (!userId || !receiverId) {
  console.log(
    "Usage: node test-client.js <userId> <receiverId>"
  );

  process.exit(1);
}

const SERVER = "http://localhost:3000";

const socket = io(SERVER);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let availableWords = [];


// -----------------------------
// Load words from MongoDB API
// -----------------------------

async function loadWords() {
  try {
    const response = await fetch(`${SERVER}/words`);

    const wordGroups = await response.json();

    availableWords = [];

    for (const group of wordGroups) {
      for (const translation of group.translations) {
        for (const word of translation.words) {

          availableWords.push({
            wordGroupId: group._id,
            selectedWord: word,
            language: translation.language
          });

        }
      }
    }

  } catch (error) {
    console.log(
      "Failed to load words:",
      error.message
    );
  }
}


// -----------------------------
// Display available words
// -----------------------------

function showWords() {
  console.log("");
  console.log("Available words:");
  console.log("----------------");

  availableWords.forEach((word, index) => {
    console.log(
      `${index + 1}. ${word.selectedWord} [${word.language}]`
    );
  });

  console.log("");
  console.log(
    "Enter word numbers separated by spaces:"
  );

  console.log(
    "Example: 1 4 7"
  );
}


// -----------------------------
// Connect
// -----------------------------

socket.on("connect", async () => {

  console.log(
    `Connected to server: ${socket.id}`
  );

  socket.emit(
    "register",
    {
      userId
    },
    async (response) => {

      if (!response.success) {
        console.log(
          "Registration failed"
        );

        return;
      }

      console.log(
        `Registered as: ${userId}`
      );

      console.log(
        `Messaging: ${receiverId}`
      );

      await loadWords();

      showWords();
    }
  );
});


// -----------------------------
// Receive message
// -----------------------------

socket.on("receiveMessage", (message) => {

  console.log("");
  console.log("----- NEW MESSAGE -----");

  console.log(
    `From: ${message.senderId}`
  );

  const sentence = message.components
    .map(component => component.selectedWord)
    .join(" ");

  console.log(
    `Message: ${sentence}`
  );

  console.log("-----------------------");

  showWords();
});


// -----------------------------
// Select and send words
// -----------------------------

rl.on("line", (input) => {

  const indexes = input
    .trim()
    .split(/\s+/)
    .map(number => Number(number) - 1);

  const components = [];

  for (const index of indexes) {

    const selected = availableWords[index];

    if (!selected) {
      console.log(
        `Invalid selection: ${index + 1}`
      );

      return;
    }

    components.push(selected);
  }

  if (components.length === 0) {
    return;
  }

  const sentence = components
    .map(component => component.selectedWord)
    .join(" ");

  console.log("");
  console.log(
    `Sending: ${sentence}`
  );

  socket.emit(
    "sendMessage",
    {
      receiverId,
      components
    },
    (response) => {

      if (response.success) {
        console.log("Message sent!");
      } else {
        console.log(
          "Message failed:",
          response.message
        );
      }

      showWords();
    }
  );
});


socket.on("connect_error", (error) => {
  console.log(
    "Connection error:",
    error.message
  );
});