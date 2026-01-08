# Fix: Postgres Connection String Error

## Error Message
```
VercelPostgresError - 'invalid_connection_string': This connection string is meant to be used with a direct connection. Make sure to use a pooled connection string or try `createClient()` instead.
```

## The Problem

The `@vercel/postgres` package is trying to use the direct connection string (`POSTGRES_URL`) instead of the pooled connection string (`POSTGRES_PRISMA_URL`). In serverless environments like Vercel, you **must** use the pooled connection.

## Solution: Verify POSTGRES_PRISMA_URL is Set in Vercel

The `@vercel/postgres` package automatically uses `POSTGRES_PRISMA_URL` if it's available. The error suggests it's not finding it or it's not set correctly.

### Step 1: Check Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Look for `POSTGRES_PRISMA_URL`
3. Make sure it exists and has a value that includes `?pgbouncer=true`

### Step 2: If POSTGRES_PRISMA_URL is Missing

If you don't see `POSTGRES_PRISMA_URL` in your environment variables:

1. Go to Vercel Dashboard → Your Project → Storage
2. Click on your Prisma Postgres database
3. Look for "Environment Variables" or "Connection String" section
4. Copy the value for `POSTGRES_PRISMA_URL` (it should have `?pgbouncer=true&connect_timeout=15` in it)
5. Go to Settings → Environment Variables
6. Add a new variable:
   - **Key**: `POSTGRES_PRISMA_URL`
   - **Value**: Paste the connection string (the one with `?pgbouncer=true`)
   - **Environments**: Select all (Production, Preview, Development)
7. Click "Save"

### Step 3: Verify the Connection String Format

The `POSTGRES_PRISMA_URL` should look like:
```
postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
```

**Important**: It must include `?pgbouncer=true` (this indicates it's a pooled connection).

### Step 4: Redeploy

After adding/updating `POSTGRES_PRISMA_URL`:

1. Go to Deployments tab
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete
5. Try connecting to Strava again

## Why This Happens

- `POSTGRES_URL` = Direct connection (not for serverless)
- `POSTGRES_PRISMA_URL` = Pooled connection (required for serverless/Vercel)
- `POSTGRES_URL_NON_POOLING` = Non-pooled direct connection (not for serverless)

The `@vercel/postgres` package's `sql` function automatically uses `POSTGRES_PRISMA_URL` if it's available. If it's not set, it falls back to `POSTGRES_URL`, which causes this error in serverless environments.

## Quick Checklist

- [ ] `POSTGRES_PRISMA_URL` exists in Vercel environment variables
- [ ] `POSTGRES_PRISMA_URL` includes `?pgbouncer=true` in the connection string
- [ ] Variable is set for all environments (Production, Preview, Development)
- [ ] Redeployed the application after adding/updating the variable
- [ ] Verified the connection string format is correct

## Alternative: Check What Variables You Have

You mentioned you only see 3 variables. Make sure one of them is `POSTGRES_PRISMA_URL`. The variable names should be:

- ✅ `POSTGRES_PRISMA_URL` - This is the one you need! (has `?pgbouncer=true`)
- `POSTGRES_URL` - Direct connection (don't use this in serverless)
- `DATABASE_URL` - Sometimes an alias (might not be pooled)

If you only have `POSTGRES_URL` and not `POSTGRES_PRISMA_URL`, you need to get it from your database settings and add it to environment variables.
