# QueueMaster

QueueMaster is aWaiting Queue Management web application designed to help small businesses (clinics, barber shops, passport offices, banks, restaurants) manage their active customer queues.

---

## Tech Stack
* **Frontend**: React (Vite) served via Nginx reverse-proxy
* **Backend**: Node.js (Express)
* **Database**: MongoDB (Mongoose) with **Automatic In-Memory Array Fallback**
* **Containerization**: Docker & Docker Compose

---

## Features
* **Add Customer**: Add a customer with name, optional phone, and service type.
* **Priority Queue (VIP Access)**: Easily mark high-priority customers as "VIP" to automatically bubble them to the top of the waiting list while preserving chronological order (FIFO) among VIPs and Normal customers.
* **Queue Progress Board**:
  * **Waiting**: Shows customers in line. Can be transitioned to "Being Served" or deleted.
  * **Being Served**: Shows customers currently being served. Can be marked "Completed" or cancelled.
  * **Completed**: Shows session history with automatic duration metrics.
* **Dynamic Estimated Waiting Time**: Calculates average session durations dynamically from completed sessions and reports wait times for each customer in line.
* **Robust DB Fallback**: If MongoDB is unavailable, the backend automatically falls back to an **In-Memory storage array** to prevent downtime.
* **Auto-Polling Dashboard**: Automatically pulls dashboard updates every 10 seconds.

---

## Folder Structure
```text
QueueMaster/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection setup
│   │   ├── controllers/
│   │   │   └── queueController.js  # API request handlers (MongoDB & In-memory)
│   │   ├── models/
│   │   │   └── Customer.js         # Mongoose schema
│   │   ├── routes/
│   │   │   └── queueRoutes.js      # Express routes mapping
│   │   └── app.js                  # Express application setup
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddCustomerForm.jsx # Add customer input interface
│   │   │   ├── CustomerCard.jsx    # Card component with status buttons
│   │   │   └── QueueColumn.jsx     # Waiting/Serving/Completed columns
│   │   ├── services/
│   │   │   └── api.js              # Fetch requests to API
│   │   ├── App.jsx                 # Dashboard coordinator
│   │   ├── index.css               # Styling
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf                  # Nginx proxy configuration
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Environment Variables

### Backend Configuration
Create a `.env` file in the `backend/` folder:
* `PORT`: The port on which the Express server runs (default: `5000`).
* `MONGO_URI`: The MongoDB connection URI (default: `mongodb+srv://...` for Atlas, or `mongodb://mongo:27017/queuemaster` for local).

### Frontend Configuration
* `VITE_API_URL`: The URL of the API gateway (default: `/api` when routed through Nginx proxy, or `http://localhost:5000/api` for direct local development).

---

## Running the Application

### Option A: Running with Docker Compose (Recommended)
This launches the Node backend, React frontend (with Nginx reverse-proxy), and configures network bindings automatically:

1. Navigate to the root directory.
2. Build and start the services:
   ```bash
   docker compose up --build
   ```

---

### Option B: Running Individual Docker Containers Manually

#### 1. Setup Backend Container
* **Step 1: Build the backend Docker container**
  ```bash
  cd backend
  docker build -t queuemaster-backend .
  ```
* **Step 2: Run the backend Docker container**
  Run the container exposing port 5000:
  ```bash
  docker run -d --name queuemaster-backend -p 5000:5000 -e PORT=5000 -e MONGO_URI="mongodb+srv://amityadav847409_db_user:5S4NKpYYPBITbzoH@cluster0.y5lopmn.mongodb.net/queuemaster" queuemaster-backend
  ```

#### 2. Setup Frontend Container
* **Step 1: Build the frontend Docker container**
  ```bash
  cd ../frontend
  docker build -t queuemaster-frontend .
  ```
* **Step 2: Run the frontend Docker container**
  Run the container exposing port 3000:
  ```bash
  docker run -d --name queuemaster-frontend -p 3000:3000 queuemaster-frontend
  ```

---

### Option C: Running Locally (For Quick Testing)
If you don't have Docker installed, you can run the services directly on your host machine:

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   *(Note: If no MongoDB connection is configured or fails to connect, the server will automatically fallback to an in-memory storage array).*

2. **Start Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## Access URLs

* **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000) (when using Docker/Docker Compose) or [http://localhost:5173](http://localhost:5173) (when using local Dev Server)
* **Backend Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
* **Backend API Base**: [http://localhost:5000/api/queue](http://localhost:5000/api/queue)

---

## Product Decisions & Assumptions (Mandatory QA)

1. **Should duplicate customer names be allowed?**
   * **Yes**. In business queues, multiple customers can share names (e.g. two "Amit"s). The system handles this by assigning a unique ID (`_id`) to every session.
2. **Can a completed customer return to the queue?**
   * **Yes**. A completed customer is treated as a past session. The same customer can join the waiting list again as a new session.
3. **Should the queue always be FIFO?**
   * **Primarily, Yes**. Chronological first-in, first-out serving is the standard. However, we also support a **VIP Priority** system, where VIPs bubble to the top of the waiting list and are served in FIFO sequence relative to other VIPs.
4. **What happens if the queue is empty?**
   * The columns render a clean, empty placeholder displaying `"No customers in queue."`
5. **Staff/Owner Admin Control**:
   * To prevent guests from modifying the queue statuses, we implemented a password-protected **Admin Mode** (password: `admin123`). Guests can add themselves and see wait times, but only admins can trigger transitions (Serve, Complete, Cancel, Delete).

---

## Compromises Made (1-Hour Limit)
* **Web Sockets vs Polling**: Implemented a lightweight 10-second polling sync instead of real-time Socket.IO which requires heavier configuration.
* **Basic Auth**: Implemented client-side password locks (`admin123`) rather than setting up full OAuth or session cookies with backend JWT verification.
* **Automatic Fallback DB**: Handled fallback in-memory database storage directly in the controller layer rather than building a separate database repository layer.

---

## Future Scope (If given another 3 hours)
* **Twilio SMS Gateway**: Replace console mock logging with actual SMS notifications sent via Twilio API keys when status changes.
* **Socket.IO Integration**: Implement real-time websockets to synchronize state across dashboards instantly without periodic API requests.
* **Analytics & Performance Tracking**: Build a dashboard showing daily peak hours, staff average serve times, and queue completion ratios.
* **Multi-Tenant Dashboard**: Expand database schemas to support multiple barber shops/clinics under separate login portals.

* **Customer Feedback Loop**: Provide a simple rating screen for customers once their session is marked completed.
