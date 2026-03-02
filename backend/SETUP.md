# Luli Backend Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=luli_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Set Up PostgreSQL Database

#### Option A: Using psql command line

```bash
# Create database
createdb luli_db

# Or using psql
psql -U postgres
CREATE DATABASE luli_db;
\q
```

#### Option B: Using PostgreSQL GUI (pgAdmin, DBeaver, etc.)

1. Connect to your PostgreSQL server
2. Create a new database named `luli_db`

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables and indexes.

### 5. Start the Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## Verify Installation

### Check Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## Troubleshooting

### Database Connection Issues

**Error: "Connection refused"**
- Ensure PostgreSQL is running: `pg_isready`
- Check your DB_HOST and DB_PORT in `.env`
- Verify PostgreSQL is accepting connections

**Error: "Database does not exist"**
- Create the database: `createdb luli_db`
- Or check DB_NAME in `.env` matches your database name

**Error: "Authentication failed"**
- Verify DB_USER and DB_PASSWORD in `.env`
- Check PostgreSQL user permissions

### Port Already in Use

If port 3001 is already in use:
1. Change PORT in `.env` to another port (e.g., 3002)
2. Update CORS_ORIGIN in frontend if needed

### JWT Secret Not Set

**Error: "JWT_SECRET not configured"**
- Generate a secure random string for JWT_SECRET
- You can use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add it to your `.env` file

### Migration Fails

If migration fails:
1. Check database connection
2. Ensure you have CREATE TABLE permissions
3. Drop and recreate the database if needed:
   ```bash
   dropdb luli_db
   createdb luli_db
   npm run migrate
   ```

## Development Tips

### Hot Reload

The development server uses `tsx watch` for automatic reloading when you make changes to TypeScript files.

### Database Inspection

View your tables:
```bash
psql -U postgres -d luli_db
\dt
```

View table structure:
```sql
\d users
\d word_lists
\d practice_sessions
\d progress_records
```

### Testing API Endpoints

Use tools like:
- **curl** (command line)
- **Postman** (GUI)
- **Thunder Client** (VS Code extension)
- **REST Client** (VS Code extension)

### Viewing Logs

The server logs all database queries in development mode. Check the console output for:
- Query execution times
- Database errors
- API request details

## Production Deployment

### Environment Variables

Set these for production:
```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DB_PASSWORD=<secure-password>
CORS_ORIGIN=https://your-frontend-domain.com
```

### Build and Run

```bash
npm run build
npm start
```

### Database Backup

Regular backups are recommended:
```bash
pg_dump -U postgres luli_db > backup.sql
```

Restore from backup:
```bash
psql -U postgres luli_db < backup.sql
```

## Next Steps

1. ✅ Backend is running
2. Configure frontend to use backend API
3. Test all endpoints with real data
4. Set up proper error monitoring
5. Configure production database
6. Set up CI/CD pipeline

## Support

For issues or questions:
- Check the main [README.md](./README.md) for API documentation
- Review the [PRD](../frontend/PRD.md) for feature requirements
- Check database schema in [schema.sql](./src/db/schema.sql)