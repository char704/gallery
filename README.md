# FrameHub

FrameHub is a full-stack photo gallery platform with working authentication and photo upload/gallery vertical slices:

- `client/`: React 18, Vite, Tailwind CSS, React Router, TanStack Query, Zustand
- `server/`: Node.js 20, Express, Prisma, PostgreSQL, JWT auth, Cloudinary uploads

## Project Structure

```text
framehub/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- services/
|   |   |-- store/
|   |   |-- test/
|   |   |-- types/
|   |   |-- utils/
|   |   |-- App.tsx
|   |   |-- index.css
|   |   `-- main.tsx
|   |-- .env.example
|   |-- package.json
|   |-- tsconfig.json
|   |-- tailwind.config.js
|   `-- vite.config.ts
|-- server/
|   |-- prisma/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- types/
|   |   |-- utils/
|   |   |-- validators/
|   |   |-- app.ts
|   |   `-- server.ts
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
`-- README.md
```

## Getting Started

Install dependencies in each app:

```bash
cd client
npm install

cd ../server
npm install
```

Create local environment files from the examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Generate Prisma Client and prepare the database:

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

Required server `.env` values:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: strong signing secret for access tokens
- `JWT_EXPIRY`: token lifetime, for example `7d`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CORS_ORIGIN`: comma-separated Vite client origins, usually `http://localhost:5173,http://127.0.0.1:5173`

Run the apps:

```bash
cd server
npm run dev

cd ../client
npm run dev
```

Default local URLs:

- Client: http://localhost:5173
- Server health check: http://localhost:5000/health

## Working Features

- Register and login with email/password validation and bcrypt password hashing.
- JWT-based protected routes with persisted client sessions.
- `/auth/me` session hydration after browser refresh.
- Authenticated photo upload to Cloudinary with MIME/signature validation.
- Photo metadata persisted in PostgreSQL through Prisma.
- Personal gallery with pagination at `/gallery`.
- Public gallery with pagination at `/explore`.
- Photo detail page with owner-only edit/delete actions.

## API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

Photos:

- `GET /api/photos` for public photos
- `GET /api/photos/feed` for the authenticated user's photos
- `POST /api/photos` with multipart field `image`
- `GET /api/photos/:id`
- `PATCH /api/photos/:id`
- `DELETE /api/photos/:id`
- `GET /api/photos/user/:userId`

## Verification

Run these checks in both `client/` and `server/`:

```bash
npm run typecheck
npm test
npm run build
```

## Notes

- Albums, search, and community features remain scaffolded for later phases.
- Prisma is server-only. The client uses service modules for API access.
- Docker, CI, and deployment files are intentionally deferred from this initial scaffold.
