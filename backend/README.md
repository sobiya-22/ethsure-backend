# EthSure Backend

EthSure is a decentralized insurance claiming platform. This backend is built with Node.js, Express, and MongoDB, and provides secure APIs for user authentication, role-based access, KYC, and claim management.

## Features
- **Web3Auth & JWT Authentication**: Secure login with wallet/social/email, JWT-based session management.
- **Role-Based Access**: Supports Admin, Agent, and Customer roles with protected routes.
- **KYC & Registration**: Customer and Agent KYC flows, user onboarding, and role selection.
- **Claim Management**: APIs for submitting and tracking insurance claims (extendable).
- **Admin Tools**: User management, analytics, and claim approval endpoints.
- **Modern ESM Syntax**: Uses ES modules (`import/export`) throughout.

## Tech Stack
- Node.js 18+
- Express 5
- MongoDB (with Mongoose)
- JWT (jsonwebtoken)
- dotenv, cors, cookie-parser
- Web3Auth (for wallet/social/email login)

## Getting Started

### 1. Clone the repository
```bash
git clone <repo-url>
cd ethsure-new/backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the backend root:
```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
PORT=8000
```

### 4. Run the server
```bash
npm run dev
```
The server will start on `http://localhost:8000` (or your specified port).

## Project Structure
```
backend/
  controllers/      # Route controllers (auth, customer, agent, admin)
  middleware/       # Auth middleware (JWT, role checks)
  models/           # Mongoose models (User, Customer, Agent, Admin)
  routes/           # Express routes (auth, customer, agent, admin)
  utils/            # Utility functions (DB connection, etc.)
  index.js          # Main server entry point
  package.json      # Project config
  .env              # Environment variables
```

## API Endpoints (Sample)
- `POST /api/auth/login` — Login/register via Web3Auth
- `PUT /api/auth/role` — Set user role (protected)
- `POST /api/customer/kyc` — Customer KYC
- `POST /api/agent/kyc` — Agent KYC
- `GET /api/admin/` — List admins

## Notes
- All backend code uses ESM (`type: module` in package.json).
- Make sure your MongoDB instance is running and accessible.
- For full platform functionality, use with the EthSure frontend.

## License
MIT
