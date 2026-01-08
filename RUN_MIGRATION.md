# How to Run the Migration Script

This script will change the `strava_id` column from INTEGER to BIGINT to fix the "out of range" error.

## Step 1: Make Sure You Have Environment Variables Set

The script needs your database connection string. Make sure your `.env` file has one of these:

```env
POSTGRES_PRISMA_URL=postgres://...
# OR
POSTGRES_URL=postgres://...
# OR
DATABASE_URL=postgres://...
```

Use the same connection string you're using for your app (the one with `?pgbouncer=true`).

## Step 2: Run the Migration Script

Open your terminal and run:

```bash
cd c:\Users\tiger\Desktop\MyBikeMechanic
node migrate-strava-id-to-bigint.js
```

## Step 3: Check the Output

You should see:
- ✅ "Migration successful! strava_id column is now BIGINT."
- Or: "Column is already BIGINT. No migration needed!" (if already fixed)

If you see an error, the script will tell you what went wrong.

## Step 4: Test Syncing Activities

After the migration succeeds:
1. Go to your app
2. Click "Sync Activities"
3. It should work now! ✅

## Troubleshooting

### "No database connection string found"
- Make sure your `.env` file has `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, or `DATABASE_URL`
- Use the connection string from Vercel (the one with `?pgbouncer=true`)

### "Activities table does not exist yet"
- This is fine! The table will be created with the correct type on first use
- No migration needed

### "Column is already BIGINT"
- The migration already ran successfully
- You're all set!

### Connection errors
- Check that your connection string is correct
- Make sure you can reach the database from your network
- The connection string should include `?pgbouncer=true&sslmode=require`

## After Migration

Once the migration is successful:
1. You can delete the `migrate-strava-id-to-bigint.js` file if you want (it's safe to keep it too)
2. Try syncing activities again
3. It should work! 🎉
