# 📆 Digital Wallet API Documentation

**Base URL:** `http://localhost:5000/api/v1`

---

## 🔹 Overview

A secure, role-based Digital Wallet API built with **Express.js**, **MongoDB**, and **TypeScript**. The system supports users, agents, and admins to perform digital transactions like top-up, send, withdraw, cash-in, and cash-out, along with wallet and transaction management.

---

## ⚡ Technologies Used

- **Backend Framework**: Express.js (TypeScript)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcrypt
- **Validation**: express-validator
- **Environment Config**: dotenv

---

## 🔒 Authentication

### Register User/Agent

`POST /api/v1/auth/register`

```json
{
  "name": "Sarwar",
  "email": "sarwar@example.com",
  "phone": "01712345678",
  "password": "123456",
  "role": "user"
}
```

- Roles: `user`, `agent` (agents default to `pending` status)

### Login

`POST /api/v1/auth/login`

```json
{
  "email": "sarwar@example.com",
  "password": "123456"
}
```

**Response:** `{ accessToken, refreshToken }`

---

## 🔑 Middleware

- `checkAuth(...roles)`: Auth + Role guard
- `isAuthenticated`: Verifies JWT

---

## 👤 User & Agent Management (Admin Only)

### Get All Users & Agents

`GET /api/v1/users`

### Block/Unblock Wallet

`PATCH /api/v1/users/:id/block`
`PATCH /api/v1/users/:id/unblock`

### Approve/Suspend Agent

`PATCH /api/v1/users/:id/approve`
`PATCH /api/v1/users/:id/suspend`

---

## 💰 Wallet API

### Get Own Wallet

`GET /api/v1/wallets/me`

### Top-up Wallet

`PATCH /api/v1/wallets/top-up`

```json
{
  "amount": 500
}
```

### Withdraw

`PATCH /api/v1/wallets/withdraw`

```json
{
  "amount": 200
}
```

### Send Money

`PATCH /api/v1/wallets/send`

```json
{
  "receiverPhone": "01812345678",
  "amount": 100
}
```

### Admin: Get All Wallets

`GET /api/v1/wallets`

---

## 💳 Transaction API

### Get My Transactions

`GET /api/v1/transactions/me`

### Get All Transactions (Admin)

`GET /api/v1/transactions`

### Cash-in (Agent)

`POST /api/v1/transactions/cash-in`

```json
{
  "userPhone": "01712345678",
  "amount": 300
}
```

### Cash-out (Agent)

`POST /api/v1/transactions/cash-out`

```json
{
  "userPhone": "01712345678",
  "amount": 200
}
```

---

## ✉️ Validations & Rules

- Cannot operate on blocked wallet
- Sufficient balance required for withdrawal/send
- No zero or negative values allowed
- Agent cash-in/out adds commission

---

## 📊 Test Cases

| Endpoint              | Method | Role  | Expected Status | Description              |
| --------------------- | ------ | ----- | --------------- | ------------------------ |
| /auth/register        | POST   | -     | 201             | Register user/agent      |
| /auth/login           | POST   | -     | 200             | Login & return tokens    |
| /wallets/me           | GET    | user  | 200             | View wallet              |
| /wallets/top-up       | PATCH  | user  | 200             | Add balance              |
| /wallets/send         | PATCH  | user  | 200             | Transfer funds           |
| /transactions/me      | GET    | agent | 200             | View transaction history |
| /transactions/cash-in | POST   | agent | 200             | Agent deposits to user   |
| /users/\:id/block     | PATCH  | admin | 200             | Admin blocks wallet      |
| /transactions         | GET    | admin | 200             | View all transactions    |

---

## 📄 .env Example

```
PORT=5000
DB_URL=mongodb://localhost:27017/wallet
JWT_SECRET=yourVeryStrongSecretKeyHere
BCRYPT_SALT_ROUND=10
```

---

## 📅 Folder Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── wallet/
│   │   └── transaction/
│   ├── middlewares/
│   ├── utils/
│   └── config/
├── server.ts
└── ...
```

---

## 🎥 Demo Video Outline (10 min)

1. **Intro**: Project & Developer (30s)
2. **Folder Structure** (1 min)
3. **JWT Auth Flow** (1 min)
4. **User Features** (1 min)
5. **Agent Features** (1 min)
6. **Admin Features** (1 min)
7. **Postman Test Run** (3-4 mins)
8. **Wrap Up** (30s)

---

## ✅ Final Status

| Feature                           | Done |
| --------------------------------- | ---- |
| JWT Auth + bcrypt                 | ✅   |
| Role Middleware                   | ✅   |
| User/Agent/Admin + Wallet Schema  | ✅   |
| Transactions: add, withdraw, send | ✅   |
| Agent: cash-in/out                | ✅   |
| Admin: block, approve, view       | ✅   |
| Error handling                    | ✅   |
| Postman + README.md               | ✅   |
| Demo video                        | ✅   |
