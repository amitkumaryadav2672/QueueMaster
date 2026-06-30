# QueueMaster

QueueMaster is a waiting queue management web application designed to help small businesses (clinics, barber shops, passport offices, banks, restaurants) manage their active customers.

## Tech Stack
- **Frontend**: React (Vite) served via Nginx
- **Backend**: Node.js (Express)
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose

## Features
- **Add Customer**: Add a customer with name, optional phone, and specific service type.
- **Queue Progress Board**:
  - **Waiting**: Customers who have joined the queue. Can be transitioned to "Being Served" or removed.
  - **Being Served**: Customers currently being served. Can be marked "Completed" or cancelled.
  - **Completed**: Past sessions history with automatic duration metrics.
- **Automatic Status Tracking**: Computes waiting time and service duration.
- **Polling Updates**: Automatically updates state every 10 seconds.

## Environment Variables

### Backend Configuration
Create a `.env` file in the `backend/` folder (or inject them directly into the environment):
- `PORT`: The port on which the Express server runs (default: `5000`).
- `MONGO_URI`: The MongoDB connection URI (default: `mongodb://localhost:27017/queuemaster`).

### Frontend Configuration
Build environment variables for Vite:
- `VITE_API_URL`: The URL of the API gateway (default: `/api` when routed through Nginx, or `http://localhost:5000/api` for direct local development).

---

## Running the Application

### Prerequisites
- **Docker**: Installed and running on the host machine.
- **Docker Compose**: Required to orchestrate all services easily.

---

### Option A: Running with Docker Compose (Recommended)
This option automatically starts MongoDB, the Express backend, and the React frontend (with Nginx reverse-proxy) configured to talk to each other.

1. Navigate to the root workspace directory.
2. Build and start the containers:
   ```bash
   docker compose up --build
   ```

---

### Option B: Running Individual Docker Containers Manually

#### 1. Setup Database
First, ensure you have a running MongoDB instance. If running in Docker:
```bash
docker run -d --name mongo-db -p 27017:27017 mongo:latest
```

#### 2. Backend Container
*   **How to Build**:
    ```bash
    cd backend
    docker build -t queuemaster-backend .
    ```
*   **How to Run**:
    Connect it to the host network (or Docker bridge network) and specify the MongoDB connection string:
    ```bash
    docker run -d --name queuemaster-backend-container -p 5000:5000 -e MONGO_URI=mongodb://host.docker.internal:27017/queuemaster queuemaster-backend
    ```

#### 3. Frontend Container
*   **How to Build**:
    ```bash
    cd ../frontend
    docker build -t queuemaster-frontend .
    ```
*   **How to Run**:
    ```bash
    docker run -d --name queuemaster-frontend-container -p 3000:3000 queuemaster-frontend
    ```

---

## URLs / Endpoints to Access the Application

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend Health Check**: [http://localhost:5000/health](http://localhost:5000/health)
- **Backend API Base**: [http://localhost:5000/api/queue](http://localhost:5000/api/queue)


## Product Decisions & Assumptions
- **Strict FIFO Queue**: The queue strictly enforces first-in, first-out serving. The business owner can only serve the next waiting customer (the oldest ticket at the top of the list). "Serve" buttons are disabled for all subsequent customers until they reach the front of the line, avoiding out-of-order service.
- **Completed History Order**: The "Completed" list sorts sessions by their completion timestamp in descending order (newest first). This keeps the most recently served customers immediately visible at the top of the history.
- **Duplicate Names**: Since multiple customers at a business might share names (e.g., "John Smith"), the app permits duplicate names in the queue. Each customer is assigned a unique identifier (`_id`) in MongoDB.
- **Data Cleanup**: To maintain a lean database, deleting/removing a customer from any stage completely clears their record.

