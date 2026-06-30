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
* **Queue Progress Board**:
  * **Waiting**: Shows customers in line. Can be transitioned to "Being Served" or deleted.
  * **Being Served**: Shows customers currently being served. Can be marked "Completed" or cancelled.
  * **Completed**: Shows session history with automatic duration metrics.
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
This starts the Node backend and React frontend (with Nginx proxying `/api` requests to the backend) in containerized environments:

1. Navigate to the root directory.
2. Build and start the containers:
   ```bash
   docker compose up --build
   ```

### Option B: Running Locally (For Quick Testing)
If you don't have Docker installed, you can run the application directly on your host machine.

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```
   *(Note: If no MongoDB database is detected locally or via `.env`, the server will automatically log a fallback warning and use an in-memory storage array instead).*

2. **Start Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## Access URLs

* **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000) (when using Docker Compose) or [http://localhost:5173](http://localhost:5173) (when using local Dev Server)
* **Backend Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
* **Backend API Base**: [http://localhost:5000/api/queue](http://localhost:5000/api/queue)

---

## Product Decisions & Assumptions
1. **Strict FIFO Serving**: The queue enforces first-in, first-out sequence. The "Serve" button is only active for the customer at the top of the Waiting list (next-in-line). Other cards display a tooltip stating they must wait for the front customer to be served.
2. **Duplicate Names**: The system permits duplicate names (e.g. multiple "Amit" entries) and differentiates them using automatically generated unique IDs (`_id`).
3. **Completed Sessions History**: The Completed list sorts sessions by their completion timestamp in descending order (newest first) to ensure immediate visibility of recently completed actions.
4. **Data Cleanup**: Removing/deleting a customer completely clears their record from the active/historical dataset to keep storage clean and lean.

---

## Future Scope (If given another 3 hours)
* **Role-Based Authentication**: Separate Owner/Staff dashboard and public queue visibility screens.
* **Estimate Waiting Time**: Algorithm to calculate and display estimated waiting time for queue members based on average historical completion times.
* **Socket.IO Integration**: Replace 10s auto-polling with real-time websocket pushes for instant state synchronizations across all active dashboards.
* **SMS Notifications**: Automated SMS alerts (e.g. Twilio) when a customer reaches "Next-in-line" status.
* **Priority Queue**: Flag VIP/Urgent customers to move them to the top of the waiting list.
