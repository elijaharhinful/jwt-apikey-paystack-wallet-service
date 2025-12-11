# Paystack Wallet Service with JWT & API Keys

A production-ready backend wallet service built with **NestJS**, **TypeORM**, and **PostgreSQL**. This service enables users to deposit money via Paystack, manage wallet balances, view transaction history, and transfer funds between users. Authentication is handled through **Google OAuth (JWT)** for users and **API Keys** for service-to-service access.

---

## 🎯 Features

### Authentication
- **Google Sign-In** → Generates JWT tokens for user access
- **API Keys** → Service-to-service authentication with granular permissions
- Maximum 5 active API keys per user
- API key expiration and rollover functionality

### Wallet Operations
- **Deposits** via Paystack with webhook verification
- **Wallet-to-wallet transfers** with atomic transactions
- **Balance checking** and **transaction history**
- Automatic wallet creation for new users

### Security
- API key hashing with bcrypt
- Paystack webhook signature verification
- Permission-based access control
- Idempotent transaction processing

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**
- **Git**

You'll also need accounts for:
- **Google Cloud Console** (for OAuth credentials)
- **Paystack** (for payment processing)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/elijaharhinful/jwt-apikey-paystack-wallet-service.git
cd jwt-apikey-paystack-wallet-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE paystack_wallet;

# Exit PostgreSQL
\q
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=paystack_wallet

# JSON Web Token Secret
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRY=1d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_CALLBACK_URL=http://localhost:3000/wallet/paystack/webhook

# Application Port
PORT=3000

NODE_ENV=development
```

---

## 🔐 Setting Up Google OAuth

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**

### Step 2: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://your-production-domain.com/auth/google/callback` (for production)
5. Copy the **Client ID** and **Client Secret**
6. Paste them into your `.env` file

---

## 💳 Setting Up Paystack

### Step 1: Create a Paystack Account

1. Sign up at [Paystack](https://paystack.com/)
2. Complete your business verification (for live keys)

### Step 2: Get Your API Keys

1. Go to **Settings** → **API Keys & Webhooks**
2. Copy your **Secret Key** (starts with `sk_test_` for test mode)
3. Paste it into your `.env` file as `PAYSTACK_SECRET_KEY`

### Step 3: Configure Webhooks (Important!)

For local development, you need to expose your local server to the internet:

#### Using Ngrok:

1. **Install Ngrok**: Download from [ngrok.com](https://ngrok.com/download)

2. **Start your application** (in one terminal):
   ```bash
   npm run start:dev
   ```

3. **Run Ngrok** (in another terminal):
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

5. **Configure Paystack Webhook**:
   - Go to Paystack Dashboard → **Settings** → **API Keys & Webhooks**
   - Set **Webhook URL** to: `https://your-ngrok-url.ngrok-free.app/wallet/paystack/webhook`
   - Save changes

> **Note**: For production, replace the ngrok URL with your actual domain.

---

## 🏃 Running the Application

### Development Mode

```bash
npm run start:dev
```

The server will start at `http://localhost:3000`

### Production Mode

```bash
# Build the application
npm run build

# Run migrations
npm run migration:run

# Start production server
npm run start:prod
```

---

## 📚 API Documentation

Once the application is running, access the interactive **Swagger UI** documentation at:

```
http://localhost:3000/api/docs
```

---

## 🔑 Authentication Guide

### Option 1: JWT (User Authentication)

#### Step 1: Sign in with Google

1. Open your browser and navigate to:
   ```
   http://localhost:3000/auth/google
   ```

2. Sign in with your Google account

3. After successful authentication, you'll receive a JSON response:
   ```json
   {
     "user": {
       "id": "uuid",
       "email": "your-email@gmail.com",
       "google_id": "109011518663757710676",
       "wallet": {
         "balance": 10930000,
         "currency": "kobo",
         "wallet_number": "3511720321883"
       }
     },
     "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```
   
   > **Note**: The wallet balance is in kobo (100 kobo = ₦1). 


4. Copy the `jwt` token

#### Step 2: Use JWT in Requests

**In Swagger UI:**
- Click **Authorize** button (top right)
- Select **JWT (http, Bearer)**
- Enter: `Bearer your_jwt_token_here`
- Click **Authorize** then **Close**

**In Postman/cURL:**
```bash
curl -H "Authorization: Bearer your_jwt_token_here" \
     http://localhost:3000/wallet/balance
```

### Option 2: API Keys (Service-to-Service)

#### Step 1: Create an API Key

First, authenticate with JWT, then:

```bash
POST http://localhost:3000/keys/create
Authorization: Bearer your_jwt_token

{
  "name": "my-service",
  "permissions": ["deposit", "transfer", "read"],
  "expiry": "1M"
}
```

**Expiry Options:**
- `1H` = 1 Hour
- `1D` = 1 Day
- `1M` = 1 Month
- `1Y` = 1 Year

**Response:**
```json
{
  "id": "uuid",
  "api_key": "sk_live_abc123...",
  "expires_at": "2025-01-10T12:00:00Z"
}
```

#### Step 2: Use API Key in Requests

**In Swagger UI:**
- Click **Authorize** button
- Select **API-Key**
- Enter your API key
- Click **Authorize** then **Close**

**In Postman/cURL:**
```bash
curl -H "x-api-key: sk_live_abc123..." \
     http://localhost:3000/wallet/balance
```

---

## 💰 API Endpoints Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/google` | Initiate Google OAuth | No |
| GET | `/auth/google/callback` | OAuth callback (auto) | No |

### API Key Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/keys/create` | Create new API key | JWT |
| POST | `/keys/rollover` | Rollover expired key | JWT |
| DELETE | `/keys/:key_id` | Revoke API key | JWT |

#### Create API Key
```json
POST /keys/create
{
  "name": "wallet-service",
  "permissions": ["deposit", "transfer", "read"],
  "expiry": "1D"
}
```

#### Rollover API Key
```json
POST /keys/rollover
{
  "expired_key_id": "uuid",
  "expiry": "1M"
}
```

### Wallet Operations

| Method | Endpoint | Description | Auth Required | Permissions |
|--------|----------|-------------|---------------|-------------|
| POST | `/wallet/deposit` | Deposit via Paystack | JWT or API Key | `deposit` |
| GET | `/wallet/deposit/:reference/status` | Check deposit status | JWT or API Key | `read` |
| POST | `/wallet/paystack/webhook` | Paystack webhook | No (verified) | - |
| POST | `/wallet/transfer` | Transfer to another wallet | JWT or API Key | `transfer` |
| GET | `/wallet/balance` | Get wallet balance | JWT or API Key | `read` |
| GET | `/wallet/transactions` | Get transaction history | JWT or API Key | `read` |

#### Deposit Money
```json
POST /wallet/deposit
{
  "amount": 500000
}

Response:
{
  "reference": "ref_abc123",
  "authorization_url": "https://checkout.paystack.com/..."
}
```

> **Note**: Amounts are in **kobo** (100 kobo = ₦1)

#### Transfer Money
```json
POST /wallet/transfer
{
  "wallet_number": "recipient_wallet_number",
  "amount": 100000
}

Response:
{
  "status": "success",
  "message": "Transfer completed"
}
```

#### Get Balance
```json
GET /wallet/balance

Response:
{
  "balance": 1500000
}
```

#### Get Transactions
```json
GET /wallet/transactions

Response:
[
  {
    "type": "deposit",
    "amount": 500000,
    "status": "success"
  },
  {
    "type": "transfer",
    "amount": 100000,
    "status": "success"
  }
]
```

---

## 💵 Currency Information

**All amounts are in KOBO** (Nigerian Naira minor unit)

- **100 kobo = ₦1 (1 Naira)**
- Minimum deposit: **10,000 kobo** (₦100)
- Minimum transfer: **100 kobo** (₦1)

### Currency Field

- The `balance` value is in kobo, not Naira
- Example: `{ "balance": 10930000, "currency": "kobo" }` means **₦109,300** (not ₦10,930,000)

### Examples:
- To deposit **₦5,000**: `{ "amount": 500000 }`
- Balance of **1,500,000 kobo** = **₦15,000**
- To transfer **₦1,000**: `{ "amount": 100000 }`

---

## 🧪 Testing the Application

### 1. Test Google Authentication

```bash
# Open in browser
http://localhost:3000/auth/google
```

### 2. Test Deposit Flow

1. Authenticate and get JWT
2. Create a deposit:
   ```bash
   POST /wallet/deposit
   { "amount": 500000 }
   ```
3. Open the `authorization_url` in your browser
4. Complete payment on Paystack
5. Paystack will send a webhook to your server
6. Check your balance:
   ```bash
   GET /wallet/balance
   ```

### 3. Test Transfer Flow

1. Create two users (sign in with two different Google accounts)
2. Note the wallet numbers
3. Deposit money into the first wallet
4. Transfer from first wallet to second:
   ```bash
   POST /wallet/transfer
   {
     "wallet_number": "second_wallet_number",
     "amount": 100000
   }
   ```

---

## 🗂️ Database Migrations

### Generate a New Migration

```bash
npm run migration:generate --name=MigrationName
```

### Create an Empty Migration

```bash
npm run migration:create --name=MigrationName
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

---

## 🛠️ Development Tools

### Linting

```bash
npm run lint
```

---

## 📁 Project Structure

```
paystack-wallet-service/
├── src/
│   ├── common/              # Shared utilities, guards, decorators
│   ├── config/              # Configuration files (database, env)
│   ├── migrations/          # TypeORM migrations
│   └── modules/
│       ├── api-keys/        # API key management
│       ├── auth/            # Google OAuth & JWT
│       ├── paystack/        # Paystack integration
│       ├── users/           # User management
│       └── wallets/         # Wallet operations
├── test/                    # Test files
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment file
├── package.json
└── README.md
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable HTTPS** in production
4. **Validate Paystack webhooks** using signature verification
5. **Limit API key permissions** to only what's needed
6. **Rotate API keys regularly**
7. **Use environment-specific credentials** (test vs. production)

---

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Paystack Webhook Not Receiving Events

1. Ensure ngrok is running
2. Verify webhook URL in Paystack dashboard
3. Check ngrok logs for incoming requests
4. Verify `PAYSTACK_SECRET_KEY` is correct

### Google OAuth Redirect Mismatch

1. Ensure callback URL in `.env` matches Google Cloud Console
2. Check for trailing slashes
3. Verify the domain (localhost vs. production)

---

## 📝 API Key Permissions

Available permissions for API keys:

- **`deposit`** - Allow deposits via Paystack
- **`transfer`** - Allow wallet-to-wallet transfers
- **`read`** - Allow reading balance and transaction history

**Example:**
```json
{
  "permissions": ["deposit", "read"]
}
```
This key can deposit and read, but **cannot transfer**.

---

## 🌐 Deployment

### Environment Variables for Production

Update these in your `.env` for production:

```env
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://your-domain.com/auth/google/callback
PAYSTACK_CALLBACK_URL=https://your-domain.com/wallet/paystack/webhook
PAYSTACK_SECRET_KEY=sk_live_your_live_key
```

### Running in Production

```bash
npm run build
npm run start:prod
```

---

## 📄 License

This project is licensed under the **UNLICENSED** license.
