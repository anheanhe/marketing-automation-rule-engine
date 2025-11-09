# Deployment Instructions for dumpling-tech.com/demo/loyalty-software

⚠️ **IMPORTANT**: Your site dumpling-tech.com is hosted on **Netlify**. This project needs to be integrated into your existing Netlify project.

## The Problem

Right now you're seeing a blank page because:
- The files from THIS project are NOT in your dumpling-tech.com Netlify site
- When you visit `/demo/loyalty-software`, Netlify is serving your main site's index.html
- You need to COPY the files from this project's `dist/` folder to your main Netlify project

## Solution: Copy Files to Your Main Project

### Step 1: Get the files from this project

All the built files are in the `dist/` folder:
```
dist/
  ├── index.html
  └── assets/
      ├── index-CvKbC-py.js
      └── index-CL-RO2ae.css
```

### Step 2: Add to your dumpling-tech.com repository

In your dumpling-tech.com repository, create this structure:
```
your-project/
  ├── demo/
  │   └── loyalty-software/
  │       ├── index.html (copy from this project's dist/)
  │       └── assets/
  │           ├── index-CvKbC-py.js (copy from this project's dist/assets/)
  │           └── index-CL-RO2ae.css (copy from this project's dist/assets/)
```

### Step 3: Add Netlify redirects

In your main project, create or update `netlify.toml`:

```toml
[[redirects]]
  from = "/demo/loyalty-software/*"
  to = "/demo/loyalty-software/index.html"
  status = 200

[[redirects]]
  from = "/demo/loyalty-software"
  to = "/demo/loyalty-software/index.html"
  status = 200
```

OR add to `_redirects` file:
```
/demo/loyalty-software/*  /demo/loyalty-software/index.html  200
/demo/loyalty-software    /demo/loyalty-software/index.html  200
```

### Step 4: Set Environment Variables

In Netlify Dashboard (for your dumpling-tech.com site):
1. Go to: Site settings > Environment variables
2. Add these variables:
   - `VITE_SUPABASE_URL` = `https://wkmwvgfrmcmdgjljwqow.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (get from your .env file)

### Step 5: Deploy

Commit and push to trigger Netlify deployment.

## Alternative: Check if files are already there

Run this command to see what's currently at that path:
```bash
curl https://dumpling-tech.com/demo/loyalty-software/assets/index-CvKbC-py.js
```

If you get a 404, the files aren't deployed yet.

## Files Ready to Copy

The `dist/` folder in THIS project contains everything you need. Just copy it to the `demo/loyalty-software/` directory in your main dumpling-tech.com project.
