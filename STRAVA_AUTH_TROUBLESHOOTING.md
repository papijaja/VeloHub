# Troubleshooting Strava Authentication Error

## Error: "Failed to exchange authorization code"

This error means the OAuth callback is working, but the token exchange is failing. Here are the most common causes:

## Common Issues & Solutions

### 1. Redirect URI Mismatch (Most Common)

**Problem**: The redirect URI in your Vercel environment variables doesn't match what's configured in Strava.

**Solution**:
1. Check your Vercel environment variable `STRAVA_REDIRECT_URI` (should be full URL: `https://your-domain.vercel.app/api/strava/callback`)
2. Go to https://www.strava.com/settings/api
3. Find your app
4. In "Authorization Callback Domain", enter **ONLY the domain** (no `https://`, no paths):
   - ✅ Correct: `your-vercel-url.vercel.app`
   - ❌ Wrong: `https://your-vercel-url.vercel.app`
   - ❌ Wrong: `your-vercel-url.vercel.app/api/strava/callback`

**Important**: 
- Strava's "Authorization Callback Domain" field = Just the domain (e.g., `my-app.vercel.app`)
- Your `STRAVA_REDIRECT_URI` in Vercel = Full callback URL (e.g., `https://my-app.vercel.app/api/strava/callback`)
- The domain in Strava must match the domain in your `STRAVA_REDIRECT_URI`

### 2. Incorrect Client Secret

**Problem**: The `STRAVA_CLIENT_SECRET` in Vercel doesn't match your Strava app.

**Solution**:
1. Go to https://www.strava.com/settings/api
2. Find your app
3. Copy the **Client Secret** (click "Show" if hidden)
4. Go to Vercel Dashboard → Settings → Environment Variables
5. Update `STRAVA_CLIENT_SECRET` with the exact value
6. **Redeploy** after updating

**Note**: Make sure there are no extra spaces or characters when copying.

### 3. Client ID Mismatch

**Problem**: The `STRAVA_CLIENT_ID` doesn't match.

**Solution**:
1. Verify your Client ID in Strava settings
2. Check that it matches exactly in Vercel environment variables
3. Redeploy after updating

### 4. Environment Variables Not Applied

**Problem**: You added the variables but didn't redeploy, or the deployment is using cached/old variables.

**Solution**:
1. Go to Vercel Dashboard → Deployments
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete
5. Try again

### 5. Check Vercel Function Logs

**To see the actual error**:

1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab (or go to a deployment)
3. Click on the function that failed
4. Check the "Logs" section
5. Look for the actual error message from Strava API

This will show you the specific error from Strava (e.g., "invalid_client", "invalid_grant", etc.)

## Step-by-Step Verification

### Step 1: Verify Strava App Settings

1. Go to https://www.strava.com/settings/api
2. Note your:
   - **Client ID**
   - **Client Secret** (click "Show")
   - **Authorization Callback Domain** (should include your Vercel domain)

### Step 2: Verify Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these 3 variables exist:
   - `STRAVA_CLIENT_ID` - Should match your Strava Client ID exactly
   - `STRAVA_CLIENT_SECRET` - Should match your Strava Client Secret exactly
   - `STRAVA_REDIRECT_URI` - Should be: `https://your-domain.vercel.app/api/strava/callback`

### Step 3: Verify Redirect URI Match

The redirect URI must match EXACTLY in both places:

**In Vercel Environment Variable:**
```
STRAVA_REDIRECT_URI = https://my-app.vercel.app/api/strava/callback
```

**In Strava App Settings:**
- Authorization Callback Domain should include: `my-app.vercel.app`
- OR the full URL: `https://my-app.vercel.app/api/strava/callback`

### Step 4: Get Your Exact Vercel URL

To find your exact Vercel URL:

1. Go to Vercel Dashboard → Your Project
2. Look at the top - you'll see your deployment URL
3. Or go to Settings → Domains to see all domains
4. Use the exact URL (usually ends in `.vercel.app`)

### Step 5: Redeploy

After making any changes:

1. Go to Deployments
2. Click "..." → "Redeploy"
3. Wait for deployment to finish
4. Try connecting to Strava again

## Common Strava API Errors

If you check the Vercel function logs, you might see:

- **"invalid_client"**: Client ID or Secret is wrong
- **"invalid_grant"**: Authorization code is invalid or expired
- **"redirect_uri_mismatch"**: Redirect URI doesn't match Strava settings
- **"invalid_code"**: The code has expired (try again)

## Quick Checklist

- [ ] Client ID matches exactly in Vercel and Strava
- [ ] Client Secret matches exactly in Vercel and Strava (no extra spaces)
- [ ] Redirect URI matches exactly in Vercel and Strava
- [ ] Redirect URI uses `https://` (not `http://`)
- [ ] Redirect URI includes `/api/strava/callback`
- [ ] No trailing slashes in URLs
- [ ] Redeployed after adding/updating environment variables
- [ ] Checked Vercel function logs for specific error

## Still Not Working?

1. **Check Vercel Function Logs** - This will show the actual error from Strava
2. **Try creating a new Strava app** - Sometimes starting fresh helps
3. **Double-check all URLs** - Copy/paste to avoid typos
4. **Test locally first** - Make sure it works with your `.env` file locally

## Testing Locally

To verify your credentials are correct:

1. Make sure your `.env` file has the correct values
2. Run: `npm start`
3. Try connecting to Strava locally at `http://localhost:3000`
4. If it works locally but not on Vercel, it's an environment variable configuration issue
