# Wordtree Backend API - Authentication Setup

This backend application uses Node.js, Express, and MongoDB, featuring secure user authentication (registration & login) using password hashing with `bcryptjs` and token-based session management using JSON Web Tokens (JWT).

## Prerequisites

- **Node.js**: Version 16.x or higher
- **MongoDB**: A running MongoDB instance (locally or cloud Atlas)

---

## Setup Instructions

### 1. Install Dependencies
Navigate to the `backend` directory and install the required npm packages:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` in the `backend/` directory. Use the following configuration template:
```env
# The connection string to your MongoDB database
MONGODB_URI=mongodb://127.0.0.1:27017/wordtree

# Port number on which the backend server will run
PORT=3000

# Secret key used for signing JWT authentication tokens
JWT_SECRET=your_jwt_secret_key_here
```

---

## Running the Application

To start the server, run:
```bash
npm start
```
The server will boot up and should log:
```
Connected to MongoDB
Server running at http://localhost:3000
```

---

## Authentication Endpoints

### 1. User Registration
Creates a new user account, hashes the password, and returns a session token.

- **Endpoint**: `POST /users/register`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```
- **Responses**:
  - `201 Created` (Success):
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "id": "6a7db001644492fc4a3f5cd9",
        "username": "johndoe",
        "email": "johndoe@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5c..."
    }
    ```
  - `400 Bad Request`: Input validation failed (e.g. invalid email format or password too short).
  - `409 Conflict`: Username or Email already exists in the database.

---

### 2. User Login
Authenticates an existing user and returns a session token.

- **Endpoint**: `POST /users/login`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```
- **Responses**:
  - `200 OK` (Success):
    ```json
    {
      "message": "Login successful",
      "user": {
        "id": "6a7db001644492fc4a3f5cd9",
        "username": "johndoe",
        "email": "johndoe@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5c..."
    }
    ```
  - `401 Unauthorized`: Invalid email or password.

---

## Protecting Routes (Middleware)

To protect any other API route, import and apply the `authenticateToken` middleware located in `src/users/auth.js`.

### Example Route Protection:
```javascript
import { authenticateToken } from "./src/users/auth.js";

// Apply to a specific route
router.get("/protected-profile", authenticateToken, (req, res) => {
  // Access logged-in user details via req.user (e.g. req.user.userId)
  res.json({ message: "Welcome to your profile!", userId: req.user.userId });
});
```

Clients should send the JWT token in their request headers:
`Authorization: Bearer <your_jwt_token>`

---

## Testing Examples

### Using `curl`
```bash
# Register
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Using PowerShell
```powershell
# Register
Invoke-RestMethod -Uri "http://localhost:3000/users/register" -Method Post -ContentType "application/json" -Body '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
Invoke-RestMethod -Uri "http://localhost:3000/users/login" -Method Post -ContentType "application/json" -Body '{"email":"test@example.com","password":"password123"}'
```
---

## Word Base

Words are stored in MongoDB as connected word groups. Each group can contain multiple words in multiple languages.

Example:
```json
{
  "translations": [
    {
      "language": "en",
      "words": ["house", "home"]
    },
    {
      "language": "ja",
      "words": ["家", "住宅"]
    }
  ]
}
```

### Word Endpoints

#### Get All Word Groups
- **Endpoint**: `GET /words`

Returns all existing word groups.

#### Look Up a Word
- **Endpoint**: `GET /words/:word`

Example:
```text
GET /words/house
```

Returns the word group containing the requested word.

#### Add a Word Group
- **Endpoint**: `POST /words`
- **Content-Type**: `application/json`

Example Request:
```json
{
  "translations": [
    {
      "language": "en",
      "words": ["house", "home"]
    },
    {
      "language": "ja",
      "words": ["家", "住宅"]
    }
  ]
}
```

The backend should check whether any of the supplied words already exist before creating a duplicate word group.

#### Add a Translation
- **Endpoint**: `PATCH /words/:id/translations`
- **Content-Type**: `application/json`

Example Request:
```json
{
  "language": "id",
  "words": ["rumah"]
}
```

---

## Real-Time Messaging

Messaging uses Socket.IO for real-time delivery and MongoDB for permanent storage.

Messages are created from existing words in the word base rather than free-form text.

Example message:
```json
{
  "senderId": "user1",
  "receiverId": "user2",
  "components": [
    {
      "wordGroupId": "group1",
      "selectedWord": "I",
      "language": "en"
    },
    {
      "wordGroupId": "group2",
      "selectedWord": "want",
      "language": "en"
    },
    {
      "wordGroupId": "group3",
      "selectedWord": "food",
      "language": "en"
    }
  ]
}
```

The order of `components` represents the sentence:
```text
[I] [want] [food]
```

Each component stores the selected word together with its `wordGroupId`, allowing the receiver to inspect the connected translations for that word.

### Socket Events

#### `register`

Registers the current socket connection to a user.

```javascript
socket.emit("register", {
  userId: "user1"
});
```

#### `sendMessage`

Sends a word-based message to another user.

```javascript
socket.emit("sendMessage", {
  receiverId: "user2",
  components: [...]
});
```

The backend stores the message in MongoDB and emits it to the receiver.

#### `receiveMessage`

The receiver listens for new messages:

```javascript
socket.on("receiveMessage", (message) => {
  console.log(message);
});
```

### Message History

Stored conversations can be retrieved through the REST API.

- **Endpoint**: `GET /messages/conversation/:user1/:user2`

Example:
```text
GET /messages/conversation/user1/user2
```

Socket.IO handles live delivery, while MongoDB stores the conversation history.

> **Authentication Note:** The current Socket.IO prototype can register users with a supplied `userId`. For production, the existing JWT authentication should also be used to verify socket connections rather than trusting a client-supplied user ID.
