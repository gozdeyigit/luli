# Luli Backend API

Backend API for the Luli spelling practice application. Built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- 🔐 JWT-based authentication
- 📝 Word list management (CRUD operations)
- 🎯 Practice session tracking
- 📊 Progress tracking and statistics
- 🔒 Secure API with rate limiting and validation
- 🗄️ PostgreSQL database with proper indexing

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or pnpm

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- Database connection details
- JWT secret key
- CORS origin (frontend URL)

3. Create PostgreSQL database:
```bash
createdb luli_db
```

4. Run database migrations:
```bash
npm run migrate
```

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Word Lists

- `POST /api/word-lists` - Create word list
- `GET /api/word-lists` - Get all user's word lists
- `GET /api/word-lists/:id` - Get specific word list
- `PUT /api/word-lists/:id` - Update word list
- `DELETE /api/word-lists/:id` - Delete word list

### Practice Sessions

- `POST /api/practice-sessions` - Create practice session
- `GET /api/practice-sessions` - Get all sessions (optional ?listId filter)
- `GET /api/practice-sessions/:id` - Get specific session
- `DELETE /api/practice-sessions/:id` - Delete session

### Progress

- `GET /api/progress` - Get progress records (optional ?listId filter)
- `GET /api/progress/stats/:listId` - Get detailed stats for a list
- `POST /api/progress/reset` - Reset progress (body: {listId, word?})
- `DELETE /api/progress/:listId` - Delete all progress for a list

## Database Schema

### Users
- id (UUID, PK)
- email (unique)
- password_hash
- name
- preferences (JSONB)
- created_at, last_login_at, updated_at

### Word Lists
- id (UUID, PK)
- user_id (FK → users)
- name
- words (TEXT[], exactly 12)
- audio_recordings (JSONB)
- created_at, last_modified_at, last_practiced_at

### Practice Sessions
- id (UUID, PK)
- user_id (FK → users)
- list_id (FK → word_lists)
- session_type ('teaching' | 'practice')
- attempts (JSONB)
- score, duration_seconds
- completed (boolean)
- session_date, created_at

### Progress Records
- id (UUID, PK)
- user_id (FK → users)
- list_id (FK → word_lists)
- word
- total_attempts, correct_attempts, consecutive_correct
- is_mastered (boolean, true after 3 consecutive correct)
- last_practiced_at, created_at, updated_at

## Security Features

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes per IP)
- JWT token authentication
- Input validation with Zod
- Password hashing with bcrypt
- CORS configuration

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## Environment Variables

```env
PORT=3001
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=luli_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

## Error Handling

All API responses follow this format:

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "error": "Error message"
}
```

## License

MIT