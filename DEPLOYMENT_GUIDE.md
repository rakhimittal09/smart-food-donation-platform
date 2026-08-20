# 🚀 Deployment Guide — Smart Food Donation Platform (NourishLink)

This comprehensive guide will help you deploy your full-stack MERN (MongoDB, Express, React, Node.js) application to live production for **100% FREE** using modern cloud platforms.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Setup Cloud Database (MongoDB Atlas)](#step-1-setup-cloud-database-mongodb-atlas)
3. [Step 2: Commit & Push Code to GitHub](#step-2-commit--push-code-to-github)
4. [Step 3: Choose Your Deployment Method](#step-3-choose-your-deployment-method)
   - **[Method A: Render Blueprint (Easiest - 1 Click) ⭐](#method-a-render-blueprint-recommended-)**
   - **[Method B: Vercel (Frontend) + Render (Backend)](#method-b-vercel-frontend--render-backend)**
   - **[Method C: Single Unified Service (Render / Railway)](#method-c-single-unified-service-render--railway)**
5. [Step 4: Seed Initial Data (Optional)](#step-4-seed-initial-data-optional)
6. [Troubleshooting & FAQs](#troubleshooting--faqs)

---

## 1. Prerequisites

Before starting, ensure you have free accounts on:
1. **GitHub** ([github.com](https://github.com))
2. **MongoDB Atlas** ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
3. **Render** ([render.com](https://render.com)) and/or **Vercel** ([vercel.com](https://vercel.com))

---

## Step 1: Setup Cloud Database (MongoDB Atlas)

Since local MongoDB (`localhost:27017`) won't work on the cloud, create a free cloud database:

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Click **Create a Database** / **Build a Database** and select the **FREE M0** tier (Shared).
3. **Database Access (User):**
   - Go to **Security** ➔ **Database Access**.
   - Click **Add New Database User**.
   - Set Username (e.g., `rakhi`) and a secure Password (e.g., `SecurePass123!`).
   - Role: `Read and write to any database`.
4. **Network Access (IP Whitelist):**
   - Go to **Security** ➔ **Network Access**.
   - Click **Add IP Address**.
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. **Get Connection String:**
   - Go to **Deployment** ➔ **Database**.
   - Click **Connect** on your cluster ➔ Select **Drivers** (Node.js).
   - Copy the URI, for example:
     ```text
     mongodb+srv://rakhi:<password>@cluster0.xxxx.mongodb.net/smart-food-donation?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your database user password.

---

## Step 2: Commit & Push Code to GitHub

Open terminal in the project root:
```bash
git add .
git commit -m "Configure deployment files and build setup"
git push origin main
```

---

## Step 3: Choose Your Deployment Method

### Method A: Render Blueprint (Recommended ⭐)

This repository includes a [`render.yaml`](./render.yaml) file configured for instant dual-service deployment.

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click the **New +** button in top navbar ➔ Select **Blueprint**.
3. Connect your repository: `rakhimittal09/smart-food-donation-platform`.
4. Render will detect the `render.yaml` and create 2 services:
   - `smart-food-donation-backend` (Node.js Web Service)
   - `smart-food-donation-frontend` (Static Site)
5. Fill in the environment variables when prompted:
   - `MONGO_URI`: Your MongoDB Atlas URI from Step 1
   - `CLIENT_URL`: Leave empty initially or set to your frontend URL
   - `VITE_API_BASE_URL`: `https://smart-food-donation-backend.onrender.com/api` (replace with your backend service name)
6. Click **Apply**.
7. Once deployed:
   - Copy the Backend URL (e.g. `https://smart-food-donation-backend.onrender.com`).
   - Copy the Frontend URL (e.g. `https://smart-food-donation-frontend.onrender.com`).
   - Go to Backend Settings ➔ Environment Variables ➔ Set `CLIENT_URL` = your frontend URL.
   - Go to Frontend Settings ➔ Environment Variables ➔ Set `VITE_API_BASE_URL` = `https://smart-food-donation-backend.onrender.com/api`.
   - Click **Manual Deploy** ➔ **Deploy latest commit** on Frontend to apply the API URL!

---

### Method B: Vercel (Frontend) + Render (Backend)

#### 1. Deploy Backend on Render:
1. Go to [Render Dashboard](https://dashboard.render.com/) ➔ **New +** ➔ **Web Service**.
2. Connect `smart-food-donation-platform` repo.
3. Settings:
   - **Name:** `smart-food-donation-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://...` (from Atlas)
   - `JWT_SECRET` = (random 32 character string)
   - `CLIENT_URL` = `https://your-vercel-app.vercel.app` (update after deploying frontend)
5. Click **Create Web Service**.

#### 2. Deploy Frontend on Vercel:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) ➔ **Add New...** ➔ **Project**.
2. Import `rakhimittal09/smart-food-donation-platform` repository.
3. Configure Project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://smart-food-donation-api.onrender.com/api` (your Render backend URL + `/api`)
5. Click **Deploy**.
6. Copy your Vercel URL (e.g., `https://smart-food-donation-platform.vercel.app`) and paste it as `CLIENT_URL` in your Render backend settings!

---

### Method C: Single Unified Service (Render / Railway)

You can also run both Frontend & Backend from a single unified server:

1. In Render ➔ **New Web Service**.
2. **Root Directory:** *(leave blank / root)*
3. **Build Command:** `npm run install:all && npm run build`
4. **Start Command:** `npm start`
5. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGO_URI` = `mongodb+srv://...`
   - `JWT_SECRET` = `your_jwt_secret`
6. Click **Create Web Service**. Your full frontend + backend will run seamlessly under a single URL!

---

## Step 4: Seed Initial Data (Optional)

To seed demo users (Donor, NGO, Admin) and categories into your live cloud database:

Run locally with your Atlas URI:
```bash
# In server directory, set MONGO_URI in server/.env to your Atlas connection string, then:
cd server
npm run seed
```

---

## 🔒 Security Best Practices for Production

1. **CORS:** `server/app.js` is configured to only allow requests from your `CLIENT_URL` in production.
2. **Secrets:** Never commit `.env` files to git. Use hosting platform environment variables.
3. **MongoDB:** Always restrict IP or keep strong passwords on Atlas database users.

---

## ❓ Troubleshooting

| Issue | Solution |
|---|---|
| **CORS Error in Browser** | Verify `CLIENT_URL` in backend matches your frontend domain (no trailing slash). |
| **API 404 on Refresh** | Check `client/vercel.json` (Vercel) or static route rewrite `/* -> /index.html` (Render). |
| **MongoDB Connection Timeout** | Verify Network Access in MongoDB Atlas has `0.0.0.0/0` allowed. |
| **Images not displaying** | If hosting on free ephemeral containers, uploaded images reset on restart. For persistent uploads, consider Cloudinary (optional upgrade). |
