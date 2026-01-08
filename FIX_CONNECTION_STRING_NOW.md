# Fix Database Connection String Error - Step by Step

## The Problem

The error shows that `@vercel/postgres` is using `POSTGRES_URL` (direct connection) instead of `POSTGRES_PRISMA_URL` (pooled connection). In serverless/Vercel, you **must** use the pooled connection.

## Solution: Ensure POSTGRES_PRISMA_URL is Set

### Step 1: Check Your Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Look for `POSTGRES_PRISMA_URL`
3. Check if it exists and what its value is

### Step 2A: If POSTGRES_PRISMA_URL Exists

If you see `POSTGRES_PRISMA_URL`, check that:
- The value includes `?pgbouncer=true` (or `?pgbouncer=true&connect_timeout=15`)
- It's set for all environments (Production, Preview, Development)

If it doesn't have `?pgbouncer=true`, you need to update it.

### Step 2B: If POSTGRES_PRISMA_URL Does NOT Exist

You mentioned you only see 3 variables. You need to add `POSTGRES_PRISMA_URL`.

#### Get the Connection String from Your Database:

1. Go to **Vercel Dashboard** → Your Project → **Storage**
2. Click on your **Prisma Postgres** database
3. Look for **"Environment Variables"** or **"Connection String"** section
4. Find the connection string that includes `?pgbouncer=true`
   - It might be labeled as:
     - `POSTGRES_PRISMA_URL`
     - `Prisma Connection String`
     - `Pooled Connection String`
5. **Copy this connection string** (it should look like: `postgres://...?pgbouncer=true&connect_timeout=15`)

#### Add It to Environment Variables:

1. Go back to **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Enter:
   - **Key**: `POSTGRES_PRISMA_URL` (exact spelling, all uppercase)
   - **Value**: Paste the connection string you copied (the one with `?pgbouncer=true`)
   - **Environments**: Select all (Production, Preview, Development)
4. Click **"Save"**

### Step 3: Verify the Connection String Format

Your `POSTGRES_PRISMA_URL` should look like:
```
postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
```

**Key requirements:**
- ✅ Starts with `postgres://`
- ✅ Includes `?pgbouncer=true` (this is critical!)
- ✅ May include `&connect_timeout=15`
- ✅ No extra spaces or characters

### Step 4: Redeploy

**Critical**: After adding/updating `POSTGRES_PRISMA_URL`:

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete
5. Try connecting to Strava again

## Why This Happens

The `@vercel/postgres` package automatically uses `POSTGRES_PRISMA_URL` if it's available. If it's not found, it falls back to `POSTGRES_URL`, which causes this error in serverless environments.

Priority order:
1. `POSTGRES_PRISMA_URL` ✅ (use this - pooled connection)
2. `POSTGRES_URL` ❌ (direct connection - doesn't work in serverless)
3. `DATABASE_URL` ❌ (might not be pooled)

## Quick Checklist

- [ ] `POSTGRES_PRISMA_URL` exists in Vercel environment variables
- [ ] `POSTGRES_PRISMA_URL` includes `?pgbouncer=true` in the value
- [ ] Variable name is exactly `POSTGRES_PRISMA_URL` (uppercase, no typos)
- [ ] Set for all environments (Production, Preview, Development)
- [ ] Redeployed after adding/updating the variable
- [ ] No extra spaces in the connection string

## Alternative: Check What Variables You Have

You mentioned you see:
- `Postgres_URL` (or `POSTGRES_URL`)
- `Prisa_Database_URL` (this might be `POSTGRES_PRISMA_URL` with a typo in the display?)
- `DATABASE_URL`

Can you check if `Prisa_Database_URL` is actually `POSTGRES_PRISMA_URL`? The value should have `?pgbouncer=true` in it.

If it is `POSTGRES_PRISMA_URL` but the value doesn't have `?pgbouncer=true`, you need to get the correct connection string from your database settings and update it.

## Still Not Working?

If you've added `POSTGRES_PRISMA_URL` correctly but it's still not working:

1. **Double-check the variable name**: Must be exactly `POSTGRES_PRISMA_URL` (case-sensitive)
2. **Verify the connection string**: Must include `?pgbouncer=true`
3. **Check you redeployed**: Environment variables only apply to new deployments
4. **Check function logs again**: Should show a different error if the connection string is correct
