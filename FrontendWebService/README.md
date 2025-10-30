This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1) Copy env example and set Backend API URL:

```bash
cp .env.example .env
# Edit .env and set:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000
```

2) Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Using the API client

Use the centralized API client in `src/lib/api.ts`:

```ts
import { apiFetch } from "@/lib/api";

// Example:
const connectors = await apiFetch("/connectors", { method: "GET" });
```

The client:
- Reads base URL from `NEXT_PUBLIC_API_URL`
- Adds Authorization header via dev stub (replace with real auth)
- Includes basic tenant context headers (dev stub)
- Handles JSON serialization and errors

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
