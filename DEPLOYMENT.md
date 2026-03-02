# Deployment Guide for Luli

This guide will help you deploy the Luli application to production using Vercel (frontend) and Railway (backend + database).

## Prerequisites

- GitHub account (already set up ✅)
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app)

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Click "Login" and sign in with your GitHub account
3. Authorize Railway to access your GitHub repositories

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `gozdeyigit/luli`
4. Railway will detect your backend automatically

### Step 3: Add PostgreSQL Database
1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. The database connection string will be available as `DATABASE_URL`

### Step 4: Configure Environment Variables
In Railway project settings, add these environment variables:

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your_production_secret_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app-name.vercel.app
```

**Important:** Railway will automatically provide these database variables:
- `DATABASE_URL` (automatically set by Railway)
- Or individual variables: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

### Step 5: Update Database Configuration
Railway provides `DATABASE_URL`, so update `backend/src/config/database.ts` to use it:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### Step 6: Run Database Migrations
1. In Railway, go to your backend service
2. Click on "Settings" → "Deploy"
3. Add a deploy command: `npm run migrate && npm start`
4. Or run migrations manually in Railway's terminal

### Step 7: Get Backend URL
1. Once deployed, Railway will provide a public URL
2. Copy this URL (e.g., `https://luli-backend-production.up.railway.app`)
3. You'll need this for the frontend configuration

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up" and use your GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository: `gozdeyigit/luli`
3. Vercel will detect it's a Vite project

### Step 3: Configure Build Settings
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 4: Add Environment Variables
In Vercel project settings, add:

```
VITE_API_URL=https://your-railway-backend-url.up.railway.app
```

Replace with your actual Railway backend URL from Part 1, Step 7.

### Step 5: Deploy
1. Click "Deploy"
2. Vercel will build and deploy your frontend
3. You'll get a URL like `https://luli.vercel.app`

### Step 6: Update Backend CORS
1. Go back to Railway
2. Update the `CORS_ORIGIN` environment variable with your Vercel URL
3. Example: `CORS_ORIGIN=https://luli.vercel.app`
4. Railway will automatically redeploy

## Part 3: Update Frontend API Configuration

Create a file `frontend/src/config/api.ts`:

```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

Then update your API calls to use this configuration.

## Part 4: Final Steps

### 1. Test Your Deployment
- Visit your Vercel URL
- Try creating an account
- Test creating word lists
- Verify practice sessions work

### 2. Set Up Custom Domain (Optional)
**Vercel:**
- Go to Project Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

**Railway:**
- Go to Service Settings → Networking
- Add custom domain
- Update DNS records

### 3. Monitor Your Application
**Railway:**
- View logs in the Railway dashboard
- Monitor database usage
- Check for errors

**Vercel:**
- View deployment logs
- Monitor function invocations
- Check analytics

## Troubleshooting

### Backend Issues
- **Database connection fails:** Check Railway database credentials
- **CORS errors:** Verify `CORS_ORIGIN` matches your Vercel URL exactly
- **Migration fails:** Run migrations manually in Railway terminal

### Frontend Issues
- **API calls fail:** Check `VITE_API_URL` environment variable
- **Build fails:** Ensure all dependencies are in `package.json`
- **404 errors:** Verify routing configuration in `vercel.json`

## Cost Estimates

### Railway (Free Tier)
- $5 free credit per month
- Includes PostgreSQL database
- Suitable for development and small projects

### Vercel (Hobby - Free)
- Unlimited deployments
- 100GB bandwidth per month
- Perfect for personal projects

## Automatic Deployments

Both platforms support automatic deployments:
- **Push to GitHub** → Automatic deployment
- **Pull requests** → Preview deployments
- **Main branch** → Production deployment

## Security Checklist

- ✅ Use strong JWT_SECRET in production
- ✅ Enable SSL/HTTPS (automatic on both platforms)
- ✅ Set proper CORS_ORIGIN
- ✅ Never commit `.env` files
- ✅ Use environment variables for all secrets
- ✅ Enable rate limiting (already configured)
- ✅ Keep dependencies updated

## Support

- Railway: https://railway.app/help
- Vercel: https://vercel.com/support
- GitHub Issues: https://github.com/gozdeyigit/luli/issues

---

**Congratulations!** Your Luli application is now deployed to production! 🎉