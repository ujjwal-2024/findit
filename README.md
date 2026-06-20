# FindIt — AI-Powered Lost & Found Platform

FindIt connects people who have lost items with people who have found them, using AI image matching to detect when a lost item and a found item are likely the same — then notifies both parties automatically.

## How it works

1. A user posts a **lost item** with a photo and description
2. Another user posts a **found item** with a photo and description
3. AI compares item photos and detects likely matches
4. If the match score crosses 70%, both users get notified and can contact each other

## Features

- Email/password authentication with JWT
- Upload lost/found items with photo, category, location, and date
- Automatic AI image comparison and match scoring
- In-app match details with contact options
- Browse and filter all active items
- Status tracking per item (active, matched, returned, closed)
- Forgot password with reset link
- Fully responsive design (mobile, tablet, desktop)

## Tech stack

**Frontend:** React 18, Vite, TailwindCSS, React Query, React Hook Form
**Backend:** Node.js, Express.js
**Database:** PostgreSQL (Supabase), Prisma ORM
**AI Matching:** Groq API (Llama 4 Scout vision model)
**Image Storage:** Cloudinary
**Hosting:** Vercel (frontend) + Railway (backend)

## Live demo

https://findit-tan-ten.vercel.app

## GitHub

https://github.com/ujjwal-2024/findit

## License

MIT