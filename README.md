# SenDeliver Delivery Platform

Modern delivery platform connecting customers with reliable carriers in real-time.

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL with PostGIS extension
- WebSocket for real-time communication
- Redis for caching and pub/sub

### Frontend
- React
- WebSocket client for real-time updates
- Tailwind CSS

## Project Structure

```
sendeliver/
├── .vscode/                    # VS Code settings and configurations
├── back/                       # Backend application
│   ├── config/                 # Configuration files
│   │   ├── redis.js           # Redis connection and setup
│   │   └── websocket.js       # WebSocket server setup
│   ├── services/              # Business logic services
│   │   ├── cacheService.js    # Redis caching logic
│   │   └── wsService.js       # WebSocket handling
│   ├── utils/                 # Utility functions
│   │   └── errorHandler.js    # Error handling utils
│   ├── node_modules/          # Backend dependencies
│   ├── package.json           # Backend dependencies and scripts
│   └── server.js              # Main server entry point
│
└── front/                      # Frontend application
    ├── public/                 # Static files
    │   ├── animations/         # Lottie animation files
    │   └── index.html         # Main HTML template
    ├── src/                   # React source code
    │   ├── components/        # React components
    │   ├── services/          # Frontend services
    │   │   └── websocket.js   # WebSocket client service
    │   └── App.js            # Main React component
    ├── node_modules/          # Frontend dependencies
    └── package.json           # Frontend dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v14+)
- Redis

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/sendeliver.git
cd sendeliver
```

2. Backend setup
```bash
cd back
npm install
```

3. Frontend setup
```bash
cd front
npm install
```

### Development

1. Start the backend server:
```bash
cd back
npm start
```

2. Start the frontend development server:
```bash
cd front
npm start
```

The development server will run on http://localhost:3000

### Building for Production

Frontend:
```bash
cd front
npm run build
```

## Key Features

1. Real-time Communication
- WebSocket for instant updates
- Automatic carrier matching
- Live order tracking

2. Location Services
- PostGIS for geospatial queries
- Efficient carrier search
- Route optimization

3. Caching
- Redis for performance optimization
- Session management
- Real-time data caching

## Development Guidelines

### Git Workflow
1. Create feature branches from `main`
2. Use conventional commit messages
3. Submit PRs for review

### Code Style
- Use ESLint configuration provided
- Follow Prettier formatting
- Write JSDoc comments for functions

## Deployment

The application is deployed on Render:
- Frontend: Static Site
- Backend: Web Service
- Database: Managed PostgreSQL

### Environment Variables

Backend (.env):
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
```

Frontend (.env):
```
REACT_APP_API_URL=https://api.sendeliver.com
REACT_APP_WS_URL=wss://api.sendeliver.com
```

## Domain Structure

- sendeliver.com - Main application
- www.sendeliver.com -> redirects to main domain
- firma.sendeliver.com - Client subdomains
- api.sendeliver.com - API endpoints

## Common Issues & Solutions

1. WebSocket Connection Issues
- Verify WebSocket URL configuration
- Check SSL certificates
- Confirm firewall settings

2. Database Performance
- Use appropriate indexes
- Optimize PostGIS queries
- Monitor query performance

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Contact

For development questions:
- Open an issue on GitHub
- Contact the tech lead directly

## License

This project is proprietary software. All rights reserved.
