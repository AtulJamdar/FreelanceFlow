# FreelanceFlow

A MERN stack client portal and invoicing system designed for freelancers. Streamline your workflow by managing clients, tracking projects and milestones, generating auto-sequenced PDF invoices, recording payments, and automating overdue reminders.

---

## 🛠 Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Nodemailer, PDFKit, node-cron
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios
- **Database**: MongoDB Atlas

---

## 📁 Repository Structure
```
FreelanceFlow/
├── backend/            # Express REST API Server
│   ├── src/
│   │   ├── config/     # Database and Env loader
│   │   ├── middleware/ # Auth validation and errors
│   │   ├── modules/    # Auth, Clients, Projects, Invoices, Payments, Dashboard
│   │   └── utils/      # PDF generators, Nodemailer, API helpers
│   └── server.js       # Entry point
├── frontend/           # React SPA Client
│   ├── src/
│   │   ├── api/        # Axios configurations
│   │   ├── components/ # Common UI Layouts
│   │   ├── context/    # Auth Context Provider
│   │   └── pages/      # Dashboard, Auth, Clients, Projects, Invoices
│   └── package.json
└── api-tests/          # REST client HTTP scripts
```

---

## ⚙️ Environment Variables

Configure these variables by creating `.env` files in `backend/` and `frontend/` directories. Refer to `.env.example` inside those folders.

### Backend Configurations (`backend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Local host port | `5000` |
| `NODE_ENV` | Mode of operation | `development` or `production` |
| `MONGODB_URI` | Database connection URI | `mongodb://localhost:27017/freelanceflow` |
| `JWT_SECRET` | Secret token signature | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT session lifetime | `7d` |
| `EMAIL_USER` | NodeMailer SMTP username | `your-gmail-address@gmail.com` |
| `EMAIL_PASS` | NodeMailer SMTP app password | `your-google-app-password` |
| `SMTP_HOST` | NodeMailer SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | NodeMailer SMTP port | `587` |
| `CRON_TIMEZONE` | Timezone context for scans | `Asia/Kolkata` |
| `FRONTEND_URL` | Vercel or local client URL | `http://localhost:3000` |

### Frontend Configurations (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | API endpoint gateway | `http://localhost:5000/api/v1` |

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or an Atlas connection string)

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/FreelanceFlow.git
cd FreelanceFlow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Setup Database and Mailers
1. Create a MongoDB database (local or Atlas cluster).
2. Get your SMTP credentials (like a Gmail App Password) to enable invoice delivery.
3. Configure the `.env` files inside `backend/` and `frontend/` matching `.env.example`.

### Step 3: Run the Servers
#### Run Backend in Development Mode
```bash
cd backend
npm run dev
```
The server will boot up on `http://localhost:5000` and confirm connection to MongoDB.

#### Run Frontend in Development Mode
```bash
cd frontend
npm run dev
```
The client app will open on `http://localhost:3000` with hot-reloading active.

---

## 🧪 Testing

### Automated Scratch Verification
You can verify the backend functionality using our automated test scripts located under the `.gemini` brain directory:
```bash
# Run Authentication tests
node path-to-artifact/testAuth.js

# Run Invoices / PDF tests
node path-to-artifact/testInvoices.js

# Run Payments & Automation cron tests
node path-to-artifact/testPayments.js

# Run Dashboard aggregation tests
node path-to-artifact/testDashboard.js
```

### Manual REST Client Tests
We provide a master API request suite in [FreelanceFlow.http](file:///d:/Projects/MERN_Stack/FreelanceFlow/api-tests/FreelanceFlow.http). Use the VS Code REST Client extension to execute the requests sequentially.

---

## 🚢 Production Deployment

### 1. MongoDB Atlas
1. Deploy a free cluster on MongoDB Atlas.
2. Whitelist Render's IP addresses (or allow access from anywhere `0.0.0.0/0`).
3. Copy the connection string to your environment variables.

### 2. Backend (Render)
1. Link your GitHub repository to Render.
2. Create a new **Web Service** pointing to the `backend/` folder.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure all backend environment variables listed above in Render settings.

### 3. Frontend (Vercel)
1. Link the repository to Vercel.
2. Select the `frontend/` directory.
3. Framework Preset: **Vite**
4. Configure Build Command as `npm run build` and Output Directory as `dist`.
5. Set `VITE_API_BASE_URL` in Vercel to your public Render service URL (`https://your-backend.onrender.com/api/v1`).
