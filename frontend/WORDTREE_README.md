# WordTree Codespace Setup & Startup Guide

This guide covers the setup needed for a **fresh Codespace / new environment** for WordTree.

It assumes the project is located at:

```text
/workspaces/TEAM-1
```

and the backend is at:

```text
/workspaces/TEAM-1/backend
```

## 1. Install backend dependencies

```bash
cd /workspaces/TEAM-1/backend
npm install
npm install socket.io socket.io-client
```



## 3. Configure `.env`

Create:

```text
/workspaces/TEAM-1/backend/.env
```

Example:

```env
MONGODB_URI=YOUR_REAL_MONGODB_CONNECTION_STRING
PORT=3000
JWT_SECRET=YOUR_RANDOM_JWT_SECRET
```

Do **not** commit `.env` to GitHub.

If using local MongoDB:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/wordtree
```

## 4. Install MongoDB if needed

Check:

```bash
mongod --version
```

If `mongod` is not found, MongoDB must be installed in the fresh environment first.

Check Ubuntu version:

```bash
cat /etc/lsb-release
```

Then install the appropriate MongoDB Community package for that Ubuntu version.

## 5. Start MongoDB

Only if using local MongoDB:

```bash
mkdir -p ~/mongodb-data
mongod --dbpath ~/mongodb-data
```

Keep this terminal running.

If using MongoDB Atlas, you do not need to run local `mongod`.

## 6. Start the backend

Open another terminal:

```bash
cd /workspaces/TEAM-1/backend
npm start
```

or:

```bash
node server.js
```

Expected:

```text
Connected to MongoDB
Server running at http://localhost:3000
```

## 7. Test the backend

```bash
curl http://127.0.0.1:3000/words
```

A valid response can be:

```json
[]
```

or actual word data.

## 8. Install the CORS proxy

```bash
npm install -g local-cors-proxy
```

## 9. Start the CORS proxy

```bash
lcp --proxyUrl http://127.0.0.1:3000 --port 8010
```

Keep this terminal running.

## 10. Update `API_BASE_URL`

In Codespaces, open the **PORTS** tab, find port `8010`, and copy its forwarded URL.

Then update frontend `app.js`:

```js
const API_BASE_URL =
    "https://YOUR-NEW-CODESPACE-NAME-8010.app.github.dev/proxy";
```

Important: no trailing slash after `/proxy`.

## 11. Start the frontend

```bash
cd /workspaces/TEAM-1
python3 -m http.server 8000
```

Then open forwarded port `8000`.

# Normal startup order

### Terminal 1 — MongoDB

Only for local MongoDB:

```bash
mongod --dbpath ~/mongodb-data
```

### Terminal 2 — Backend

```bash
cd /workspaces/TEAM-1/backend
npm start
```

### Terminal 3 — Optional API check

```bash
curl http://127.0.0.1:3000/words
```

### Terminal 4 — CORS proxy

```bash
lcp --proxyUrl http://127.0.0.1:3000 --port 8010
```

### Terminal 5 — Frontend

```bash
cd /workspaces/TEAM-1
python3 -m http.server 8000
```

# Startup flow

```text
MongoDB
   ↓
Backend :3000
   ↓
CORS Proxy :8010
   ↓
Frontend :8000
```

# Common errors

## `Cannot find package 'express'`

```bash
cd /workspaces/TEAM-1/backend
npm install
```

## `Cannot find package 'socket.io'`

```bash
cd /workspaces/TEAM-1/backend
npm install socket.io socket.io-client
```

## `Cannot use import statement outside a module`

```bash
npm pkg set type=module
```

## `mongod: command not found`

MongoDB is not installed in the current environment.

## MongoDB connection string is undefined

Make sure `backend/.env` exists and contains:

```env
MONGODB_URI=...
```

## `querySrv ENOTFOUND ... YOUR_CLUSTER.mongodb.net`

Your `.env` still contains a placeholder MongoDB Atlas address.

## `EADDRINUSE :::3000`

Port 3000 is already being used:

```bash
lsof -i :3000
```

Then stop the old process:

```bash
kill <PID>
```

## Browser says `blocked by CORS policy`

Make sure the proxy is running:

```bash
lcp --proxyUrl http://127.0.0.1:3000 --port 8010
```

and `app.js` uses the forwarded `8010` URL plus `/proxy`.

## `/words` returns `404`

Correct proxy path:

```text
https://...-8010.app.github.dev/proxy/words
```

Incorrect:

```text
https://...-8010.app.github.dev/words
```

## `Unexpected token '<' ... is not valid JSON`

Usually means the frontend received an HTML error page such as a 404 instead of JSON.

# Quick health check

```bash
curl http://127.0.0.1:3000/words
```

If this returns JSON, MongoDB + backend are working.
