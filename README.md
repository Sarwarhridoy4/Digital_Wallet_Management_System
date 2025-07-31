# Digital Wallet Management System API Documentation

**Base URL:** `http://localhost:5000/api/v1`

A secure, role-based digital wallet API built with **Express.js (TypeScript)** and **MongoDB (Mongoose)**. The system supports three roles: **Users**, **Agents**, and **Admins**. Users can manage their wallets (top-up, send, withdraw), agents can perform cash-in/out transactions (with commission), and admins have full control over users, agents, wallets, and transaction records. The API enables features like user registration/login, wallet management, transaction history, agent verification, and account blocking. All endpoints enforce authentication (JWT) and role-based authorization.

## ⚡ Technologies Used

- **Node.js & Express.js (TypeScript):** Backend framework for building RESTful APIs.
- **MongoDB (Mongoose):** NoSQL database for storing users, wallets, transactions.
- **Authentication:** JSON Web Tokens (JWT) for stateless auth; passwords hashed with **bcrypt**.
- **Validation:** **express-validator** to check request payloads.
- **Email & Media:** **Nodemailer** for sending emails (e.g. password reset links); **Cloudinary** for optional media (image) storage.
- **Configuration:** **dotenv** for environment variables.
- **Admin Credentials:** Environment-configured admin account (email/phone/password) for initial setup.

## 🔒 Authentication

### Register User/Agent

`POST /api/v1/auth/register`

_Request Body (form data):_

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "017XXXXXXXX", // or +880xxxxxxxxxx
  "password": "strongPassword",
  "identifier": "NID", // NID or BIRTH_CERTIFICATE
  "identifier_image": "", // Image less than 2 MB for KYC (Required)
  "profile_picture": "", // Image less than 2 MB(Optional)
  "role": "USER" // or "AGENT" (agent accounts start as "pending")
}
```

- Creates a new **User** or **Agent** account. Agents are marked **pending** until approved by an admin.

### Login

`POST /api/v1/auth/login`

_Request Body (JSON):_

```json
{
  "email": "jane@example.com",
  "password": "strongPassword"
}
```

_Response (JSON):_

```json
{
  "accessToken": "<JWT access token>",
  "refreshToken": "<JWT refresh token>"
}
```

- Validates credentials and returns an **access token** (short-lived) and **refresh token** (long-lived) for authenticated requests.
- Automatically set into the cookies. No need to set manual Authorization Headers.

### Refresh Token

`POST /api/v1/auth/refresh-token`

- Accepts a valid refresh token (from cookies or request body).
- Returns a new access token and refresh token for continued authentication.
- Use this endpoint to maintain user sessions without requiring re-login.
- Requires the refresh token to be valid and not expired.
- No body required.

_Request.cookies (JSON):_

```json
{
  "refreshToken": "<JWT refresh token>"
}
```

_Response (JSON):_

```json
{
  "accessToken": "<new JWT access token>",
  "refreshToken": "<new JWT refresh token>"
}
```



### Logout

`POST /api/v1/auth/logout`

- Invalidates the user's refresh token and clears authentication cookies, effectively logging the user out.
- Requires a valid refresh token in the request cookies or body.
- Recommended for secure session termination.

### (Optional) Forgot/Reset Password

- **Forgot Password:** Agents or users who forget their password can use `POST /api/v1/auth/forgot-password` with their email to receive a reset link via email.
  _Request Body (JSON):_

```json
{
  "email": "yaxelop525@devdigs.com"
}
```

_Response (JSON):_

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Email Sent Successfully",
  "data": null
}
```

- **Reset Password:** A separate endpoint (e.g. `POST /api/v1/auth/reset-password`) would accept a token and new password. (Implementation depends on front-end flow and is supported by the `sendEmail` utility.)
  _Request Body (JSON):_

```json
{
  "newPassword": "StrongP@ssw0rd"
}
```

_Response (JSON):_

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password Changed Successfully",
  "data": null
}
```

## 🔑 Middleware

- `checkAuth(...roles)`: Verifies JWT and enforces that the authenticated user’s role matches one of the allowed roles.
- `isAuthenticated`: Checks for a valid JWT in the request (for any logged-in user).

These middleware functions protect all routes so that only properly authenticated users (and/or specific roles) can access them.

## 👥 User & Agent Management (Admin Only)

All of the following endpoints require an **admin** role.

- **Get All Users & Agents:**
  `GET /api/v1/users`

  - Returns a list of all user and agent accounts (excluding sensitive fields like passwords).

- **Approve Agent or User:**
  `PATCH /api/v1/users/:id/approve`

  - Marks an agent or user as **verified/approved** (depending on role).
  - Use this to activate pending agents or verify new user accounts.

- **Suspend Agent or User:**
  `PATCH /api/v1/users/:id/suspend`

  - Suspends an agent or user (sets status to suspended, preventing login or transactions).

- **Block/Unblock Wallet:**
  `PATCH /api/v1/users/:id/block` – Block user’s wallet (freeze transactions).
  `PATCH /api/v1/users/:id/unblock` – Unblock user’s wallet (re-enable transactions).

These actions allow the admin to control who can transact. For example, blocking an account disables its wallet entirely.

## 💰 Wallet API

Authenticated **Users** (and agents, where applicable) can manage their wallets. Admins can list all wallets.

- **Get Own Wallet:**
  `GET /api/v1/wallets/me`

  - Returns the authenticated user’s wallet details (balance, status, etc.).

- **Top-up Wallet:**
  `PATCH /api/v1/wallets/top-up`
  _Body_: `{ "amount": 500 }`

  - Adds the specified amount to the user’s wallet balance. (E.g. a user deposits money into their account.)

- **Withdraw from Wallet:**
  `PATCH /api/v1/wallets/withdraw`
  _Body_: `{ "amount": 200 }`

  - Subtracts the specified amount from the wallet (if sufficient balance). This could represent transferring money to a bank or external account.

- **Send Money:**
  `PATCH /api/v1/wallets/send`
  _Body_:

  ```json
  {
    "receiverPhone": "01812345678",
    "amount": 100
  }
  ```

  - Transfers the specified amount from the sender’s wallet to another user’s wallet (identified by phone number).

- **Admin: Get All Wallets:**
  `GET /api/v1/wallets`

  - Admin endpoint that returns all wallets in the system. Useful for monitoring and audits.

## 💳 Transaction API

This tracks all wallet transactions. Roles:

- **User/Agent (self) Transaction History:**
  `GET /api/v1/transactions/me`

  - Returns all transactions (cash-in, cash-out, sends, etc.) related to the authenticated user or agent. Agents see transactions they facilitated; users see their own history.

- **Admin: Get All Transactions:**
  `GET /api/v1/transactions`

  - Returns every transaction in the system (across all users and agents).

- **Cash-in (Agent):**
  `POST /api/v1/transactions/cash-in`
  _Body_:

  ```json
  {
    "userPhone": "01712345678",
    "amount": 300
  }
  ```

  - Agent deposits cash into a user’s wallet. The agent’s own wallet balance **decreases** (by amount + commission), and the user’s balance increases by the amount. A small commission is deducted.

- **Cash-out (Agent):**
  `POST /api/v1/transactions/cash-out`
  _Body_:

  ```json
  {
    "userPhone": "01712345678",
    "amount": 200
  }
  ```

  - Agent withdraws cash from a user’s wallet. The user’s balance decreases by the amount, and the agent’s balance increases by (amount – commission).

## ✉️ Validations & Rules

- **Blocked Accounts:** No operations (top-up, send, withdraw, cash-in/out) can be performed if the user’s wallet is **blocked**.
- **Sufficient Funds:** You cannot withdraw or send more than the current balance.
- **Positive Amounts:** Zero or negative transaction amounts are not allowed (must be positive).
- **Agent Commission:** Every cash-in/out transaction by an agent applies a commission (e.g. a percentage fee). The commission is deducted appropriately.

## 📊 Test Cases

| Endpoint                 | Method |    Role    | Expected Status | Description                        |
| ------------------------ | :----: | :--------: | :-------------: | ---------------------------------- |
| `/auth/register`         |  POST  |     –      |       201       | Register a new user or agent       |
| `/auth/login`            |  POST  |     –      |       200       | Login and return JWT tokens        |
| `/auth/forgot-password`  |  POST  |     –      |       200       | Send password reset email          |
| `/wallets/me`            |  GET   |    user    |       200       | View own wallet details            |
| `/wallets/top-up`        | PATCH  |    user    |       200       | Add funds to own wallet            |
| `/wallets/withdraw`      | PATCH  |    user    |       200       | Withdraw funds from own wallet     |
| `/wallets/send`          | PATCH  |    user    |       200       | Send funds to another user         |
| `/wallets`               |  GET   |   admin    |       200       | List all wallets (admin only)      |
| `/users`                 |  GET   |   admin    |       200       | List all users and agents          |
| `/users/:id/block`       | PATCH  |   admin    |       200       | Block a user’s wallet              |
| `/users/:id/unblock`     | PATCH  |   admin    |       200       | Unblock a user’s wallet            |
| `/users/:id/approve`     | PATCH  |   admin    |       200       | Approve a pending agent or user    |
| `/users/:id/suspend`     | PATCH  |   admin    |       200       | Suspend an agent or user           |
| `/transactions/me`       |  GET   | user/agent |       200       | View own transaction history       |
| `/transactions`          |  GET   |   admin    |       200       | List all transactions (admin only) |
| `/transactions/cash-in`  |  POST  |   agent    |       200       | Agent deposits cash into user      |
| `/transactions/cash-out` |  POST  |   agent    |       200       | Agent withdraws cash for user      |

Each test case assumes valid authentication (JWT) and, where applicable, the correct role. For example, only admins can call `/users` or `/wallets` (all users), and only agents can call `/transactions/cash-in` or `/cash-out`.

## 📄 Environment Variables

Create a `.env` file (or use `.env.example`) with the following keys. Replace placeholder values as needed:

```
PORT=5000
DB_URL=<your-mongodb-connection-string>
NODE_ENV=development

# Optional: Frontend URL (for CORS or email links)
FRONTEND_URL=http://localhost:3000

# Cloudinary (if used for media uploads)
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>

# JWT Settings
JWT_ACCESS_SECRET=<your-jwt-access-token-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-token-secret>
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_EXPIRES=30d

# Bcrypt (password hashing)
BCRYPT_SALT_ROUND=10

# Admin Credentials (example)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecurepassword
ADMIN_PHONE=01800000000

# Email (SMTP) Configuration for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password-or-app-password
SMTP_FROM=your-email@example.com
```

These settings configure the server port, database connection, authentication secrets, and email/Cloudinary services.

## 📂 Folder Structure

```
src/
├─ app/
│  ├─ modules/
│  │  ├─ auth/         (authentication controllers/services)
│  │  ├─ user/         (user/agent controllers/services)
│  │  ├─ wallet/       (wallet controllers/services)
│  │  └─ transaction/  (transaction controllers/services)
│  ├─ middlewares/     (auth, validation middlewares)
│  ├─ utils/           (utilities like email sending)
│  └─ config/          (environment and configuration)
├─ server.ts           (app entry point)
└─ ... (other configs and files)
```

This modular layout separates each feature (auth, user, wallet, transaction) into its own directory.

## 🎥 Demo Video Outline (10 min)

1. **Intro:** Project overview (30s)
2. **Folder Structure:** Walk through code organization (1m)
3. **Auth Flow:** Show JWT login and middleware (1m)
4. **User Features:** Demonstrate wallet operations (1m)
5. **Agent Features:** Demonstrate agent cash-in/out (1m)
6. **Admin Features:** Show admin endpoints (approve, block, etc.) (1m)
7. **Postman Test Run:** Live API requests for all endpoints (3–4m)
8. **Wrap Up:** Summary and next steps (30s)

Each segment highlights the implemented functionality and how the API is used.

## 참고문헌

The API and features are implemented in the [Digital_Wallet_Management_System repository](https://github.com/Sarwarhridoy4/Digital_Wallet_Management_System) (Express.js, Mongoose).
Great. I’ll analyze the GitHub repository to extract and incorporate all current endpoints, update the API documentation, test cases, and provide a complete, professional-grade README.
I'll let you know when everything is ready for review.

# Digital Wallet Management System API Documentation

**Base URL:** `http://localhost:5000/api/v1`

A secure, role-based digital wallet API built with **Express.js (TypeScript)** and **MongoDB (Mongoose)**. The system supports three roles: **Users**, **Agents**, and **Admins**. Users can manage their wallets (top-up, send, withdraw), agents can perform cash-in/out transactions (with commission), and admins have full control over users, agents, wallets, and transaction records. The API enables features like user registration/login, wallet management, transaction history, agent verification, and account blocking. All endpoints enforce authentication (JWT) and role-based authorization.

## ⚡ Technologies Used

- **Node.js & Express.js (TypeScript):** Backend framework for building RESTful APIs.
- **MongoDB (Mongoose):** NoSQL database for storing users, wallets, transactions.
- **Authentication:** JSON Web Tokens (JWT) for stateless auth; passwords hashed with **bcrypt**.
- **Validation:** **express-validator** to check request payloads.
- **Email & Media:** **Nodemailer** for sending emails (e.g. password reset links); **Cloudinary** for optional media (image) storage.
- **Configuration:** **dotenv** for environment variables.
- **Admin Credentials:** Environment-configured admin account (email/phone/password) for initial setup.

## 🔒 Authentication

### Register User/Agent

`POST /api/v1/auth/register`

**Request Body (form-data):**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "017XXXXXXXX",
  "password": "strongPassword",
  "identifier": "NID",
  "identifier_image": "<file>",
  "profile_picture": "<file>",
  "role": "USER" // or "AGENT"
}
```
**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Registration successful",
  "data": { "userId": "..." }
}
```
**Test Case:**  
| Endpoint                  | Method | Role | Expected Status | Description                  |
|---------------------------|--------|------|-----------------|------------------------------|
| `/auth/register`          | POST   | –    | 201             | Register a new user or agent |

---

### Login

`POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "strongPassword"
}
```
**Response:**
```json
{
  "accessToken": "<JWT access token>",
  "refreshToken": "<JWT refresh token>"
}
```
**Test Case:**  
| `/auth/login` | POST | – | 200 | Login and return JWT tokens |

---

### Refresh Token

`POST /api/v1/auth/refresh-token`

**Request (cookie or body):**
```json
{
  "refreshToken": "<JWT refresh token>"
}
```
**Response:**
```json
{
  "accessToken": "<new JWT access token>",
  "refreshToken": "<new JWT refresh token>"
}
```
**Test Case:**  
| `/auth/refresh-token` | POST | – | 200 | Refresh JWT tokens |

---

### Logout

`POST /api/v1/auth/logout`

**Request (cookie or body):**
```json
{
  "refreshToken": "<JWT refresh token>"
}
```
**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Logged out successfully"
}
```
**Test Case:**  
| `/auth/logout` | POST | – | 200 | Logout and invalidate tokens |

---

### Forgot Password

`POST /api/v1/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Email Sent Successfully",
  "data": null
}
```
**Test Case:**  
| `/auth/forgot-password` | POST | – | 200 | Send password reset email |

---

### Reset Password

`POST /api/v1/auth/reset-password`

**Request:**
```json
{
  "newPassword": "StrongP@ssw0rd"
}
```
**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password Changed Successfully",
  "data": null
}
```
**Test Case:**  
| `/auth/reset-password` | POST | – | 200 | Reset password with token |

---

## 👥 User & Agent Management (Admin Only)

### Get All Users & Agents

`GET /api/v1/users`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "All users and agents retrieved",
  "data": [ { "id": "...", "name": "...", "role": "...", ... } ]
}
```
**Test Case:**  
| `/users` | GET | admin | 200 | List all users and agents |

---

### Approve Agent or User

`PATCH /api/v1/users/:id/approve`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User/Agent approved",
  "data": { "id": "...", "status": "approved" }
}
```
**Test Case:**  
| `/users/:id/approve` | PATCH | admin | 200 | Approve a pending agent or user |

---

### Suspend Agent or User

`PATCH /api/v1/users/:id/suspend`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User/Agent suspended",
  "data": { "id": "...", "status": "suspended" }
}
```
**Test Case:**  
| `/users/:id/suspend` | PATCH | admin | 200 | Suspend an agent or user |

---

### Block/Unblock Wallet

`PATCH /api/v1/users/:id/block`  
`PATCH /api/v1/users/:id/unblock`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet blocked/unblocked",
  "data": { "id": "...", "isBlocked": true/false }
}
```
**Test Case:**  
| `/users/:id/block` | PATCH | admin | 200 | Block a user’s wallet |
| `/users/:id/unblock` | PATCH | admin | 200 | Unblock a user’s wallet |

---

## 💰 Wallet API

### Get Own Wallet

`GET /api/v1/wallets/me`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet details",
  "data": { "balance": 1000, "isBlocked": false, ... }
}
```
**Test Case:**  
| `/wallets/me` | GET | user | 200 | View own wallet details |

---

### Top-up Wallet

`PATCH /api/v1/wallets/top-up`

**Request:**
```json
{ "amount": 500 }
```
**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Wallet topped up",
  "data": { "balance": 1500 }
}
```
**Test Case:**  
| `/wallets/top-up` | PATCH | user | 200 | Add funds to own wallet |

---

### Withdraw from Wallet

`PATCH /api/v1/wallets/withdraw`

**Request:**
```json
{ "amount": 200 }
```
**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Withdrawal successful",
  "data": { "balance": 1300 }
}
```
**Test Case:**  
| `/wallets/withdraw` | PATCH | user | 200 | Withdraw funds from own wallet |

---

### Send Money

`PATCH /api/v1/wallets/send`

**Request:**
```json
{
  "receiverPhone": "01812345678",
  "amount": 100
}
```
**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Money sent successfully",
  "data": { "balance": 1200 }
}
```
**Test Case:**  
| `/wallets/send` | PATCH | user | 200 | Send funds to another user |

---

### Admin: Get All Wallets

`GET /api/v1/wallets`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "All wallets retrieved",
  "data": [ { "userId": "...", "balance": 1000, ... } ]
}
```
**Test Case:**  
| `/wallets` | GET | admin | 200 | List all wallets (admin only) |

---

## 💳 Transaction API

### User/Agent Transaction History

`GET /api/v1/transactions/me`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User transactions retrieved successfully",
  "data": [ { "type": "send", "amount": 100, ... } ]
}
```
**Test Case:**  
| `/transactions/me` | GET | user/agent | 200 | View own transaction history |

---

### Admin: Get All Transactions

`GET /api/v1/transactions`

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "All transactions retrieved successfully",
  "data": [ { "type": "cash-in", "amount": 300, ... } ]
}
```
**Test Case:**  
| `/transactions` | GET | admin | 200 | List all transactions (admin only) |

---

### Cash-in (Agent)

`POST /api/v1/transactions/cash-in`

**Request:**
```json
{
  "userPhone": "01712345678",
  "amount": 300
}
```
**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Cash-in transaction successful",
  "data": { "transactionId": "...", "commission": 10 }
}
```
**Test Case:**  
| `/transactions/cash-in` | POST | agent | 201 | Agent deposits cash into user |

---

### Cash-out (Agent)

`POST /api/v1/transactions/cash-out`

**Request:**
```json
{
  "userPhone": "01712345678",
  "amount": 200
}
```
**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Cash-out transaction successful",
  "data": { "transactionId": "...", "commission": 10 }
}
```
**Test Case:**  
| `/transactions/cash-out` | POST | agent | 201 | Agent withdraws cash for user |

---

## ✉️ Validations & Rules

- Blocked accounts cannot transact.
- Sufficient funds required for withdrawal/send.
- Amounts must be positive.
- Agent commission applies for cash-in/out.

---

## 📊 Test Cases (Summary Table)

| Endpoint                      | Method | Role      | Status | Description                        |
|-------------------------------|--------|-----------|--------|------------------------------------|
| `/auth/register`              | POST   | –         | 201    | Register a new user or agent       |
| `/auth/login`                 | POST   | –         | 200    | Login and return JWT tokens        |
| `/auth/refresh-token`         | POST   | –         | 200    | Refresh JWT tokens                 |
| `/auth/logout`                | POST   | –         | 200    | Logout and invalidate tokens       |
| `/auth/forgot-password`       | POST   | –         | 200    | Send password reset email          |
| `/auth/reset-password`        | POST   | –         | 200    | Reset password with token          |
| `/users`                      | GET    | admin     | 200    | List all users and agents          |
| `/users/:id/approve`          | PATCH  | admin     | 200    | Approve a pending agent or user    |
| `/users/:id/suspend`          | PATCH  | admin     | 200    | Suspend an agent or user           |
| `/users/:id/block`            | PATCH  | admin     | 200    | Block a user’s wallet              |
| `/users/:id/unblock`          | PATCH  | admin     | 200    | Unblock a user’s wallet            |
| `/wallets/me`                 | GET    | user      | 200    | View own wallet details            |
| `/wallets/top-up`             | PATCH  | user      | 200    | Add funds to own wallet            |
| `/wallets/withdraw`           | PATCH  | user      | 200    | Withdraw funds from own wallet     |
| `/wallets/send`               | PATCH  | user      | 200    | Send funds to another user         |
| `/wallets`                    | GET    | admin     | 200    | List all wallets (admin only)      |
| `/transactions/me`            | GET    | user/agent| 200    | View own transaction history       |
| `/transactions`               | GET    | admin     | 200    | List all transactions (admin only) |
| `/transactions/cash-in`       | POST   | agent     | 201    | Agent deposits cash into user      |
| `/transactions/cash-out`      | POST   | agent     | 201    | Agent withdraws cash for user      |

---
