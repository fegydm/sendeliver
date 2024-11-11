# SenDeliver Platform

Modern logistics platform connecting clients with carriers through real-time matching and AI-powered search.

## Project Structure

```plaintext
.
├── front/                          # Frontend React application
│   ├── config/                     # Configuration files
│   │   ├── vite.config.ts         # Vite configuration
│   │   └── vitest.config.ts       # Vitest configuration
│   ├── public/                    # Static files
│   │   ├── favicon.ico
│   │   ├── flags/                 # Country flags
│   │   ├── animations/            # Lottie animations
│   │   └── video/                 # Public videos
│   ├── src/
│   │   ├── assets/               # Static assets
│   │   │   ├── icons/
│   │   │   ├── images/
│   │   │   └── styles/
│   │   ├── components/           # React components
│   │   │   ├── ui/              # Basic UI components
│   │   │   ├── forms/           # Form components
│   │   │   ├── layout/          # Layout components
│   │   │   └── shared/          # Shared components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility functions and helpers
│   │   ├── providers/           # React context providers
│   │   ├── services/            # API services
│   │   │   ├── api/
│   │   │   └── websocket/
│   │   ├── stores/              # State management
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utility functions
│   │   ├── views/               # Main application pages
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── test/                    # Test utilities and setup
│   └── scripts/                 # Build and deployment scripts
│
├── back/                        # Backend Node.js application
│   ├── config/                  # Configuration files
│   │   ├── babel.config.json
│   │   ├── jest.config.js
│   │   ├── database.js         # Database configuration
│   │   ├── env.js              # Environment configuration
│   │   ├── logger.js           # Logger configuration
│   │   └── redis.js            # Redis configuration
│   ├── routes/                 # API routes
│   ├── services/               # Business logic services
│   └── src/                    # Source code
│
└── package.json                # Root project config
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sendeliver.git
cd sendeliver

# Install dependencies
npm run install:all

# Set up environment variables
cp .env.example .env
```

### Development

```bash
# Start development servers
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Domain Structure

### Main Domain
- sendeliver.com

### Public Demos
- carriers.sendeliver.com
- clients.sendeliver.com

### Private Domains
- [company].sendeliver.com

## Access Levels

🔴 **Anonymous**
- Basic search functionality
- Demo version
- Limited features

🟡 **Cookie Users**
- Search history
- Persistent demo data
- Full features access

🟢 **Registered**
- Custom subdomain
- Complete functionality
- User management
- Statistics

## Core Features

### Real-time Matching
- WebSocket communication
- Live vehicle tracking
- Instant cargo updates

### AI Integration
- Natural language search
- Route optimization
- Intelligent matching

### User Management
```plaintext
Organization Structure:
├── Main Administrator
├── Dispatchers
└── Regular Users/Drivers
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- TailwindCSS for styling
- WebSocket client
- Lottie animations
- Vitest for testing

### Backend
- Node.js & Express
- WebSocket server (ws)
- Redis cache
- PostgreSQL with PostGIS
- Jest for testing

## Development Scripts

### Root Level
```bash
npm run dev          # Development mode
npm start           # Production mode
npm run clean       # Clean builds
```

### Frontend
```bash
cd front
npm run dev         # Vite development
npm run build       # Build for production
npm run test        # Run tests
```

### Backend
```bash
cd back
npm run dev         # Development with nodemon
npm start          # Production server
npm run test       # Run tests
```

## Environment Variables

See `.env.example` files in root, frontend, and backend directories for all available options.

## Deployment

Deployment configurations available for:
- Render
- Docker
- PM2

## License

Proprietary software. All rights reserved.