# Git Commit and Push Commands

Run these commands in your terminal (Git Bash, PowerShell, or Command Prompt) from your project directory:

## Step 1: Check Status

```bash
cd c:\Users\tiger\Desktop\MyBikeMechanic
git status
```

This will show you all the files that have changed.

## Step 2: Stage All Changes

```bash
git add .
```

This stages all the changed files (the `.env` file is automatically ignored because it's in `.gitignore`).

## Step 3: Commit

```bash
git commit -m "Migrate from SQLite to Vercel Postgres"
```

Or if you prefer a more detailed commit message:

```bash
git commit -m "Migrate to Vercel Postgres

- Replace SQLite with @vercel/postgres package
- Update database.js to use Vercel Postgres
- Convert SQL syntax for PostgreSQL compatibility (SUBSTR → SUBSTRING)
- Update server.js for serverless compatibility
- Add vercel.json and api/index.js for Vercel deployment
- Add migration documentation"
```

## Step 4: Push

```bash
git push
```

If this is your first push or if you need to set the remote:

```bash
git push origin main
```

(Replace `main` with `master` if that's your default branch name)

## Files That Will Be Committed

These files will be committed (safe to commit):
- ✅ `db/database.js` - Updated to use Postgres
- ✅ `server.js` - Serverless compatibility updates
- ✅ `routes/categories.js` - SQL syntax update
- ✅ `api/index.js` - New serverless function entry point
- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Added @vercel/postgres dependency
- ✅ All the `.md` documentation files

## Files That Will NOT Be Committed

These files are in `.gitignore` (safe - they won't be committed):
- ❌ `.env` - Contains sensitive passwords (correctly ignored)
- ❌ `*.db` - Database files (correctly ignored)
- ❌ `node_modules/` - Dependencies (correctly ignored)

## Quick One-Liner (All Steps)

If you want to do it all at once:

```bash
cd c:\Users\tiger\Desktop\MyBikeMechanic
git add .
git commit -m "Migrate from SQLite to Vercel Postgres"
git push
```

## If You Get Errors

### "fatal: not a git repository"
You need to initialize git first:
```bash
git init
git remote add origin <your-repo-url>
```

### "fatal: remote origin already exists"
You already have a remote set up, just use `git push`.

### "error: failed to push"
You might need to pull first:
```bash
git pull
git push
```

Or if there are conflicts, resolve them first.

## After Pushing

Once you push to git, Vercel will automatically:
1. Detect the changes
2. Start a new deployment
3. Use your Prisma Postgres database (environment variables are already set in Vercel)
4. Deploy your application

You can check the deployment status in your Vercel dashboard!
