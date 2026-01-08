# Troubleshooting Guide

## "Bad Request" Error when Connecting to Strava

If you're getting a "bad request" error when clicking "Connect to Strava", here are the most common causes:

### 1. Redirect URI Mismatch

The redirect URI in your `.env` file must **exactly match** the one configured in your Strava application settings.

**To fix:**
1. Go to https://www.strava.com/settings/api
2. Find your application
3. Check the "Authorization Callback Domain" - it should be: `localhost`
4. Check that your `.env` file has:
   ```
   STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
   ```
5. Make sure there are no trailing slashes or extra characters

### 2. Missing Environment Variables

Make sure your `.env` file exists in the root directory and contains:
```
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
```

### 3. Server Not Reading .env File

- Make sure the `.env` file is in the root directory (same level as `server.js`)
- Restart your server after modifying `.env` file
- Check the server console for any errors

### 4. Check Server Console

When you click "Connect to Strava", check your server console (terminal) for any error messages. The server will log the redirect URI being used.

### 5. Verify Strava Application Settings

In your Strava application settings (https://www.strava.com/settings/api):
- **Website**: Can be any URL (e.g., `http://localhost`)
- **Application Description**: Any description
- **Authorization Callback Domain**: Must be exactly `localhost` (no http://, no port, just `localhost`)
- **Category**: Any category

### Common Error Messages

- **"bad request"**: Usually means redirect URI mismatch
- **"access_denied"**: User denied authorization (just try again)
- **"no_code"**: No authorization code received (try connecting again)
- **"token_exchange_failed"**: Problem with client secret or token exchange

### Testing the Authorization URL

You can test if your credentials are working by checking the server console. When you click "Connect to Strava", you should see a log message showing the redirect URI being used.

If you're still having issues, check:
1. Your `.env` file format (no quotes around values)
2. That your server is running on port 3000 (or update PORT in .env)
3. That your Strava app is active and not deleted