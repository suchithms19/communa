# Community API

A RESTful API for managing communities, members, and roles. Built with Node.js, Express, and MongoDB.

## Features

- User authentication (signup/signin)
- Community management (create, list)
- Member management (add, remove)
- Role-based access control
- Input validation
- Error handling with consistent response format

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd communa
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=port_number
MONGODB_URI=your_mongodb_link
JWT_SECRET=your-secret-key
JWT_EXPIRY=30d
```

4. Start the server:
```bash
npm start
```
## Development

The project follows a modular structure:
```
src/
├── config/         # Configuration files
├── middlewares/    # Express middlewares
├── models/         # Mongoose models
├── routes/         # Route handlers
└── utils/         # Utility functions
```
