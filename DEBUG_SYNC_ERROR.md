# Debugging Sync Activities Error

You're getting "Failed to sync activities" - let's debug this step by step.

## Step 1: Check Vercel Function Logs (Most Important!)

The function logs will show the **actual error** from the sync operation.

1. Go to **Vercel Dashboard** → Your Project
2. Go to **"Deployments"** tab
3. Click on the **latest deployment**
4. Find the function that handles `/api/strava/sync` (or the sync endpoint)
5. Click on it to see the logs
6. Look for errors - they'll show what actually failed

**What to look for:**
- Database errors (connection issues, SQL errors)
- Strava API errors (401 unauthorized, rate limits, etc.)
- Network errors
- Any other error messages

**Please check the logs and tell me what error you see!**

## Step 2: Common Causes

### Database Errors
- Connection issues
- SQL syntax errors
- Table doesn't exist
- Permission errors

### Strava API Errors
- Token expired (need to refresh)
- Rate limit exceeded
- Invalid token
- API endpoint changed

### Network Errors
- Timeout
- Connection refused
- DNS issues

## Step 3: Verify Token is Valid

The sync endpoint needs a valid Strava access token. Check:

1. You successfully authenticated (you said this works now!)
2. The token was stored in the database
3. The token hasn't expired

## Step 4: Check Database Tables

Make sure all tables exist:
- `strava_tokens` - stores the token
- `activities` - stores synced activities

The `init()` function should have created these, but verify they exist.

## What Information Do I Need?

To help you further, please provide:

1. **The actual error from Vercel function logs** (this is the most important!)
2. When does the error occur? (immediately, after some activities sync, etc.)
3. Any patterns? (always fails, sometimes works, etc.)

The function logs will tell us exactly what's wrong!
