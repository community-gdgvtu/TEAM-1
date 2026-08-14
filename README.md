# WordTree 🌳

A multilingual learning and messaging app where words are grouped by meaning across languages, visualized as a tree, and reused inside chat messages.

## Project Snapshot ✨

| Area | What it does | Main location |
|---|---|---|
| Frontend | Login, profile, interactive word tree, translation popups, inbox/chat UI | `frontend/Goutam/Word_Tree/` |
| Backend API | Users auth, word groups, translation updates, message history | `backend/` |
| Realtime | Socket.IO message delivery + MongoDB persistence | `backend/src/messages/socket.js` |

## Tech Stack 🧰

| Layer | Stack |
|---|---|
| Runtime | Node.js (ESM), Python static server for frontend |
| API | Express |
| Database | MongoDB |
| Auth | bcryptjs + JWT |
| Realtime | Socket.IO |
| Frontend | Vanilla HTML/CSS/JavaScript |

## Repository Structure 🗂️

```text
team-1/
├─ backend/
│  ├─ server.js
│  └─ src/
│     ├─ users/      # register/login/user list
│     ├─ words/      # word groups + translation APIs
│     └─ messages/   # conversation API + socket handlers
└─ frontend/
	 └─ Goutam/Word_Tree/
			├─ index.html  # redirects to login
			├─ login/
			├─ homepage/
			├─ inbox_chat_screen/
			└─ profile-picture/
```

## Quick Start (Local) 🚀

### 1) Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wordtree
PORT=3000
JWT_SECRET=replace_with_a_secure_secret
```
If you are using a cloud mongodb, use that instead of this mongodb URI

Run backend:

```bash
npm start
```

Expected log:

```text
Connected to MongoDB
Server running at http://localhost:3000
```

### 2) Frontend

From the repo root:

```bash
python3 -m http.server 8000
```

Open:

```text
http://127.0.0.1:8000/frontend/Goutam/Word_Tree/index.html
```

## API Base URL Note ⚠️
If using Codespaces, use these instead in the frontend files:

- `frontend/Goutam/Word_Tree/homepage/js/app.js`
- `frontend/Goutam/Word_Tree/login/login.js`
- `frontend/Goutam/Word_Tree/inbox_chat_screen/inbox/inbox.js`

If running locally, no need to change to local/proxy API endpoint.

## Core API Endpoints 🔌

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Health check |
| GET | `/users` | List users (safe fields) |
| POST | `/users/register` | Register user |
| POST | `/users/login` | Login user |
| GET | `/words` | Fetch all word groups |
| POST | `/words` | Create a new word group |
| GET | `/words/:word` | Find group containing a word |
| PATCH | `/words/:id/translations` | Add translation to existing group |
| GET | `/words/conversation/:user1/:user2` | Conversation history |

## Socket Events 💬

| Event | Direction | Purpose |
|---|---|---|
| `register` | client -> server | Associate socket to `userId` room |
| `sendMessage` | client -> server | Persist + deliver structured message |
| `receiveMessage` | server -> client | Realtime incoming message |

## Word Group Data Model 🧩

```json
{
	"translations": [
		{ "language": "en", "words": ["house", "home"] },
		{ "language": "ja", "words": ["家", "住宅"] },
		{ "language": "id", "words": ["rumah"] }
	]
}
```

## Useful Docs 📚

- Backend deep-dive: `backend/README.md`
- Codespaces startup flow: `frontend/WORDTREE_README.md`
- Contribution policy: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`

## Team Notes 🤝

This repository is collaborative and actively evolving. Favor small, clear PRs and keep docs in sync when API contracts or startup steps change.