# Sendeliver Project Documentation

## Project Overview
Sendeliver is a real-time logistics platform connecting clients with carriers through an intelligent matching system. The platform supports multiple user types, hierarchical access levels, and a demonstration system for new users.

## Domain Structure

### Main Domain
- **www.sendeliver.com**
  - Split interface for clients and carriers
  - Minimalist search forms (required: "from" location)
  - Real-time tables showing available vehicles and cargo

### Public Subdomains (Demo)
- **carriers.sendeliver.com**
- **clients.sendeliver.com**

### Private Domains
- **[company].sendeliver.com**
  - Customized for each registered organization
  - Based on account type (CLIENT/HAULER/FORWARDER)

## Access Levels

### 🔴 Anonymous without Cookies
- Basic search functionality
- Demo version with reset on each visit
- Limited real-time table access

### 🟡 Anonymous with Cookies
- Search history saved
- Persistent demo data
- Full real-time table access
- Vehicle/cargo tracking

### 🟢 Registered Users
- Custom subdomain access
- Complete functionality
- User hierarchy management
- Statistics and history

## User Hierarchy

### Organization Structure
- Main Administrator
- Sub-administrators/Dispatchers
- Regular users/Drivers

## Account Types

### CLIENT
- Cargo management
- Vehicle tracking
- Shipment administration

### HAULER
- Vehicle management
- Transport acceptance
- Journey records

### FORWARDER
- Combined functionality
- Mode switching (client/carrier)
- Comprehensive management

## Demo System

### Features
- Available on public subdomains
- Core functionality simulation
- Cookie-based data persistence
- Conversion path to full version

### Demo Limitations
- Maximum 3 virtual vehicles/shipments
- Limited tracking time
- Demo watermark

## Technical Stack

### Frontend
- React
- WebSocket client
- Cookie/LocalStorage management

### Backend
- Node.js
- Express
- WebSocket server
- Redis cache

### Database
- PostgreSQL (dbsd)
- User management
- Transaction history
- Vehicle/cargo tracking

## Real-time Features

### Client View
- Available vehicles table
- Live tracking
- Status updates

### Carrier View
- Available cargo table
- Route optimization
- Real-time notifications

## Security & Authentication
- Multi-level access control
- Secure WebSocket connections
- Cookie-based session management
- Domain-based access restrictions

## Progressive Engagement
Users are encouraged to progress from anonymous to registered through:
1. Demo system exposure
2. Cookie-based preferences
3. Registration benefits
4. Full platform access