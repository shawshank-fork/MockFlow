# MockFlow 🚀

MockFlow is a lightweight, developer-first **Dynamic Mock API Generator & Webhook Inspector** built with Node.js, Express 5, and SQLite. 

It allows you to configure mock HTTP endpoints on the fly (with custom status codes, headers, responses, and delays) and inspect incoming request payloads (acting as a local alternative to tools like Webhook.site or Mockoon).

---

## 💡 Real-World Use Cases

1. **Frontend Isolation:** Build and test frontend applications without waiting for the actual backend to be built or running. Just mock the endpoints you need.
2. **Webhook Inspection:** Safely test third-party integrations (such as Stripe, GitHub, or Twilio webhooks) locally. Send webhooks to MockFlow and inspect the exact headers, query parameters, and JSON payloads.
3. **Simulating Edge Cases:** Test how your application handles edge cases by configuring mocks to return specific HTTP status codes (e.g., `429 Too Many Requests`, `504 Gateway Timeout`) or custom response headers.
4. **Latency Testing:** Simulate slow networks or database timeouts by adding custom delays (e.g., `delayMs: 3000`) to your mock endpoints.

---

## 🛠️ Features

* **Dynamic Path Wildcard Routing:** Intercepts any nested URL path dynamically under `/mock/*` using Express 5.
* **SQLite Persistence:** Uses `better-sqlite3` to store mock configurations and logs efficiently.
* **Artificial Latency Simulator:** Pause responses by a configurable amount of milliseconds to test loading states.
* **Custom Headers & Status Codes:** Set custom HTTP response headers and status codes dynamically.
* **Webhook Logger:** Automatically captures and inspects details of incoming requests (method, headers, body, query parameters).

---

## 📁 Project Structure

```text
mockflow/
├── src/
│   ├── server.js         # Express App Initialization & Port Listener
│   ├── db.js             # SQLite Database Schema Setup (mocks & request_logs)
│   ├── routes/
│   │   ├── admin.js      # CRUD API for configuring mocks
│   │   └── mock.js       # Dynamic Catch-All Mock Engine
├── .env                  # Environment Variables Configuration
├── .gitignore            # Git Ignored Files (database, node_modules)
└── package.json          # Node.js Scripts & Dependencies
```

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 3. Configuration
Configure your `.env` file in the root directory:
```env
PORT=3000
DATABASE_URL=database.db
```

### 4. Running the App
Start the database initialization and run the development server with live reload:
```bash
# Initialize DB tables (only needed once, or runs automatically on imports)
node src/db.js

# Start the server in watch mode
npm run dev
```

---

## 📖 API Reference

### Administrative API (under `/api`)

#### 1. Create a Mock Endpoint
* **URL:** `/api/mocks`
* **Method:** `POST`
* **Content-Type:** `application/json`
* **Payload:**
  ```json
  {
    "path": "users/profile",
    "method": "GET",
    "status": 200,
    "responseBody": { "id": 101, "name": "Alex" },
    "headers": { "X-Custom-Header": "MockFlow" },
    "delayMs": 1000
  }
  ```
* **Response:** `201 Created`
  ```json
  {
    "message": "Mock created successfully",
    "mockId": 1
  }
  ```

#### 2. Get All Configured Mocks
* **URL:** `/api/mocks`
* **Method:** `GET`
* **Response:** `200 OK` (Array of mock configurations)

#### 3. Delete a Mock Configuration
* **URL:** `/api/mocks/:id`
* **Method:** `DELETE`
* **Response:** `200 OK`

#### 4. Get Captured Request Logs for a Mock
* **URL:** `/api/mocks/:id/logs`
* **Method:** `GET`
* **Response:** `200 OK` (Array of captured request payloads)

---

### Dynamic Mock Engine (under `/mock`)

Once you've configured a mock, call it dynamically:
* **URL Pattern:** `/mock/{path}`
* **Method:** Match the configured HTTP method (`GET`, `POST`, `PUT`, `DELETE`, etc.)
* **Example:** `POST http://localhost:3000/mock/users/profile`
