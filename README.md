# 🔭 GitHub Profile Views Tracker

Real-time GitHub profile visit dashboard with timestamps, country breakdown, referrer tracking, and selectable time windows (1h · 1d · 7d · 30d · 1y).

---

## How it works

```
Your GitHub README (badge image)
        │
        │  every profile view = 1 HTTP request to your Vercel app
        ▼
/api/track  ──→  Upstash Redis  ──→  /api/stats  ──→  Dashboard
```

---

## Deploy in 5 steps

### Step 1 — Clone / download this project

```bash
git clone https://github.com/YOUR_USERNAME/gh-profile-tracker.git
cd gh-profile-tracker
npm install
```

---

### Step 2 — Create a free Upstash Redis database

1. Go to **[https://console.upstash.com](https://console.upstash.com)**
2. Click **Create Database**
3. Choose a name (e.g. `gh-tracker`), pick a region close to you
4. Click **Create**
5. Scroll down to **REST API** section
6. Copy your:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

### Step 3 — Deploy to Vercel

#### Option A: Vercel CLI (recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:

```
UPSTASH_REDIS_REST_URL    = (paste from Upstash)
UPSTASH_REDIS_REST_TOKEN  = (paste from Upstash)
```

#### Option B: Vercel Web UI

1. Push this project to a GitHub repo
2. Go to **[https://vercel.com/new](https://vercel.com/new)**
3. Import your repo
4. In **Environment Variables**, add both Upstash values
5. Click **Deploy**

Vercel will give you a URL like: `https://gh-profile-tracker-xyz.vercel.app`

---

### Step 4 — Add the tracking badge to your GitHub README

Open your GitHub profile README (`github.com/YOUR_USERNAME/YOUR_USERNAME`) and add:

```markdown
![Profile Views](https://YOUR-APP.vercel.app/api/track?user=YOUR_USERNAME)
```

**Replace:**
- `YOUR-APP.vercel.app` → your Vercel deployment URL
- `YOUR_USERNAME` → your GitHub username

Every time someone visits your GitHub profile, their browser loads this invisible 1×1 pixel image, which logs the visit to your database.

---

### Step 5 — View your dashboard

Go to: **`https://YOUR-APP.vercel.app`**

Type your GitHub username in the search box and select a time window.

The dashboard **auto-refreshes every 30 seconds** with live data.

---

## Features

| Feature | Details |
|---------|---------|
| Time windows | 1 Hour · 1 Day · 7 Days · 30 Days · 1 Year |
| Country tracking | Automatic via Vercel edge headers |
| Referrer tracking | Where visitors came from |
| Bot filtering | Crawlers/bots are automatically excluded |
| Visit log | Last 100 visits with timestamps |
| Auto-refresh | Dashboard updates every 30 seconds |
| Multi-user | Track any GitHub username, each stored separately |
| Data retention | Last 5,000 visits per user |

---

## Local development

```bash
# 1. Copy env template
cp .env.example .env.local

# 2. Fill in your Upstash credentials in .env.local

# 3. Install Vercel CLI
npm install -g vercel

# 4. Run locally (uses Vercel dev server to emulate serverless functions)
vercel dev
```

Open `http://localhost:3000`

---

## Project structure

```
gh-tracker/
├── api/
│   ├── track.js        # Tracking pixel endpoint
│   └── stats.js        # Stats API endpoint
├── lib/
│   └── redis.js        # Upstash Redis client
├── public/
│   └── index.html      # Dashboard frontend
├── vercel.json         # Vercel routing config
├── package.json
└── .env.example
```

---

## FAQ

**Q: Will it track ALL visitors or just my own?**  
A: It tracks every browser that loads your README badge image. This includes anyone who views your GitHub profile page — regardless of whether they're logged in.

**Q: Can I track multiple GitHub users?**  
A: Yes. The dashboard lets you search any username. Each user's data is stored separately.

**Q: Is the data accurate?**  
A: Very accurate for real browsers. GitHub's image caching can sometimes batch requests, and bots are automatically filtered out.

**Q: How do I see it in real-time?**  
A: The dashboard auto-refreshes every 30 seconds. Open it in a browser tab and leave it running.

**Q: Will Upstash free tier be enough?**  
A: Yes. Upstash free tier gives 10,000 commands/day which is more than enough unless you're extremely popular.
