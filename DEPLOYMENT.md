# FrameHub Deployment Guide

Current production targets:

- Frontend: https://gallery-ebon-six.vercel.app/
- Backend: https://gallery-39ia.onrender.com/
- Health check: https://gallery-39ia.onrender.com/health

## Frontend: Vercel

Recommended project settings:

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Required environment variables:

```env
VITE_API_BASE_URL=https://gallery-39ia.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

After changing environment variables, redeploy the latest Vercel deployment. Vite bakes `VITE_*` variables into the build, so a settings change alone is not enough.

`client/vercel.json` rewrites all routes to `index.html`, which allows direct refreshes on React Router routes such as `/login`, `/register`, `/gallery`, `/explore`, and `/photos/:id`.

## Backend: Render

Recommended service settings:

- Root directory: `server`
- Environment: Node
- Build command: `npm install && npm run prisma:generate && npm run build`
- Start command: `npx prisma migrate deploy && npm start`
- Health check path: `/health`

Required environment variables:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=use_a_strong_32_plus_character_secret
JWT_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://gallery-ebon-six.vercel.app
MAX_FILE_SIZE=5242880
MAX_FILES_PER_REQUEST=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

Important CORS details:

- `CORS_ORIGIN` must not include a trailing slash.
- Local development origins are included automatically outside production only.
- The production frontend origin should be exactly `https://gallery-ebon-six.vercel.app`.
- Production startup fails if required environment variables are missing, if `JWT_SECRET` is too short, or if production database/CORS values point at localhost.

## Deployment Verification

Run these checks after each deploy:

```bash
curl https://gallery-39ia.onrender.com/health
curl -H "Origin: https://gallery-ebon-six.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS https://gallery-39ia.onrender.com/api/auth/login
```

In the browser:

- Open https://gallery-ebon-six.vercel.app/.
- Register a disposable account.
- Log in and confirm the app calls `https://gallery-39ia.onrender.com/api`, not localhost.
- Upload an image and confirm it appears in the gallery.
- Create an album, add the uploaded photo, and open the album detail page.
- Search for the uploaded title, test tag filtering if tags exist, and sort Explore by latest/oldest/popular.
- Like the photo and add a comment; confirm comments paginate.
- Open the photo detail page, test edit/delete ownership behavior, and confirm delete requires confirmation.
- Refresh `/login`, `/gallery`, `/explore`, and a photo detail route to verify SPA rewrites.

## CI

GitHub Actions runs on pushes and pull requests to `main` and `develop`.

- Server job: PostgreSQL service, `npm ci`, Prisma generate/migrate deploy, tests, typecheck, build.
- Client job: `npm ci`, tests, typecheck, build.
- Lint step is wired with `npm run lint --if-present` for future lint configuration.

## Secret Handling

- Never commit `client/.env`, `server/.env`, `.env.local`, Cloudinary secrets, JWT secrets, or database URLs.
- Commit only `.env.example` files with placeholder values.
- Rotate any secret that was accidentally pasted into a public place or committed to git history.

## Production Data Notes

Cloudinary uploads use UUID public IDs inside a user namespace:

```text
framehub/{userId}/{uuid}
```

This prevents public ID collisions when different users upload files with the same original filename. If a database write fails after upload, the server attempts to delete the just-uploaded Cloudinary asset. When a photo is deleted, the database record is removed first and Cloudinary deletion is attempted afterward with logging for manual cleanup if Cloudinary is temporarily unavailable.
