# Fix: Strava ID Out of Range Error

## The Problem

Strava activity IDs are very large numbers (like `16974906955`) that exceed PostgreSQL's INTEGER type limit (max: 2,147,483,647). We need to use BIGINT instead.

## The Fix

I've updated the database schema to use `BIGINT` for `strava_id` instead of `INTEGER`. 

## What You Need to Do

Since the table already exists, you have two options:

### Option 1: Drop and Recreate the Table (If No Important Data)

If you don't have any important data in the `activities` table yet:

1. The schema update will handle new tables automatically
2. For existing tables, you can drop and recreate:
   - Connect to your database
   - Run: `DROP TABLE IF EXISTS activities CASCADE;`
   - The table will be recreated with the correct type on next sync

### Option 2: Alter the Existing Column (If You Have Data)

If you have data you want to keep:

1. Connect to your database
2. Run this SQL:
   ```sql
   ALTER TABLE activities ALTER COLUMN strava_id TYPE BIGINT;
   ```

## Automatic Fix (Recommended)

The easiest way is to let the code handle it. However, since `CREATE TABLE IF NOT EXISTS` won't modify existing tables, you'll need to either:

1. **Drop the table manually** (if no important data)
2. **Alter the column type** (if you have data)

## After Fixing

Once the column type is fixed:

1. Commit and push the code changes
2. Either drop/recreate or alter the column type
3. Try syncing activities again - it should work!

## SQL to Fix Existing Table

Run this in your database (via Vercel database dashboard or connection):

```sql
ALTER TABLE activities ALTER COLUMN strava_id TYPE BIGINT;
```

This will change the column type from INTEGER to BIGINT, allowing it to store large Strava IDs.
