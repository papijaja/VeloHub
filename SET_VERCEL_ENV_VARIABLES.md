# Setting Environment Variables in Vercel

## The Problem

The `.env` file only works for **local development**. On Vercel (production), environment variables must be set in the **Vercel Dashboard**. That's why you're getting the "Strava API credentials not configured" error.

## Solution: Set Environment Variables in Vercel Dashboard

### Step 1: Go to Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your project name

### Step 2: Navigate to Environment Variables

1. Click on the **"Settings"** tab (top navigation)
2. Click on **"Environment Variables"** in the left sidebar

### Step 3: Add Your Strava Credentials

You need to add these **3 environment variables**:

#### 1. STRAVA_CLIENT_ID
- **Key**: `STRAVA_CLIENT_ID`
- **Value**: Your Strava Client ID (from your `.env` file)
- **Environment**: Select all (Production, Preview, Development)

#### 2. STRAVA_CLIENT_SECRET
- **Key**: `STRAVA_CLIENT_SECRET`
- **Value**: Your Strava Client Secret (from your `.env` file)
- **Environment**: Select all (Production, Preview, Development)

#### 3. STRAVA_REDIRECT_URI
- **Key**: `STRAVA_REDIRECT_URI`
- **Value**: `https://your-vercel-url.vercel.app/api/strava/callback`
  - Replace `your-vercel-url` with your actual Vercel domain
  - You can find your Vercel URL in the project overview or deployments
- **Environment**: Select all (Production, Preview, Development)

### Step 4: Add Each Variable

For each variable:

1. Click **"Add New"** button
2. Enter the **Key** (e.g., `STRAVA_CLIENT_ID`)
3. Enter the **Value** (copy from your `.env` file)
4. Select environments: Check **Production**, **Preview**, and **Development**
5. Click **"Save"**

Repeat for all 3 variables.

### Step 5: Redeploy

After adding the variables, you need to trigger a new deployment:

1. Go to the **"Deployments"** tab
2. Click the **"..."** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. OR push a new commit to trigger automatic deployment

**Important**: Environment variables are only available to NEW deployments. Existing deployments won't have access to them until you redeploy.

## Complete List of Environment Variables Needed

Make sure you have ALL of these set in Vercel:

### Strava API (Required)
- ✅ `STRAVA_CLIENT_ID`
- ✅ `STRAVA_CLIENT_SECRET`
- ✅ `STRAVA_REDIRECT_URI` (your Vercel URL + `/api/strava/callback`)

### Postgres Database (Already Set)
These should already be set automatically when you created the Prisma Postgres database:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `DATABASE_URL`

## Finding Your Vercel URL

To find your Vercel deployment URL:

1. Go to your project in Vercel dashboard
2. Look at the **"Deployments"** tab
3. Click on any deployment
4. You'll see the URL at the top (e.g., `my-bike-mechanic.vercel.app`)
5. Or check the **"Domains"** section in Settings

Use this URL for your `STRAVA_REDIRECT_URI`.

## Example

If your Vercel URL is `my-bike-mechanic.vercel.app`, then:

```
STRAVA_REDIRECT_URI = https://my-bike-mechanic.vercel.app/api/strava/callback
```

## Update Strava App Settings

**Important**: You also need to update your Strava app settings:

1. Go to: https://www.strava.com/settings/api
2. Find your application
3. In the **"Authorization Callback Domain"** field, enter **ONLY the domain** (no `https://`, no paths, no slashes):
   - ✅ Correct: `your-vercel-url.vercel.app`
   - ❌ Wrong: `https://your-vercel-url.vercel.app` (has https://)
   - ❌ Wrong: `your-vercel-url.vercel.app/api/strava/callback` (has path)
   
   **Note**: Strava only wants the domain name. The full callback URL (`https://your-domain.vercel.app/api/strava/callback`) goes in your Vercel environment variable `STRAVA_REDIRECT_URI`.

## Verify It Works

After setting the variables and redeploying:

1. Visit your Vercel site
2. Try connecting to Strava
3. It should work now! ✅

## Quick Checklist

- [ ] Added `STRAVA_CLIENT_ID` to Vercel environment variables
- [ ] Added `STRAVA_CLIENT_SECRET` to Vercel environment variables
- [ ] Added `STRAVA_REDIRECT_URI` with your Vercel URL
- [ ] Selected all environments (Production, Preview, Development) for each variable
- [ ] Redeployed the application
- [ ] Updated Strava app settings with callback URL
- [ ] Tested the Strava connection

## Troubleshooting

### "Credentials not configured" error still appears
- Make sure you **redeployed** after adding the variables
- Check that variable names are exactly: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`
- Verify the values are correct (no extra spaces)

### "Invalid redirect_uri" error from Strava
- Make sure you added the callback URL to your Strava app settings
- The URL must match exactly: `https://your-domain.vercel.app/api/strava/callback`
- Check for typos in the URL

### Variables not showing up
- Make sure you clicked "Save" after adding each variable
- Check that you selected the correct environments
- Try redeploying again
