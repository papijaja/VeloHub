# How to Push to GitHub

## Option 1: If You Already Have a GitHub Repository

If you already have a GitHub repository set up, just run:

```bash
cd c:\Users\tiger\Desktop\MyBikeMechanic
git add .
git commit -m "Migrate from SQLite to Vercel Postgres"
git push origin main
```

(Replace `main` with `master` if that's your branch name)

## Option 2: Create a New GitHub Repository (First Time)

### Step 1: Create Repository on GitHub

1. Go to https://github.com
2. Log in to your account
3. Click the **"+"** icon in the top right → **"New repository"**
4. Fill in:
   - **Repository name**: `MyBikeMechanic` (or any name you want)
   - **Description**: (optional) "Track bicycle component usage using Strava activities"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (you already have files)
5. Click **"Create repository"**

### Step 2: Get Your Repository URL

After creating, GitHub will show you a page with commands. You'll see a URL like:
- `https://github.com/yourusername/MyBikeMechanic.git`
- OR `git@github.com:yourusername/MyBikeMechanic.git`

Copy this URL - you'll need it in the next step.

### Step 3: Initialize Git and Push (If Not Already Initialized)

Open your terminal in the project directory and run:

```bash
cd c:\Users\tiger\Desktop\MyBikeMechanic

# Check if git is already initialized
git status
```

**If you get "not a git repository" error**, run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Make your first commit
git commit -m "Initial commit: Migrate to Vercel Postgres"

# Add the GitHub remote (replace URL with your actual repository URL)
git remote add origin https://github.com/yourusername/MyBikeMechanic.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**If git is already initialized**, just run:

```bash
# Add all files
git add .

# Commit changes
git commit -m "Migrate from SQLite to Vercel Postgres"

# Add remote (if not already added)
git remote add origin https://github.com/yourusername/MyBikeMechanic.git

# Push to GitHub
git push -u origin main
```

## Option 3: Using GitHub Desktop (GUI Method)

If you prefer a graphical interface:

1. **Download GitHub Desktop** (if you don't have it):
   - https://desktop.github.com

2. **Open GitHub Desktop**

3. **Add Your Repository**:
   - File → Add Local Repository
   - Browse to: `c:\Users\tiger\Desktop\MyBikeMechanic`
   - Click "Add repository"

4. **Create Repository on GitHub** (if needed):
   - Repository → Publish repository
   - Or Repository → Create GitHub repository

5. **Commit and Push**:
   - You'll see all changed files listed
   - Write commit message: "Migrate from SQLite to Vercel Postgres"
   - Click "Commit to main"
   - Click "Push origin" button

## Important: What Gets Pushed

✅ **Safe to Push:**
- All code files
- Configuration files (package.json, vercel.json, etc.)
- Documentation (.md files)

❌ **NOT Pushed** (Protected by .gitignore):
- `.env` file (contains passwords - stays local)
- Database files (*.db, *.sqlite)
- `node_modules/` folder

## After Pushing to GitHub

Once your code is on GitHub:

1. **Vercel Auto-Deploy** (if connected):
   - If your Vercel project is connected to GitHub, it will automatically deploy
   - Check your Vercel dashboard for deployment status

2. **Manual Vercel Deploy**:
   - If not connected, you can deploy from Vercel dashboard
   - Go to your project → Deployments → Deploy

3. **Verify Deployment**:
   - Your app should be live on your Vercel URL
   - Check that database connections work

## Troubleshooting

### "fatal: remote origin already exists"
You already have a remote. Check what it is:
```bash
git remote -v
```
If it's correct, just use:
```bash
git push origin main
```

### "error: failed to push some refs"
You might need to pull first:
```bash
git pull origin main --rebase
git push origin main
```

### "Authentication failed"
You need to authenticate with GitHub. Options:
1. **Use GitHub CLI**: `gh auth login`
2. **Use Personal Access Token**: Create one at https://github.com/settings/tokens
3. **Use GitHub Desktop** (easier for authentication)

### "branch 'main' does not exist"
Create it first:
```bash
git checkout -b main
git push -u origin main
```

## Quick Reference

**First time setup:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/repo-name.git
git branch -M main
git push -u origin main
```

**Subsequent pushes:**
```bash
git add .
git commit -m "Your commit message"
git push
```
