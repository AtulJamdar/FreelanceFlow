# FreelanceFlow

FreelanceFlow is a MERN stack application designed to help freelancers manage clients, track projects and milestones, generate invoices, record payments, and monitor dashboard stats.

## Project Structure

```
freelanceflow/
├── backend/       # Express API server (Mongoose/MongoDB)
└── frontend/      # React client application (Vite/Tailwind CSS)
```

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas account)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environment variables:
   Create a `.env` file based on `.env.example` and fill in the details.
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure env vars:
   Create a `.env` file (see `.env.example`) and set `VITE_API_BASE_URL`.
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
