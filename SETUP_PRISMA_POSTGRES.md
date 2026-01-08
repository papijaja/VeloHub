# Setting Up Environment Variables for Prisma Postgres (Vercel)

Since you created a **Prisma Postgres** database in Vercel, the setup is the same! The `@vercel/postgres` package works perfectly with Prisma Postgres databases.

## Step-by-Step: Get Your Connection Details

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in

2. **Open Your Project**
   - Click on your project

3. **Go to Storage Tab**
   - Click **"Storage"** in the top navigation
   - You should see your **Prisma Postgres** database listed

4. **Open Your Database**
   - Click on your Prisma Postgres database name

5. **Get Connection Details**
   - Look for **"Connection String"** or **"Environment Variables"** section
   - You'll see several connection URLs and individual values
   - **Copy all of these values:**
     - `POSTGRES_URL` - Main connection string
     - `POSTGRES_PRISMA_URL` - Prisma-specific connection (this is important!)
     - `POSTGRES_URL_NON_POOLING` - Non-pooling connection
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

   **Tip:** You might see a "Copy" button next to each value - use it!

## Add to Your .env File

Open your `.env` file and add these lines (replace with your actual values from Vercel):

```env
# Prisma Postgres Connection (from Vercel Dashboard)
POSTGRES_URL=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb
POSTGRES_PRISMA_URL=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb
POSTGRES_USER=default
POSTGRES_HOST=host.region.postgres.vercel-storage.com
POSTGRES_PASSWORD=your_password_here
POSTGRES_DATABASE=verceldb
```

**Important:** Make sure you include the `POSTGRES_PRISMA_URL` - this is the one that's optimized for Prisma/connection pooling!

## Keep Your Existing Variables

Don't delete your existing Strava variables:

```env
# Keep these existing ones
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=...
```

## Complete .env File Example

Your `.env` file should look like this:

```env
# Strava API (your existing variables)
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=your_strava_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# Prisma Postgres Connection (add these new ones)
POSTGRES_URL=postgres://default:abc123@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
POSTGRES_PRISMA_URL=postgres://default:abc123@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:abc123@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
POSTGRES_USER=default
POSTGRES_HOST=ep-xxx.us-east-1.postgres.vercel-storage.com
POSTGRES_PASSWORD=abc123
POSTGRES_DATABASE=verceldb
```

## Test It

1. Save your `.env` file
2. Run your server:
   ```bash
   npm start
   ```
3. You should see: "Database tables initialized successfully"

## Notes

- **Prisma Postgres = Vercel Postgres**: They're the same thing! The `@vercel/postgres` package works with it.
- **POSTGRES_PRISMA_URL**: This is the connection string optimized for connection pooling - perfect for serverless!
- **Automatic in Production**: Vercel automatically sets these variables in production - you only need them in `.env` for local development.

## Troubleshooting

### Can't find the connection details?
- Make sure you clicked on the database name to open its details page
- Look for tabs like "Settings", "Connection", or "Overview"
- The connection strings might be in a collapsed section - click to expand

### Still having connection issues?
- Double-check that all values were copied correctly (no extra spaces)
- Make sure `POSTGRES_PRISMA_URL` is included (it has `?pgbouncer=true` in it)
- Try the `POSTGRES_URL_NON_POOLING` if the main URL doesn't work locally
