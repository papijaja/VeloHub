# How to Check Sync Activities Error

## Step 1: Check Browser Console (Quick Check)

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Click "Sync Activities" button
4. Look for any error messages in the console
5. The improved error handling should now show more details

## Step 2: Check Vercel Function Logs (Most Important!)

The function logs will show the **exact error**:

1. Go to **Vercel Dashboard** → Your Project
2. Go to **"Deployments"** tab
3. Click on the **latest deployment**
4. Look for function logs (or click on the function that handles `/api/strava/sync`)
5. Check the logs for errors
6. Look for:
   - Database errors
   - Strava API errors (401, 403, rate limits)
   - Network errors
   - Any other error messages

## Common Errors and Solutions

### Database Errors
- **SQL syntax errors**: Might be related to the pg package conversion
- **Connection errors**: Database connection issues
- **Table doesn't exist**: Tables might not be initialized

### Strava API Errors
- **401 Unauthorized**: Token expired or invalid
- **403 Forbidden**: Rate limit or permissions
- **429 Too Many Requests**: Rate limit exceeded

### Network Errors
- **Timeout**: Request took too long
- **Connection refused**: Network issues

## What Error Do You See?

Please check:
1. **Browser console** (F12 → Console) - should show more details now
2. **Vercel function logs** - will show the exact error

Share what you see and we can fix it!
