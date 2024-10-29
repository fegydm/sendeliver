# SenDeliver Platform

Modern logistics platform connecting clients with carriers through real-time matching and AI-powered search.

## Project Structure

```plaintext
.
├── front/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── hooks/                 # React custom hooks
│   │   ├── layouts/               # Page layouts
│   │   ├── pages/                 # Application pages
│   │   ├── services/              # API and WebSocket services
│   │   ├── tests/                 # Test pages and components
│   │   ├── app.front.js           # Main frontend application
│   │   ├── index.js               # React entry point
│   │   ├── index.css              # Global Tailwind styles
│   │   └── app.front.css          # Main component styles
│   ├── public/
│   │   ├── animations/            # Lottie animations
│   │   └── video/                 # Public videos
│   └── package.json               # Frontend config
│
├── back/
│   ├── src/
│   │   ├── models/                # Database models
│   │   └── controllers/           # Request handlers
│   ├── services/                  # Backend services
│   ├── config/                    # App configuration
│   ├── server.js                  # Main server file
│   └── package.json               # Backend config
│
└── package.json                   # Root project config
Quick Start

Installation:

bashCopygit clone https://github.com/yourusername/sendeliver.git
cd sendeliver
npm run install:all

Development:

bashCopynpm run dev

Production:

bashCopynpm start
Domain Structure

Main Domain: sendeliver.com
Public Demos:

carriers.sendeliver.com
clients.sendeliver.com


Private Domains: [company].sendeliver.com

Access Levels
🔴 Anonymous

Basic search functionality
Demo version
Limited features

🟡 Cookie Users

Search history
Persistent demo data
Full features access

🟢 Registered

Custom subdomain
Complete functionality
User management
Statistics

Core Features
Real-time Matching

WebSocket communication
Live vehicle tracking
Instant cargo updates

AI Integration

Natural language search
Route optimization
Intelligent matching

User Management
plaintextCopyOrganization Structure:
├── Main Administrator
├── Dispatchers
└── Regular Users/Drivers
Tech Stack
Frontend

React 18
TailwindCSS
WebSocket client
Lottie animations

Backend

Node.js & Express
WebSocket server (ws)
Redis cache
PostgreSQL with PostGIS

Development
Scripts
bashCopy# Root
npm run dev          # Development mode
npm start           # Production mode
npm run clean       # Clean builds

# Frontend
cd front
npm run dev         # React development
npm start           # Serve production
npm run build       # Build for production

# Backend
cd back
npm run dev         # Nodemon development
npm start           # Production server
Environment Variables
Backend (.env):
envCopyDATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
Frontend (.env):
envCopyREACT_APP_API_URL=https://api.sendeliver.com
REACT_APP_WS_URL=wss://api.sendeliver.com
Deployment
Render configuration:

Web Service (Backend)

Build: npm install
Start: npm start


Static Site (Frontend)

Build: npm run build
Publish directory: build



License
Proprietary software. All rights reserved.