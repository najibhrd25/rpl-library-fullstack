# RPLLibrary - Fullstack Monolith

This project has been refactored from a split-architecture (Next.js Frontend + Express.js Backend) into a single unified **Next.js Fullstack Monolith**, utilizing Next.js App Router Serverless API Routes.

## ⚠️ Important Architectural Notices

### 1. Removal of Express.js
The old `backend` folder utilizing Express.js has been completely removed. All API logic, including JWT verification and Prisma Database ORM connections, have been migrated directly into `/frontend/app/api`. You no longer need to run two separate terminals!
Just run `npm run dev` in this directory to start the whole application (frontend & API).

### 2. Multer Dependency Dropped (File Upload Changes)
> **Warning**: The `multer` dependency is **no longer used** for handling file uploads (Book Covers, Profile Pictures).
Because Next.js Serverless Route Handlers do not inherently support Express middlewares like Multer, file uploads have been entirely refactored to use standard Node.js `Request.formData()`, mapping `ArrayBuffers` directly into `Buffer` parsing, and writing strictly via `fs/promises` directly to the `/public/uploads/` directory.

### 3. Vercel Deployment & Database
When deploying to Vercel:
- Ensure your `DATABASE_URL` in the Vercel Dashboard points to a **Cloud Database** (e.g., Supabase PostgreSQL, Neon, Railway). It cannot point to a local Mac URL (`localhost:5433`).
- Add `JWT_SECRET` to the environment variables on Vercel.
- The `postinstall` script or Vercel Build process will automatically run `npx prisma generate` to build the required query engines.

## Available Scripts

- `npm run dev`: Starts the Next.js development server (both UI and API).
- `npm run build`: Builds the application for production.
