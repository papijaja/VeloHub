# Strava Authorization Callback Domain - Correct Setup

## Important Distinction

There are **two different things** that need to match, but they have different formats:

1. **Strava App Settings** → "Authorization Callback Domain" = Just the domain (no `https://`, no paths)
2. **Vercel Environment Variable** → `STRAVA_REDIRECT_URI` = Full callback URL (with `https://` and path)

## Correct Setup

### In Strava App Settings (https://www.strava.com/settings/api)

**"Authorization Callback Domain"** field should contain:
```
your-vercel-url.vercel.app
```

**DO NOT include:**
- ❌ `https://` (Strava will reject it)
- ❌ `/api/strava/callback` path (Strava only wants the domain)
- ❌ Trailing slashes

**Examples:**
- ✅ `my-bike-mechanic.vercel.app`
- ✅ `my-app-abc123.vercel.app`
- ❌ `https://my-app.vercel.app` (has https://)
- ❌ `my-app.vercel.app/api/strava/callback` (has path)
- ❌ `https://my-app.vercel.app/api/strava/callback` (has both)

### In Vercel Environment Variables

**`STRAVA_REDIRECT_URI`** should contain the **full callback URL**:
```
https://your-vercel-url.vercel.app/api/strava/callback
```

**This should include:**
- ✅ `https://` protocol
- ✅ Full domain name
- ✅ `/api/strava/callback` path

**Example:**
```
STRAVA_REDIRECT_URI=https://my-bike-mechanic.vercel.app/api/strava/callback
```

## How to Find Your Vercel Domain

1. Go to Vercel Dashboard → Your Project
2. Look at the top - you'll see your deployment URL
3. Or go to Settings → Domains
4. Copy the domain (e.g., `my-app.vercel.app`)

## Step-by-Step Setup

### Step 1: Get Your Vercel Domain

From Vercel dashboard, note your domain (e.g., `my-bike-mechanic.vercel.app`)

### Step 2: Set Up Strava

1. Go to https://www.strava.com/settings/api
2. Find your app (or create one)
3. In "Authorization Callback Domain", enter:
   ```
   my-bike-mechanic.vercel.app
   ```
   (Just the domain, nothing else!)
4. Save

### Step 3: Set Up Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update `STRAVA_REDIRECT_URI`:
   - **Key**: `STRAVA_REDIRECT_URI`
   - **Value**: `https://my-bike-mechanic.vercel.app/api/strava/callback`
   - **Environments**: All (Production, Preview, Development)
3. Save

### Step 4: Verify They Match

- **Strava domain**: `my-bike-mechanic.vercel.app`
- **Vercel URL domain**: `my-bike-mechanic.vercel.app` (from `https://my-bike-mechanic.vercel.app/api/strava/callback`)

These domains must match exactly (case-insensitive).

## Why This Works

- Strava checks that the callback URL's domain matches the "Authorization Callback Domain"
- Your app uses the full callback URL (`STRAVA_REDIRECT_URI`) to tell Strava where to redirect
- Strava only stores the domain part in its settings (for security/validation)
- The path (`/api/strava/callback`) is handled by your application code

## Common Mistakes

1. ❌ Putting `https://` in Strava's "Authorization Callback Domain" field
2. ❌ Putting the full callback URL in Strava's field
3. ❌ Using different domains in Strava vs Vercel
4. ❌ Using `http://` instead of `https://` in `STRAVA_REDIRECT_URI`

## Quick Checklist

- [ ] Strava "Authorization Callback Domain" = Just domain (e.g., `my-app.vercel.app`)
- [ ] Vercel `STRAVA_REDIRECT_URI` = Full URL (e.g., `https://my-app.vercel.app/api/strava/callback`)
- [ ] Domains match exactly (case-insensitive)
- [ ] Redeployed after setting environment variables
- [ ] Tested the connection
