# Debugging Strava Authentication Error

You're getting "Failed to exchange authorization code" - let's debug this step by step.

## Step 1: Check Vercel Function Logs (Most Important!)

The function logs will show the **actual error from Strava**. This is the key to solving the problem.

1. Go to **Vercel Dashboard** → Your Project
2. Go to **"Deployments"** tab
3. Click on the **latest deployment**
4. Look for the function that handles `/api/strava/callback`
5. Click on it to see the logs
6. Look for errors - they'll show what Strava actually returned

**What to look for:**
- `invalid_client` = Client ID or Secret is wrong
- `invalid_grant` = Authorization code problem
- `redirect_uri_mismatch` = Redirect URI doesn't match
- Database errors = Connection issue (like the POSTGRES_PRISMA_URL error we saw earlier)

**Please check the logs and tell me what error you see!**

## Step 2: Verify Environment Variables are Set

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Verify these 3 variables exist:
   - `STRAVA_CLIENT_ID` - Should match your Strava app Client ID exactly
   - `STRAVA_CLIENT_SECRET` - Should match your Strava app Client Secret exactly
   - `STRAVA_REDIRECT_URI` - Should be: `https://your-domain.vercel.app/api/strava/callback`

3. For each variable, check:
   - ✅ Variable name is correct (exact spelling, case-sensitive)
   - ✅ Value is correct (no extra spaces)
   - ✅ Selected for all environments (Production, Preview, Development)

## Step 3: Verify Strava App Settings

1. Go to https://www.strava.com/settings/api
2. Find your app
3. Verify:
   - **Client ID** matches `STRAVA_CLIENT_ID` in Vercel
   - **Client Secret** matches `STRAVA_CLIENT_SECRET` in Vercel (click "Show" to see it)
   - **Authorization Callback Domain** = Just your domain (e.g., `my-app.vercel.app`) - NO `https://`, NO paths

## Step 4: Verify You Redeployed

**Critical**: Environment variables only apply to NEW deployments!

1. Did you **redeploy** after adding/updating the environment variables?
2. If not:
   - Go to **Deployments** tab
   - Click "..." on latest deployment
   - Click **"Redeploy"**
   - Wait for it to finish
   - Try connecting to Strava again

## Step 5: Check for Database Connection Issues

If you're still getting the POSTGRES_PRISMA_URL error, that could prevent the token from being stored, which might cause this error.

Check the function logs for:
- `VercelPostgresError`
- `invalid_connection_string`
- Database connection errors

If you see these, the `POSTGRES_PRISMA_URL` environment variable might not be set correctly. See `FIX_POSTGRES_CONNECTION.md` for details.

## Step 6: Test the Configuration

### Test 1: Verify Redirect URI

1. Your `STRAVA_REDIRECT_URI` in Vercel should be: `https://your-domain.vercel.app/api/strava/callback`
2. Your Strava "Authorization Callback Domain" should be: `your-domain.vercel.app`
3. The domain parts must match exactly (case-insensitive)

### Test 2: Verify Credentials

1. Copy your Client ID from Strava
2. Compare it character-by-character with `STRAVA_CLIENT_ID` in Vercel
3. Do the same for Client Secret (be careful - no extra spaces!)

### Test 3: Check the Actual Error

The function logs will show something like:
```
Error exchanging code for token: { error: 'invalid_client', error_description: '...' }
```

This tells us exactly what's wrong!

## Common Error Messages and Fixes

### "invalid_client"
- Client ID or Secret is wrong
- Solution: Double-check both values match exactly in Strava and Vercel

### "redirect_uri_mismatch"
- Redirect URI doesn't match
- Solution: Make sure domain in Strava matches domain in `STRAVA_REDIRECT_URI`

### "invalid_grant"
- Authorization code expired or invalid
- Solution: Try connecting again (codes expire quickly)

### Database errors
- Can't store the token
- Solution: Fix `POSTGRES_PRISMA_URL` connection (see `FIX_POSTGRES_CONNECTION.md`)

## Quick Checklist

- [ ] Checked Vercel function logs for the actual error
- [ ] Verified `STRAVA_CLIENT_ID` matches Strava app
- [ ] Verified `STRAVA_CLIENT_SECRET` matches Strava app (no extra spaces!)
- [ ] Verified `STRAVA_REDIRECT_URI` is full URL: `https://domain.vercel.app/api/strava/callback`
- [ ] Verified Strava "Authorization Callback Domain" is just domain: `domain.vercel.app`
- [ ] Verified domains match (case-insensitive)
- [ ] Redeployed after setting/updating environment variables
- [ ] Checked for database connection errors in logs

## What Information Do I Need?

To help you further, please provide:

1. **The actual error from Vercel function logs** (this is the most important!)
2. Confirmation that you redeployed after setting environment variables
3. Whether you see any database errors in the logs
4. Your Vercel domain (so we can verify the redirect URI format)

The function logs will tell us exactly what's wrong!
