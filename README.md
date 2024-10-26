markdownCopy# SenDeliver Platform
-----------------------------------------------------------------------------

Modern logistics platform connecting clients with carriers in real-time.

## 1. Quick Start
-----------------------------------------------------------------------------

Inštalácia:
```bash
git clone https://github.com/yourusername/sendeliver.git
cd sendeliver
Backend setup:
bashCopycd back
npm install
npm start
Frontend setup:
bashCopycd front
npm install
npm start
2. Project Structure

Štruktúra projektu:
plaintextCopysendeliver/
├── back/                      # Backend application
│   ├── config/               # Configuration files
│   │   ├── redis.js         # Redis connection setup
│   │   └── websocket.js     # WebSocket server config
│   ├── services/            # Business logic services
│   │   ├── cacheService.js  # Redis caching logic
│   │   └── wsService.js     # WebSocket handling
│   ├── package.json         # Backend dependencies
│   ├── app.js              # Express application setup
│   └── server.js           # Main server entry point
│
└── front/                    # Frontend application
    ├── public/              # Static files
    │   ├── animations/      # Lottie animation files
    │   └── index.html      # Main HTML template
    └── src/                # React source code
        ├── components/     # React components
        ├── pages/         # Page components
        ├── services/      # Frontend services
        └── App.js        # Main React component
3. Tech Stack

Frontend:

React
React Router
WebSocket client
Tailwind CSS
Lottie animations

Backend:

Node.js & Express
WebSocket server (ws)
Redis cache
PostgreSQL (dbsd)
PostGIS extension

4. Environment Variables

Backend (.env):
envCopyDATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your-secret
Frontend (.env):
envCopyREACT_APP_API_URL=https://api.sendeliver.com
REACT_APP_WS_URL=wss://api.sendeliver.com
5. Domain Structure

Main Domain:

sendeliver.com
www.sendeliver.com

Public Subdomains (Demo):
plaintextCopycarriers.sendeliver.com
clients.sendeliver.com
Private Domains:
plaintextCopy[company].sendeliver.com
6. Access Levels

User Types:
plaintextCopy🔴 Anonymous without Cookies
   - Basic search
   - Demo access
   - Limited features

🟡 Anonymous with Cookies
   - Search history
   - Persistent demo
   - Full tables

🟢 Registered Users
   - Custom domain
   - Full access
   - Management tools
7. Core Features

Real-time Features:

Live tracking
Instant matching
Status updates

AI Integration:

Natural language search
Route optimization
Smart matching

User Management:
plaintextCopyOrganization Hierarchy:
├── Main Administrator
├── Dispatchers
└── Regular Users/Drivers
8. Development Guidelines

Git Workflow:
bashCopygit checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature
Code Style:

ESLint config
Prettier format
JSDoc comments

9. Deployment

Render Setup:
Backend (Web Service):
bashCopynpm install
npm start
Frontend (Static Site):
bashCopynpm run build
10. Support

Contact:

GitHub Issues for bugs
Direct contact for business

License

Proprietary software. All rights reserved.
Copy
Takýto formát je lepší? Jasne oddelené sekcie a zvýraznené kódové bloky? CopyRetryClaude does not have the ability to run the code it generates yet. Claude does not have internet access. Links provided may not be accurate or up to date.Jano, ale co mam zobrat do clipboardu a preniest na github?EditCelý obsah medzi trojitými backtickmi. Konkrétne od:
markdownCopy# SenDeliver Platform
po:
CopyProprietary software. All rights reserved.