# PostgreSQL Migration Guide

This guide explains how to complete the migration from SQLite to Vercel Postgres.

## ✅ What's Been Done

1. **Installed `@vercel/postgres` package** - The Postgres client for Vercel
2. **Updated `db/database.js`** - Replaced SQLite with Vercel Postgres
3. **Updated SQL syntax** - Changed `SUBSTR` to `SUBSTRING` for PostgreSQL compatibility
4. **Updated `server.js`** - Database initialization works in both local dev and serverless
5. **Created compatibility layer** - The database API remains the same (query, run, get, init)

## 🔧 What You Need to Do

### Step 1: Create a Vercel Postgres Database

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create one)
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name for your database (e.g., `bike-mechanic-db`)
7. Select a region (choose the closest to your users)
8. Click **Create**

### Step 2: Get Your Database Connection Details

After creating the database:

1. In the database settings, you'll see connection details
2. Vercel automatically sets these as environment variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

**The `@vercel/postgres` package automatically uses these environment variables** - no configuration needed!

### Step 3: Set Environment Variables for Local Development

For local development, you need to set these in your `.env` file:

```env
# Vercel Postgres connection (use the values from your Vercel dashboard)
POSTGRES_URL=postgres://user:password@host:5432/database
POSTGRES_PRISMA_URL=postgres://user:password@host:5432/database
POSTGRES_URL_NON_POOLING=postgres://user:password@host:5432/database
POSTGRES_USER=your_user
POSTGRES_HOST=your_host
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=your_database

# Your existing Strava credentials (keep these)
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
```

**To get these values:**
1. In Vercel dashboard, go to your database settings
2. Look for "Connection String" or "Environment Variables"
3. Copy the values (they're already set in Vercel, but you need them locally)

### Step 4: Test Locally

1. Make sure your `.env` file has the Postgres connection variables
2. Run your server:
   ```bash
   npm start
   ```
3. The database tables will be created automatically on first run
4. Test your application - all database operations should work

### Step 5: Deploy to Vercel

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Migrate to Vercel Postgres"
   git push
   ```
2. Vercel will automatically:
   - Detect the `@vercel/postgres` package
   - Use the environment variables from your database
   - Deploy your application
3. Your database will be initialized on the first request

## 📊 Database Schema Changes

The schema has been converted from SQLite to PostgreSQL:

| SQLite | PostgreSQL |
|--------|------------|
| `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| `TEXT` | `TEXT` (same) |
| `REAL` | `REAL` (same) |
| `DATETIME` | `TIMESTAMP` |
| `SUBSTR()` | `SUBSTRING()` |

All tables remain the same:
- `activities`
- `bikes`
- `components`
- `component_usage`
- `strava_tokens`
- `component_replacements`

## 🔍 Important Notes

### Free Tier Limits

Vercel Postgres free tier includes:
- **256 MB storage**
- **60 hours of compute time per month**
- Perfect for small to medium applications

### Data Migration

If you have existing SQLite data you want to migrate:

1. Export your SQLite data to SQL:
   ```bash
   sqlite3 bike_mechanic.db .dump > dump.sql
   ```
2. Convert the SQL syntax for PostgreSQL (mainly `AUTOINCREMENT` → `SERIAL`)
3. Import into Vercel Postgres using a PostgreSQL client

**Note:** For a fresh start, the tables will be created automatically on first run - no migration needed!

### Local Development vs Production

- **Local:** Uses `.env` file for database connection
- **Production (Vercel):** Uses environment variables set in Vercel dashboard
- The `@vercel/postgres` package automatically detects and uses the correct connection

## 🐛 Troubleshooting

### "Cannot find module '@vercel/postgres'"
- Run `npm install` to ensure dependencies are installed

### "Database initialization failed"
- Check that your environment variables are set correctly
- Verify your database is created in Vercel dashboard
- Check that the connection string is valid

### "Table already exists" errors
- This is normal - tables are only created if they don't exist
- The error is handled gracefully in the code

### Local development not connecting
- Make sure `.env` file exists and has all `POSTGRES_*` variables
- Verify the connection string is correct
- Check that your local network can reach the Vercel Postgres database

## 🎉 Success!

Once deployed, your application will:
- ✅ Work on Vercel serverless functions
- ✅ Use a scalable cloud database
- ✅ Have automatic connection pooling
- ✅ Support concurrent requests
- ✅ Persist data between deployments

Your `FUNCTION_INVOCATION_FAILED` error should be resolved!
