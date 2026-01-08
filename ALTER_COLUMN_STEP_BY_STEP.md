# Step-by-Step: Alter Column Type in Vercel Database

## Method 1: Using Vercel Dashboard (If Available)

Some Vercel databases have a SQL editor. Here's how to access it:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Log in

2. **Navigate to Your Database**
   - Click on your project
   - Click on the **"Storage"** tab
   - Click on your **Prisma Postgres** database

3. **Look for SQL Editor/Query Interface**
   - Look for tabs/sections like:
     - **"Query"** or **"SQL Query"**
     - **"SQL Editor"**
     - **"Data"** tab → might have a query interface
     - **"Tables"** → might have options to edit
   - Some databases have a text box where you can enter SQL

4. **Run the SQL Command**
   - If you find a SQL editor/query interface, paste this command:
     ```sql
     ALTER TABLE activities ALTER COLUMN strava_id TYPE BIGINT;
     ```
   - Click "Run" or "Execute"

## Method 2: Using Vercel CLI (Alternative)

If there's no SQL editor in the dashboard, you can use the Vercel CLI:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Connect to your database**:
   - The Vercel CLI doesn't directly support SQL queries
   - You'll need to use a different method (see Method 3)

## Method 3: Using a Database Client (Recommended if Dashboard Doesn't Work)

If Vercel doesn't provide a SQL editor, use a database client:

### Option A: Using psql (Command Line)

1. **Get your connection string** from Vercel:
   - Go to your database in Vercel
   - Copy the connection string (the one you used in environment variables)

2. **Connect using psql**:
   ```bash
   psql "your-connection-string-here"
   ```

3. **Run the SQL command**:
   ```sql
   ALTER TABLE activities ALTER COLUMN strava_id TYPE BIGINT;
   ```

4. **Exit**:
   ```bash
   \q
   ```

### Option B: Using a GUI Database Client

1. **Download a database client**:
   - **pgAdmin** (free, popular for PostgreSQL): https://www.pgadmin.org/
   - **DBeaver** (free, works with many databases): https://dbeaver.io/
   - **TablePlus** (paid, but has free trial): https://tableplus.com/

2. **Connect to your database**:
   - Get your connection string from Vercel
   - Use it to connect in the database client
   - Format: `postgres://user:password@host:port/database`

3. **Run the SQL command**:
   - Open a SQL query window
   - Paste: `ALTER TABLE activities ALTER COLUMN strava_id TYPE BIGINT;`
   - Execute/Run the query

### Option C: Using Online SQL Editors

1. **Use a web-based PostgreSQL client**:
   - Some online tools can connect to PostgreSQL databases
   - **Note**: Be careful with online tools - only use trusted ones and be cautious with credentials

## Method 4: Create a Migration Script (Temporary Solution)

If you can't access a SQL interface easily, we can create a temporary migration script:

1. I can create a migration script file
2. You can run it locally or we can add it as a route temporarily
3. This would execute the ALTER TABLE command

## Quick Check: Does Vercel Have a SQL Editor?

To check if your Vercel database has a SQL editor:

1. Go to your database in Vercel Dashboard
2. Look for:
   - A "Query" button/tab
   - A "SQL" button/tab
   - A text area or code editor
   - An "Execute" or "Run" button

If you see any of these, you can use Method 1!

## What to Look For in Vercel Dashboard

When you're in your database page, check:
- **Top navigation tabs**: Look for "Query", "SQL", "Data", "Tables"
- **Left sidebar**: Look for "Query Editor", "SQL Editor", "Run Query"
- **Main content area**: Look for a code/text editor or query interface

## Which Method Should You Use?

1. **Try Method 1 first** - Check if Vercel has a SQL editor
2. **If not available, use Method 3 (Database Client)** - Most reliable
3. **If you need help, I can create a migration script** - We can do Method 4

Let me know what you see in your Vercel database dashboard, and I can guide you more specifically!
