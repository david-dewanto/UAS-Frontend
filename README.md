# Final Task (Teknologi Sistem Terintegrasi)
## David Dewanto / 18222027 / K1

# FinTrackIt - Financial Portfolio Tracking Application

## Overview
FinTrackIt is a comprehensive financial portfolio tracking application specifically designed for the Indonesian Stock Market (IDX). It offers real-time portfolio monitoring, stock analysis, and portfolio optimization features.

## Features
- 📈 Real-time portfolio tracking
- 📊 Advanced stock analysis tools
- 🔄 Portfolio optimization using Modern Portfolio Theory
- 📱 Responsive design for all devices
- 🔐 Secure authentication system
- 📚 Developer API access

## Tech Stack
- Frontend Framework: React + Vite
- UI Components: shadcn/ui
- Styling: Tailwind CSS
- Authentication: Firebase
- Charts: Recharts
- API Client: Axios
- State Management: React Context
- Routing: React Router

## Prerequisites
Before running this application, make sure you have:
- Node.js (v16 or higher)
- npm or yarn
- Firebase account for authentication
- Git for version control

## Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_URL=your_api_url
BACKEND_URL=your_backend_url
INTERNAL_API_KEY=your_internal_api_key
```

## Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/fintrackit.git
cd fintrackit
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Project Structure
```
fintrackit/
├── src/
│   ├── app/              # App-specific components
│   ├── assets/           # Static assets
│   ├── components/       # Reusable components
│   │   ├── developer/    # Developer documentation components
│   │   ├── investments/  # Investment-related components
│   │   └── ui/          # UI components from shadcn
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and API clients
│   ├── pages/           # Application pages
│   └── styles/          # Global styles
├── public/              # Public assets
└── api/                 # API proxy configuration
```

## Key Features Breakdown

### Authentication
- Email/Password login
- Google OAuth integration
- Protected routes
- Token-based authentication

### Investment Dashboard
- Portfolio summary
- Current holdings
- Performance metrics
- Transaction history

### Stock Analysis
- Historical price data
- Technical indicators
- Risk metrics
- Sharpe ratio calculation

### Portfolio Optimization
- Modern Portfolio Theory implementation
- Risk-return optimization
- Portfolio rebalancing suggestions
- Feasible ranges calculation

### Developer API
- Authentication endpoints
- Stock data endpoints
- Portfolio analysis endpoints
- Email service integration

## Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)