# Deployment Guide - Shein Kurd System

This guide explains how to deploy the Shein Kurd system so others can access it online.

---

## 📋 Prerequisites

- **Git** installed (https://git-scm.com/)
- **Node.js** v18+ (https://nodejs.org/)
- A **GitHub account** (free at github.com)
- A hosting account (choose one):
  - **Vercel** (easiest, free) - https://vercel.com
  - **Netlify** (free) - https://netlify.com
  - **Firebase** (free tier available) - https://firebase.google.com

---

## 🚀 Quick Deploy (Recommended: Vercel)

### Step 1: Push to GitHub

```bash
# In your project folder:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shein-kurd.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"New Project"**
3. Connect GitHub → Select your **shein-kurd** repo
4. Click **"Import"**
5. **Build Settings** (auto-filled):
   - Framework: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click **"Deploy"**

**Done!** Your app will be live at: `https://your-project.vercel.app`

---

## 📱 Alternative: Deploy to Netlify

1. Go to https://netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub
4. Select your **shein-kurd** repository
5. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **"Deploy site"**

**Your app is now live!**

---

## 🔧 Local Testing Before Deploy

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm preview
```

---

## 🔐 Important: Environment Variables

If you have Firebase or other secrets, create a `.env.local` file:

```
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id
```

**Do NOT commit `.env.local` to GitHub!**

Add to `.gitignore`:
```
.env.local
.env*.local
```

---

## 📤 Sharing the Link

Once deployed, share the URL with your team:
- **Vercel**: `https://your-project.vercel.app`
- **Netlify**: `https://your-project.netlify.app`
- **Custom Domain**: Add your own domain in hosting dashboard

---

## 🔄 Updating the System

After making changes locally:

```bash
git add .
git commit -m "Your changes description"
git push origin main
```

**Vercel/Netlify auto-deploy** when you push to GitHub! No extra steps needed.

---

## 📊 Multi-User Access

- Users can bookmark the link
- No installation needed - just open in browser
- Works on mobile & desktop
- Each user logs in with their own credentials
- Data syncs via Firebase (if connected)

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Run `npm install` locally first |
| Pages not loading | Check that `dist/` folder exists after build |
| Firebase errors | Verify `.env` variables are set in hosting dashboard |
| Changes not showing | Hard refresh (Ctrl+Shift+R) or clear cache |

---

## 💡 Pro Tips

1. **Monitor deployments** in Vercel/Netlify dashboard
2. **Enable Preview Deployments** for pull requests
3. **Set up custom domain** through DNS settings
4. **Enable password protection** if sensitive data exists

---

## ❓ Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- GitHub Pages: https://pages.github.com
