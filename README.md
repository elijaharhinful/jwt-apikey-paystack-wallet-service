# Paystack Wallet Service

A backend wallet service built with NestJS, supporting Paystack deposits, P2P transfers, and dual authentication (Google OAuth & API Keys).

## Features

- **Authentication**:
  - Google Sign-In -> JWT (User access)
  - API Keys -> For service-to-service access (with permissions)
- **Wallet**:
  - Create wallet per user
  - Deposit via Paystack (Standard & Webhook verification)
  - Transfer funds to other users (Atomic transactions)
  - View Balance & Transaction History
- **Security**:
  - API Key hashing, expiration, and rollover
  - Payload validation
  - Guard-based permission checks

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=paystack_wallet
   
   JWT_SECRET=supersecretkey
   
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   
   PAYSTACK_SECRET_KEY=sk_test_xxxx
   PAYSTACK_CALLBACK_URL=http://localhost:3000/wallet/paystack/webhook
   ```

3. **Database**
   PostgreSQL must be running. The app uses `synchronize: true` for development, so tables will be auto-created.

4. **Run**
   ```bash
   npm run start:dev
   ```

## Webhooks & Ngrok

To receive Webhooks from Paystack functionality locally (e.g., verifying deposits), you need to expose your local server to the internet using **Ngrok**.

1.  **Install Ngrok**: [Download](https://ngrok.com/download) and install.
2.  **Run Ngrok**:
    ```bash
    ngrok http 3000
    ```
3.  **Update Paystack Dashboard**:
    - Copy the `https` forwarding URL (e.g., `https://1234.ngrok-free.app`).
    - Go to Paystack Dashboard -> Settings -> API Keys & Webhooks.
    - Set **Webhook URL** to: `https://your-ngrok-url.ngrok-free.app/wallet/paystack/webhook`
4.  **Update .env (Optional)**:
    - Update `PAYSTACK_CALLBACK_URL` if you want the user to be redirected correctly after payment initialization.

## API Endpoints

### Auth
- `GET /auth/google` - Initiate Google Login
- `GET /auth/google/callback` - Callback, returns JWT

### API Keys
- `POST /keys/create` (Auth: JWT)
  - Body: `{ "name": "service1", "permissions": ["deposit", "read"], "expiry": "1D" }`
- `POST /keys/rollover` (Auth: JWT)
  - Body: `{ "expired_key_id": "uuid", "expiry": "1M" }`

### Wallet
- `POST /wallet/deposit` (Auth: JWT/API Key + 'deposit')
  - Body: `{ "amount": 500000 }` (amount in kobo, 100 kobo = 1 Naira)
  - Returns Paystack auth URL.
- `GET /wallet/deposit/:reference/status`
  - Check transaction status.
- `POST /wallet/paystack/webhook`
  - Paystack webhook handler.
- `POST /wallet/transfer` (Auth: JWT/API Key + 'transfer')
  - Body: `{ "wallet_number": "recipient_wallet_id", "amount": 100000 }` (amount in kobo)
- `GET /wallet/balance` (Auth: JWT/API Key + 'read')
- `GET /wallet/transactions` (Auth: JWT/API Key + 'read')

## Testing
- Use Postman or curl.
- For API Keys, set `x-api-key` header.
- For JWT, set `Authorization: Bearer <token>`.
