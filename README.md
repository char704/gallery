# FrameHub - Deployed Full-Stack Photo Gallery MVP

FrameHub is a working full-stack photo gallery app. Users can register, upload images to Cloudinary, organize photos into albums, search public photos, like and comment, and manage private/public visibility.

This is best described as a deployed MVP: the main product flows work end to end, with CI, integration tests, production env validation, and deployment docs. Future hardening still includes HttpOnly refresh-token cookies, richer moderation, and deeper observability.

- Live app: https://gallery-ebon-six.vercel.app/
- Backend API: https://gallery-39ia.onrender.com/
- Health check: https://gallery-39ia.onrender.com/health
- Repository: https://github.com/char704/gallery

## Status

- Authentication: register, login, `/api/auth/me`, persisted client sessions
- Photo management: upload, edit, delete, Cloudinary cleanup, UUID public IDs
- Albums: create, list, view, delete, add/remove photos, privacy controls
- Search: title/description/tag search, suggestions, trending tags, pagination
- Discovery: public gallery, tag filtering, latest/oldest/popular sorting
- Engagement: like/unlike, like counts, paginated comments
- Security basics: CORS allowlist, ownership checks, input validation, fail-fast production env validation
- Quality: Vitest, React Testing Library, Supertest integration tests, GitHub Actions CI

## Tech Stack

- Client: React 18, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query, Zustand
- Server: Node.js 20, Express, TypeScript, Prisma, PostgreSQL, JWT auth
- Storage: Cloudinary image uploads under `framehub/{userId}/{uuid}`
- Testing: Vitest, React Testing Library, Supertest
- Deployment: Vercel frontend, Render backend

## Architecture

```mermaid
flowchart LR
  Browser["Browser"] --> Client["React app on Vercel"]
  Client -->|"HTTPS /api"| Server["Express API on Render"]
  Server -->|"Prisma"| DB["PostgreSQL"]
  Server -->|"Upload/delete images"| Cloudinary["Cloudinary"]
  GitHub["GitHub Actions"] -->|"test/typecheck/build"| Client
  GitHub -->|"test/typecheck/build"| Server
```

## Local Setup

```bash
cd client
npm install

cd ../server
npm install
```

Create local env files:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Prepare the database:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

Run the apps:

```bash
cd server
npm run dev

cd ../client
npm run dev
```

Default local URLs:

- Client: http://localhost:5173
- Server health: http://localhost:5000/health

## Environment

Client:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Server:

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/framehub
JWT_SECRET=use_a_strong_32_plus_character_secret
JWT_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=5242880
MAX_FILES_PER_REQUEST=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

For test databases, copy `server/.env.test.example` to `server/.env.test` and point `DATABASE_URL` at a disposable PostgreSQL database. CI uses `framehub_test`.

Never commit real `.env`, `.env.local`, database URLs, JWT secrets, or Cloudinary secrets.

## API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Photos:

- `GET /api/photos?page=&limit=&tag=&sort=`
- `GET /api/photos/feed`
- `POST /api/photos` with multipart field `image`
- `GET /api/photos/:id`
- `PATCH /api/photos/:id`
- `DELETE /api/photos/:id`
- `POST /api/photos/:photoId/like`
- `DELETE /api/photos/:photoId/like`
- `GET /api/photos/:photoId/likes`
- `GET /api/photos/:photoId/comments`
- `POST /api/photos/:photoId/comments`

Albums:

- `GET /api/albums`
- `GET /api/albums/public`
- `GET /api/albums/user/:userId`
- `POST /api/albums`
- `GET /api/albums/:id`
- `PATCH /api/albums/:id`
- `DELETE /api/albums/:id`
- `POST /api/albums/:id/photos`
- `DELETE /api/albums/:id/photos/:photoId`

Search:

- `GET /api/search?q=&tag=&sort=&page=&limit=`
- `GET /api/search/suggestions?q=`
- `GET /api/search/tags`

Comments:

- `PATCH /api/comments/:commentId`
- `DELETE /api/comments/:commentId`

## Verification

```bash
cd client
npm run typecheck
npm test
npm run build

cd ../server
npm run typecheck
npm test
npm run build
```

Server coverage:

```bash
cd server
npm run test:coverage
```

Production smoke checks:

```bash
curl https://gallery-39ia.onrender.com/health
curl -I https://gallery-ebon-six.vercel.app/login
```

## Demo Account

Use the live registration flow to create a disposable account. Shared demo credentials are intentionally not committed; keep any demo account password in a private note and rotate it before sharing publicly.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Render/Vercel setup, env variables, CORS notes, and post-deploy checks.

## Roadmap

- Move auth tokens to HttpOnly refresh-token cookies.
- Add moderation/admin tools for public content.
- Add richer profile/follow feeds and notifications.
- Add image metadata views and advanced search facets.
