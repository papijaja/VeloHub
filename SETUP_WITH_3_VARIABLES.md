# Setting Up with Your 3 Environment Variables

Perfect! You only need the 3 variables you found. The `@vercel/postgres` package will work with these.

## Your Variables

From Vercel, you should have:
- `POSTGRES_URL` (or `Postgres_URL`)
- `POSTGRES_PRISMA_URL` (or `Prisa_Database_URL` - this is the Prisma connection)
- `DATABASE_URL` (sometimes used as an alias)

## Add to Your .env File

Open your `.env` file and add these 3 lines. Use the exact variable names you see in Vercel (they might be slightly different - use what you see):

```env
# Prisma Postgres Connection (copy the exact values from Vercel)
POSTGRES_URL=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb
POSTGRES_PRISMA_URL=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
DATABASE_URL=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb
```

**Important:** 
- Copy the **exact values** from Vercel (click the copy button or reveal and copy)
- Use the **exact variable names** you see in Vercel (might be `Postgres_URL` vs `POSTGRES_URL` - use what Vercel shows)
- The `POSTGRES_PRISMA_URL` is the one with `?pgbouncer=true` in it - this is important for serverless!

## Complete .env File Example

Your `.env` file should look like this (keep your existing Strava variables):

```env
# Strava API (your existing variables - keep these!)
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# Prisma Postgres Connection (add these 3 new ones)
POSTGRES_URL=postgres://default:abc123@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
POSTGRES_PRISMA_URL=postgres://default:abc123@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
DATABASE_URL=postgres://default:abc123@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
```

## Note About Variable Names

If Vercel shows them with different capitalization (like `Postgres_URL` instead of `POSTGRES_URL`), **use the exact names you see in Vercel**. However, the `@vercel/postgres` package typically looks for:
- `POSTGRES_URL` (uppercase)
- `POSTGRES_PRISMA_URL` (uppercase)

So if Vercel shows `Postgres_URL`, you can either:
1. Use `POSTGRES_URL` in your .env (uppercase) - the package will find it
2. Or use the exact name Vercel shows

To be safe, use uppercase `POSTGRES_URL` and `POSTGRES_PRISMA_URL` in your .env file.

## Test It

1. Save your `.env` file
2. Run your server:
   ```bash
   npm start
   ```
3. You should see: "Database tables initialized successfully"

## If It Doesn't Work

If you get connection errors, try:

1. **Check variable names**: Make sure they're uppercase `POSTGRES_URL` (not `Postgres_URL`)
2. **Check the values**: Make sure you copied the entire connection string (they're long!)
3. **Use POSTGRES_PRISMA_URL**: The one with `?pgbouncer=true` is usually the best for local dev
4. **No extra spaces**: Make sure there are no spaces around the `=` sign

## Why Only 3 Variables?

The `@vercel/postgres` package primarily needs `POSTGRES_URL` to work. The other variables (`POSTGRES_USER`, `POSTGRES_HOST`, etc.) can be derived from the connection string if needed, but they're not required. Your 3 variables are sufficient!
