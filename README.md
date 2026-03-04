# Pickupzz

Pickupzz is a web app for generating and discovering pickup lines with fast search, category filtering, lightweight AI-style content seeding, and user submissions.

## Quick start

```bash
node server.js
```

Open `http://localhost:3000`.

## Included MVP code

This repo now includes a runnable MVP implementation with:

- Static frontend in `public/`
- HTTP API server in `server.js`
- Seed pickup line data in `data/pickupLines.js`
- Basic API tests in `test/api.test.js`

### API endpoints

```http
GET  /api/generate?category=
GET  /api/category/:name
GET  /api/search?q=
POST /api/submit
POST /api/favorite
GET  /api/trending
POST /api/reset
```

---

## Product blueprint (original planning notes)

Pickupzz generates pickup lines from:

- Category (funny, romantic, nerdy, cheesy, etc.)
- Search keywords
- Random generation
- User submissions

Instead of preloading massive trillion-scale content from day one, Pickupzz starts with curated lines, then expands with AI generation and efficient indexing.

## 2) MVP features

### User features

- Random pickup line generator
- Category browsing
- Search pickup lines
- Copy button
- Save favorites
- Submit new pickup lines
- Trending pickup lines
- Developer API

### Admin features

- Moderate submitted lines
- Category management
- Analytics dashboard
- Spam filtering

## 3) Functional architecture

```text
User
 ↓
Frontend (React / Next.js)
 ↓
API Server (Node.js / Django)
 ↓
Cache Layer (Redis)
 ↓
Database (PostgreSQL + Search Engine)
 ↓
AI Generator Service
```

## 4) Frontend structure

### Pages

- Home
- Generator
- Categories
- Trending
- Submit
- Favorites
- API Docs

### Tech stack

- Next.js
- Tailwind CSS
- CDN caching
- Edge functions

### Components

- Navbar
- Category selector
- Generate button
- Pickup line card
- Copy button
- Like button

## 5) Backend API service

Core responsibilities:

- Generate lines
- Fetch by category
- Search
- User accounts
- Favorites

## 6) Database design

### `pickup_lines`

- `id`
- `text`
- `category`
- `tags`
- `popularity_score`
- `likes`
- `created_at`
- `source` (`AI`, `user`, `curated`)
- `language`

### `users`

- `id`
- `username`
- `email`
- `password_hash`
- `created_at`

### `favorites`

- `user_id`
- `pickup_line_id`
