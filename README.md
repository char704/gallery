# FrameHub

FrameHub is a full-stack photo gallery platform scaffolded as two TypeScript apps:

- `client/`: React 18, Vite, Tailwind CSS, React Router, TanStack Query, Zustand
- `server/`: Node.js 20, Express, Prisma, PostgreSQL, JWT-ready API structure

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

## Verification

Run these checks in both `client/` and `server/`:

```bash
npm run typecheck
npm test
npm run build
```

## Notes

- Authentication, photo upload, albums, search, and profile flows are scaffolded with typed modules and placeholder routes/components.
- Prisma is server-only. The client uses service modules for API access.
- Docker, CI, and deployment files are intentionally deferred from this initial scaffold.
