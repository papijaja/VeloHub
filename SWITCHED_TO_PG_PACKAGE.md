# Switched to pg Package for Prisma Database

## The Problem

The `@vercel/postgres` package is designed specifically for Vercel's own Postgres databases. Since you're using a Prisma-hosted database (`db.prisma.io`), `@vercel/postgres` was rejecting the connection string even though it had `?pgbouncer=true`.

## The Solution

I've switched the database code to use the standard `pg` (node-postgres) package, which works with **any** PostgreSQL database, including Prisma-hosted databases.

## What Changed

1. **Installed `pg` package** - Standard PostgreSQL client for Node.js
2. **Updated `db/database.js`** - Now uses `pg.Pool` instead of `@vercel/postgres`
3. **Added placeholder conversion** - Converts `?` placeholders to `$1, $2, $3` format (required by pg package)

## Environment Variables

The code now uses these environment variables (in priority order):
1. `POSTGRES_PRISMA_URL` (preferred - your pooled connection)
2. `POSTGRES_URL` (fallback)
3. `DATABASE_URL` (fallback)

Your existing connection string with `?pgbouncer=true` will work perfectly!

## Next Steps

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Switch to pg package for Prisma database compatibility"
   git push
   ```

2. **Wait for Vercel to redeploy** (automatic)

3. **Test the Strava connection** - It should work now!

## Benefits

- ✅ Works with Prisma-hosted databases
- ✅ Works with any PostgreSQL database
- ✅ Proper connection pooling for serverless
- ✅ Standard, well-maintained package
- ✅ Your existing connection string works as-is

## Note

The `@vercel/postgres` package is still in your `package.json` but is no longer used. You can remove it later if you want, but it won't cause any issues if left there.
