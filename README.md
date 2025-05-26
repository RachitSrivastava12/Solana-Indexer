Solana Indexer

A full-stack application for indexing and visualizing real-time data from the Solana blockchain. The backend API indexes data like NFT bids, sales, token prices, and lending data, while the frontend provides a user-friendly interface to explore this data. Built with Node.js (backend) and React (frontend), the project is deployed on Vercel with a PostgreSQL database hosted on Render.
Table of Contents

Overview
Features
Tech Stack
Project Structure
Setup
Backend Setup
Frontend Setup


API Endpoints
Deployment
Backend Deployment
Frontend Deployment


Contributing
License

Overview
The Solana Indexer is a full-stack application designed to fetch, process, and display data from the Solana blockchain. The backend indexes various types of data, such as NFT bids and sales from Magic Eden, token prices from Pyth Network and CoinGecko, and lending data from Solend, storing it in a PostgreSQL database. The frontend provides a web interface for users to view this data, including tables of NFT bids, token price histories, and indexing status.
The backend API is deployed at:https://solana-indexer-f33eplon1-rachit-srivastavas-projects-ee6e9b50.vercel.app
The frontend is assumed to be deployed at a separate Vercel URL (e.g., https://solana-indexer-frontend.vercel.app), which you can update below.
Features

NFT Bids and Sales Indexing: Tracks NFT bids and sales on Magic Eden, storing details like NFT address, bidder/buyer, seller, amount, and transaction signature.
Token Price Tracking: Fetches SOL prices from Pyth Network (primary) and CoinGecko (fallback), storing historical and current price data.
Lending Data: Indexes tokens available to borrow on Solend, including available amounts and interest rates.
Custom Queries: Allows users to define custom SQL queries for advanced data retrieval.
Real-Time Indexing: Polls the Solana blockchain every 30 seconds for new transactions (or generates mock data in devnet mode).
Frontend Interface: Displays indexed data in tables and charts, with real-time updates (e.g., NFT bids, token prices).
Debug Endpoints: Provides endpoints to fetch recent signatures and test transaction parsing for debugging.
Rate Limiting: Implements in-memory rate limiting to stay within Helius RPC’s free tier limit (10 req/sec).
Error Handling: Includes retry logic for Solana RPC and external API calls, with comprehensive error logging.

Tech Stack
Backend

Framework: Node.js with Express.js
Blockchain Interaction: @solana/web3.js for Solana blockchain access via Helius RPC
Database: PostgreSQL (hosted on Render)
External APIs:
Pyth Network (for token prices)
CoinGecko (fallback for token prices)


Deployment: Vercel
Dependencies:
express: Web framework
pg: PostgreSQL client
node-fetch: HTTP requests
cors: Cross-Origin Resource Sharing
body-parser: JSON request parsing
dotenv: Environment variable management



Frontend

Framework: React.js
Styling: CSS (or a framework like Tailwind CSS, if used)
API Requests: fetch for interacting with the backend API
Deployment: Vercel
Dependencies:
react: Frontend framework
react-dom: DOM rendering
axios (optional, if used instead of fetch)



Project Structure
solana-indexer/
├── backend/
│   ├── index.js              # Main backend API file
│   ├── package.json          # Backend dependencies
│   ├── .env                  # Environment variables (not committed)
│   └── vercel.json           # Vercel configuration (if needed)
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── components/       # React components (e.g., NftBidsTable.js)
│   │   └── styles/           # CSS styles
│   ├── package.json          # Frontend dependencies
│   ├── .env                  # Frontend environment variables (e.g., API URL)
│   └── vercel.json           # Vercel configuration (if needed)
├── README.md                 # This file
└── LICENSE                   # License file

Setup
Prerequisites

Node.js (v14 or higher)
PostgreSQL database (e.g., hosted on Render)
Helius RPC API key (sign up at Helius)
Vercel account for deployment

Backend Setup

Navigate to the Backend Directory:
cd backend


Install Dependencies:
npm install


Set Up Environment Variables:Create a .env file in the backend/ directory:
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<dbname>
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=<your-helius-api-key>
HELIUS_WS_URL=wss://mainnet.helius-rpc.com/?api-key=<your-helius-api-key>
PORT=5000


Replace <user>, <password>, <host>, <port>, and <dbname> with your PostgreSQL database credentials.
Replace <your-helius-api-key> with your Helius API key.


Run the Backend Locally:
npm start

The API will be available at http://localhost:5000.

Database Setup:The backend automatically creates the necessary tables (nft_bids, nft_prices, tokens_to_borrow, token_prices, token_price_history, custom_queries, indexing_status) on startup. Ensure your PostgreSQL database is running and accessible.


Frontend Setup

Navigate to the Frontend Directory:
cd frontend


Install Dependencies:
npm install


Set Up Environment Variables:Create a .env file in the frontend/ directory:
REACT_APP_API_URL=http://localhost:5000


Update REACT_APP_API_URL to point to your deployed backend URL in production (e.g., https://solana-indexer-f33eplon1-rachit-srivastavas-projects-ee6e9b50.vercel.app).


Run the Frontend Locally:
npm start

The frontend will be available at http://localhost:3000.

Verify API Integration:

Open the frontend in your browser.
Ensure the backend is running (either locally or deployed).
Check the browser’s console and Network tab for API requests (e.g., /api/data-preview/nftBids).



API Endpoints
POST /api/initialize
Initializes the Solana connection.

Body:{
  "rpcUrl": "https://mainnet.helius-rpc.com/?api-key=<your-helius-api-key>",
  "wsUrl": "wss://mainnet.helius-rpc.com/?api-key=<your-helius-api-key>",
  "network": "mainnet"
}


Response:{
  "success": true,
  "message": "Solana connection established",
  "blockHeight": 123456,
  "network": "mainnet"
}



POST /api/start-indexing
Starts indexing for the specified data types.

Body:{
  "dataTypes": {
    "nftBids": true,
    "nftPrices": true,
    "tokensToBorrow": true,
    "tokenPrices": true,
    "customQueries": ["SELECT * FROM nft_bids WHERE amount > 10"]
  }
}


Response:{
  "success": true,
  "message": "Indexing started successfully"
}



POST /api/stop-indexing
Stops all indexing processes.

Response:{
  "success": true,
  "message": "Indexing stopped successfully"
}



GET /api/indexing-status
Retrieves the current indexing status.

Response:{
  "success": true,
  "active": true,
  "startTime": "2025-05-26T18:08:29.123Z",
  "duration": "00:01:30",
  "lastBlockHeight": 123456,
  "recordsProcessed": 5,
  "recordsPerSecond": 0.05,
  "lastUpdated": "2025-05-26T18:09:59.123Z"
}



GET /api/custom-queries
Lists all custom queries.

Response:{
  "success": true,
  "queries": [
    { "id": 1, "query_name": "Custom Query 1", "created_at": "2025-05-26T18:08:29.123Z" }
  ]
}



GET /api/data-preview/:dataType
Previews the 10 most recent records for a given data type (nftBids, nftPrices, tokensToBorrow, tokenPrices).

Example: /api/data-preview/nftBids
Response:{
  "success": true,
  "data": [
    {
      "id": 1,
      "nft_address": "NTYeYJ1wr4bpM5xo6zx5En44SvJFAd35zTxxNoERYqd",
      "bidder": "8Gwdguqu9B96eSGFWJbz49PRuKRT5nZNLBDttm4mDQrh",
      "amount": "2.5",
      "timestamp": "2025-05-26T18:14:10.599Z",
      "signature": "65bvd2rggsXhFhMh39iBcvMXqb3UCKsiDtxH8DaRfAu1a9waofZQxAFy5gweG9EfJwfz1zTdH8BEtTsysPmWmN7E"
    }
  ],
  "tableName": "nft_bids"
}



GET /api/data-type-stats
Retrieves statistics for each data type.

Response:{
  "success": true,
  "stats": [
    { "name": "NFT Bids", "recordCount": 10, "lastUpdate": "1 minute ago", "growth": 5.2 }
  ]
}



GET /api/recent-signatures
Fetches the 5 most recent signatures for the Magic Eden program (debug endpoint).

Response:{
  "success": true,
  "signatures": ["signature1", "signature2", ...]
}



GET /api/test-transaction/:signature
Tests transaction parsing for a given signature (debug endpoint).

Example: /api/test-transaction/<signature>
Response:{
  "success": true,
  "transaction": {...},
  "bidDetails": {...},
  "saleDetails": null,
  "tokensToBorrowDetails": null
}



Deployment
Backend Deployment

Navigate to the Backend Directory:
cd backend


Push to GitHub:Ensure your repository is pushed to GitHub.
git add .
git commit -m "Deploy backend"
git push origin main


Link Vercel:Use the Vercel CLI to deploy:
vercel login
vercel


Set Environment Variables in Vercel:Add the following environment variables via the Vercel dashboard or CLI:
vercel env add DATABASE_URL production
vercel env add HELIUS_RPC_URL production
vercel env add HELIUS_WS_URL production


Deploy:
vercel --prod



Frontend Deployment

Navigate to the Frontend Directory:
cd frontend


Push to GitHub:Ensure your repository is pushed to GitHub (can be the same repo or a separate one).
git add .
git commit -m "Deploy frontend"
git push origin main


Link Vercel:Use the Vercel CLI to deploy:
vercel login
vercel


Set Environment Variables in Vercel:Add the following environment variable for the backend API URL:
vercel env add REACT_APP_API_URL production

Set REACT_APP_API_URL to the deployed backend URL (e.g., https://solana-indexer-f33eplon1-rachit-srivastavas-projects-ee6e9b50.vercel.app).

Deploy:
vercel --prod



Database Hosting
The PostgreSQL database is hosted on Render. Ensure the DATABASE_URL points to your Render database instance.
Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Make your changes and commit (git commit -m "Add your feature").
Push to your branch (git push origin feature/your-feature).
Open a Pull Request.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Built with ❤️ by Rachit Srivastava
