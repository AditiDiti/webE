# webE: On-Chain Crypto Credit Score Protocol

## Purpose
webE is a protocol that aggregates on-chain user behavior—such as transaction history, staking habits, and DeFi interactions—into a transparent, trustable crypto credit score. This score encourages accountability and enables fairer financial decisions in the decentralized ecosystem.

## How It Works
- **Smart Contract**: Stores and updates user scores on-chain for transparency.
- **Scoring Engine**: Aggregates blockchain data (transaction volume, wallet age, staking, DeFi activity) and calculates a credit score using a transparent algorithm.
- **Backend API**: Serves the score calculation via an Express API.
- **Frontend**: React app lets users check their crypto credit score by entering an Ethereum address.

## Features
- Aggregates multiple on-chain behaviors for a holistic score
- Transparent scoring logic (open-source)
- Modern, user-friendly frontend
- Easy integration with other DeFi platforms

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd webE
```

### 2. Install Dependencies
```sh
npm install
cd frontend
npm install
```

### 3. Set Up Infura
- Get a free Infura Project ID from [infura.io](https://infura.io/)
- Replace `YOUR_INFURA_PROJECT_ID` in `engine/score-engine.js` with your actual Project ID

### 4. Run the Backend (Express API)
```sh
node server.js
```
Backend runs on port 3001.

### 5. Run the Frontend (Vite React App)
```sh
cd frontend
npx vite
```
Frontend runs on port 3002.

### 6. Use the App
- Visit [http://localhost:3002](http://localhost:3002)
- Enter any Ethereum address to view its crypto credit score

## Project Structure
```
contracts/         # Solidity smart contracts
engine/            # Scoring engine (Node.js)
frontend/          # React frontend (Vite)
api/               # Express API route
server.js          # Express server
```

## How the Scoring Works
- **Transaction Score**: Based on transaction count, volume, and wallet age
- **Staking Score**: Based on amount staked and average duration
- **DeFi Score**: Based on number of protocols used and liquidation history
- Scores are weighted and combined for a final credit score

## Customization
- You can improve the scoring algorithm in `engine/score-engine.js`
- Integrate real staking and DeFi data sources for more accuracy
- Extend the frontend for more features or analytics

## License
MIT