# Test Client

This document explains the temporary Node.js terminal client used to test the messaging system without building a frontend.

The test client allows two terminal windows to act as two different users.

Example:

```text
Terminal 1
Backend server

Terminal 2
Alice

Terminal 3
Bob
```

Alice and Bob can send messages to each other through Socket.IO.

---

# Install

From the `backend/` directory:

```bash
npm install socket.io-client
```

---

# File Location

A simple structure is:

```text
backend/
├── src/
│   ├── users/
│   ├── words/
│   ├── messages/
│   └── server.js
├── test-client.js
├── .env
└── package.json
```

`test-client.js` is kept outside `src/` because it is only a development/testing tool.


---

# Required Backend Route

The test client expects this route to exist:

```text
GET /words
```

It should return all existing word groups.

Example route:

```js
router.get("/", async (req, res) => {
  try {
    const result = await words.find({}).toArray();

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve words",
      error: error.message
    });
  }
});
```

Example response:

```json
[
  {
    "_id": "abc123",
    "translations": [
      {
        "language": "en",
        "words": [
          "house",
          "home"
        ]
      },
      {
        "language": "ja",
        "words": [
          "家",
          "住宅"
        ]
      }
    ]
  }
]
```

The client converts each word into a selectable component:

```js
{
  wordGroupId: group._id,
  selectedWord: word,
  language: translation.language
}
```

---

# Running the Test

## 1. Start the backend

Terminal 1:

```bash
node server.js
```

Expected output:

```text
Connected to MongoDB
Server running at http://localhost:3000
```

---

## 2. Start Alice

Terminal 2:

```bash
node test-client.js alice bob
```

Expected output:

```text
Connected to server: ...
Registered as: alice
Messaging: bob
```

The available words are then displayed.

Example:

```text
Available words:
----------------
1. house [en]
2. home [en]
3. 家 [ja]
4. 住宅 [ja]
5. want [en]
6. 欲しい [ja]
7. food [en]
8. 食べ物 [ja]

Enter word numbers separated by spaces:
Example: 1 5 7
```

---

## 3. Start Bob

Terminal 3:

```bash
node test-client.js bob alice
```

Now both users are connected.

---

# Sending a Message

Instead of freely typing a sentence, select the indexes of existing words.

Example:

```text
1 5 7
```

This might correspond to:

```text
house want food
```

The test client creates:

```json
[
  {
    "wordGroupId": "abc123",
    "selectedWord": "house",
    "language": "en"
  },
  {
    "wordGroupId": "def456",
    "selectedWord": "want",
    "language": "en"
  },
  {
    "wordGroupId": "ghi789",
    "selectedWord": "food",
    "language": "en"
  }
]
```

It then emits:

```js
socket.emit(
  "sendMessage",
  {
    receiverId,
    components
  }
);
```

---

# Receiving a Message

The receiving test client listens for:

```js
socket.on("receiveMessage", ...)
```

and reconstructs the visible sentence with:

```js
const sentence = message.components
  .map(component => component.selectedWord)
  .join(" ");
```

Example output:

```text
----- NEW MESSAGE -----
From: alice
Message: house want food
-----------------------
```

---

# What This Test Proves

This test verifies the full chain:

```text
MongoDB wordGroups
       │
       ▼
GET /words
       │
       ▼
Test client word selection
       │
       ▼
Socket.IO sendMessage
       │
       ▼
Backend
       │
       ├── MongoDB messages
       │
       └── Socket.IO receiveMessage
                   │
                   ▼
              Other client
```

If this works, the backend is ready to be connected to a real frontend.

---

# Current Limitations

This is only a test utility.

It currently:

- displays all words at once
- uses simple terminal indexes
- does not authenticate users
- uses user IDs supplied on the command line
- does not show a graphical word tree
- does not automatically refresh if new words are added while the client is running

The actual frontend can later replace the numbered terminal list with the real interactive word tree while keeping the same `components` structure and `sendMessage` socket event.

---

# Useful Test Commands

Start backend:

```bash
node src/server.js
```

Alice:

```bash
node test-client.js alice bob
```

Bob:

```bash
node test-client.js bob alice
```

If the server uses another port, update:

```js
const SERVER = "http://localhost:3000";
```

inside `test-client.js`.

---

# Next Step

After this terminal test works reliably, the frontend only needs to reproduce three behaviors:

1. load available words
2. let the user build an ordered `components` array
3. emit `sendMessage`

The messaging backend does not need to know whether the selections came from a terminal, React, Vue, Next.js, or another interface.
