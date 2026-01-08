# How to Find Connection Details in Vercel Dashboard

## Method 1: From the Storage/Database Page (Most Common)

1. **Login to Vercel**
   - Go to: https://vercel.com/dashboard
   - Sign in with your account

2. **Select Your Project**
   - Click on your project name in the dashboard
   - (If you haven't created a project yet, you can still access the database)

3. **Go to Storage Tab**
   - At the top of your project page, you'll see tabs like: Overview, Deployments, Settings, **Storage**, etc.
   - Click on **"Storage"**

4. **Open Your Prisma Postgres Database**
   - You should see your database listed (it might be named something like "Prisma Postgres" or whatever you named it)
   - **Click on the database name/row** to open it

5. **Find Connection Details**
   Once you're in the database details page, look for one of these sections:
   
   **Option A: "Connection String" Section**
   - You might see a section labeled "Connection String" or "Connection Info"
   - There might be a dropdown or tabs showing different connection strings
   - Look for these tabs/options:
     - **Environment Variables** (this is what you want!)
     - Connection String
     - Prisma Connection String
   
   **Option B: "Environment Variables" Tab**
   - Click on the **"Environment Variables"** tab or section
   - You'll see a list of variables like:
     ```
     POSTGRES_URL = postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb
     POSTGRES_PRISMA_URL = postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true
     POSTGRES_URL_NON_POOLING = postgres://...
     POSTGRES_USER = default
     POSTGRES_HOST = xxx.postgres.vercel-storage.com
     POSTGRES_PASSWORD = xxx
     POSTGRES_DATABASE = verceldb
     ```
   - Each row might have a **"Copy"** button or an eye icon to reveal the value
   - Click the copy button or click to reveal and copy each value

   **Option C: "Settings" Tab**
   - Some databases have a "Settings" tab
   - Click "Settings" and look for "Connection" or "Connection String"

## Method 2: From Project Settings (Alternative)

If you can't find it in Storage:

1. **Go to Project Settings**
   - Click on your project
   - Click on **"Settings"** tab (top navigation)
   - Click on **"Environment Variables"** in the left sidebar

2. **Look for Postgres Variables**
   - Scroll through the list
   - Look for variables starting with `POSTGRES_`
   - These should already be set if you created the database
   - You can click on each one to see/copy the value

## Method 3: Using Vercel CLI (If Dashboard Doesn't Show Them)

If you have Vercel CLI installed:

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link your project (if not already linked)
cd c:\Users\tiger\Desktop\MyBikeMechanic
vercel link

# List environment variables
vercel env ls
```

This will show all environment variables including the Postgres ones.

## What the Connection Details Look Like

When you find them, they'll look something like this:

```
POSTGRES_URL=postgres://default:AbCdEf123456@ep-abc-123.us-east-1.postgres.vercel-storage.com:5432/verceldb

POSTGRES_PRISMA_URL=postgres://default:AbCdEf123456@ep-abc-123.us-east-1.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15

POSTGRES_URL_NON_POOLING=postgres://default:AbCdEf123456@ep-abc-123.us-east-1.postgres.vercel-storage.com:5432/verceldb

POSTGRES_USER=default
POSTGRES_HOST=ep-abc-123.us-east-1.postgres.vercel-storage.com
POSTGRES_PASSWORD=AbCdEf123456
POSTGRES_DATABASE=verceldb
```

## Quick Checklist

- [ ] Logged into Vercel Dashboard
- [ ] Selected your project
- [ ] Clicked "Storage" tab
- [ ] Clicked on your Prisma Postgres database
- [ ] Found "Environment Variables" section
- [ ] Copied all 7 variables (POSTGRES_URL, POSTGRES_PRISMA_URL, etc.)
- [ ] Added them to your .env file

## Still Can't Find Them?

Try these troubleshooting steps:

1. **Check if database is fully created**
   - Make sure the database creation completed (no errors)
   - Wait a few minutes if you just created it

2. **Try refreshing the page**
   - Sometimes the UI needs a refresh to show all options

3. **Check different tabs**
   - Look in: Overview, Settings, Connection, Environment Variables, Info

4. **Look for a "Copy" or "Reveal" button**
   - Some values are hidden by default
   - Click the eye icon or "Reveal" to see passwords

5. **Check your Vercel account plan**
   - Make sure you have access to the Storage feature
   - Free tier should work fine

## Alternative: Get Values from Vercel CLI

If the dashboard isn't showing them clearly, use the CLI:

```bash
# In your project directory
vercel env pull .env.local
```

This will download all environment variables to a `.env.local` file. Then you can copy the Postgres ones to your `.env` file.

## Need More Help?

If you're still stuck, let me know:
1. What you see when you click on your database
2. What tabs/sections are visible
3. Any error messages

I can help you navigate from there!
