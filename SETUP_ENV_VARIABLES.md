# Step-by-Step: Setting Up Environment Variables for Vercel Postgres

## Step 1: Get Database Connection Details from Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in if needed

2. **Navigate to Your Project**
   - Click on your project name (or create a new one if you haven't deployed yet)

3. **Go to Storage Tab**
   - In your project dashboard, click on the **"Storage"** tab (usually in the top navigation)

4. **Find Your Postgres Database**
   - If you've already created it, you'll see it listed
   - If not, click **"Create Database"** → **"Postgres"** → fill in name/region → **"Create"**
   - Click on your database name to open it

5. **Get Connection Details**
   - In the database overview, look for **"Connection String"** or **"Environment Variables"** section
   - You'll see several connection strings and values
   - **Copy these values** - you'll need:
     - `POSTGRES_URL` (usually starts with `postgres://`)
     - `POSTGRES_PRISMA_URL` (usually starts with `postgres://`)
     - `POSTGRES_URL_NON_POOLING` (usually starts with `postgres://`)
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

   **Note:** If you see a "Connection String" button, click it to reveal all the individual values.

## Step 2: Add Variables to Your .env File

1. **Open your `.env` file**
   - Navigate to: `c:\Users\tiger\Desktop\MyBikeMechanic\.env`
   - Open it in any text editor (VS Code, Notepad, etc.)

2. **Add the Postgres Variables**
   - Add these lines to your `.env` file (replace the `...` with the actual values from Vercel):

```env
# Vercel Postgres Connection (get these from Vercel Dashboard → Storage → Your Database)
POSTGRES_URL=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb
POSTGRES_PRISMA_URL=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:password@host.region.postgres.vercel-storage.com:5432/verceldb
POSTGRES_USER=default
POSTGRES_HOST=host.region.postgres.vercel-storage.com
POSTGRES_PASSWORD=your_password_here
POSTGRES_DATABASE=verceldb
```

3. **Keep Your Existing Variables**
   - Make sure to keep your existing Strava variables:
     - `STRAVA_CLIENT_ID=...`
     - `STRAVA_CLIENT_SECRET=...`
     - `STRAVA_REDIRECT_URI=...`

4. **Save the File**
   - Save your `.env` file

## Example .env File (Complete)

Your `.env` file should look something like this:

```env
# Strava API Credentials (you should already have these)
STRAVA_CLIENT_ID=12345
STRAVA_CLIENT_SECRET=your_strava_secret_here
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# Vercel Postgres Connection (add these new ones)
POSTGRES_URL=postgres://default:abc123xyz@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb
POSTGRES_PRISMA_URL=postgres://default:abc123xyz@ep-xxx-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgres://default:abc123xyz@ep-xxx-xxx.us-east-1.postgres.verceldb:5432/verceldb
POSTGRES_USER=default
POSTGRES_HOST=ep-xxx-xxx.us-east-1.postgres.vercel-storage.com
POSTGRES_PASSWORD=abc123xyz
POSTGRES_DATABASE=verceldb
```

## Step 3: Verify It Works

1. **Test the connection locally:**
   ```bash
   npm start
   ```

2. **Check the console output:**
   - You should see: "Database tables initialized successfully"
   - If you see errors, double-check that all the values are copied correctly

## Troubleshooting

### "Cannot find .env file"
- The `.env` file might not exist yet
- Create a new file named `.env` (with the dot at the beginning) in your project root
- Make sure it's in: `c:\Users\tiger\Desktop\MyBikeMechanic\.env`

### "Database initialization failed"
- Check that all Postgres variables are set
- Verify the connection strings are correct (no extra spaces, complete URLs)
- Make sure you copied the entire connection string

### "Connection refused" or "Connection timeout"
- Check that your network can reach the Vercel Postgres database
- Verify the host and credentials are correct
- Try using the `POSTGRES_URL_NON_POOLING` value if `POSTGRES_URL` doesn't work

### Can't find the values in Vercel Dashboard?
- Make sure you've created the Postgres database first
- Look for a "Settings" or "Connection" tab in the database overview
- The values might be under "Environment Variables" section

## Important Notes

- **Never commit your `.env` file to git** - it contains sensitive passwords
- The `.env` file is already in `.gitignore`, so it won't be committed
- **For production (Vercel):** These variables are automatically set when you create the database - you don't need to manually set them in Vercel's environment variables section
- **For local development:** You need to add them to your `.env` file manually
