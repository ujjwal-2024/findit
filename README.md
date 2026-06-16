# FindIt — AI-Powered Lost & Found Platform

A full-stack web app that uses Claude Vision AI to automatically match lost and found items.

## Project Structure

```
findit/
├── frontend/          # React + Vite + TailwindCSS
└── backend/           # Node.js + Express + Prisma + PostgreSQL
```

## Quick Start

### 1. Clone and install
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Fill in your keys
```

### 3. Set up database
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run dev servers
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Query |
| Backend | Node.js, Express.js |
| Database | PostgreSQL via Supabase, Prisma ORM |
| AI Matching | Anthropic Claude Vision API |
| Image Storage | Cloudinary |
| Email | Resend |
| Hosting | Vercel (frontend) + Railway (backend) |
