
# B2B SaaS Dashboard Design

This is a code bundle for B2B SaaS Dashboard Design. The original project is available at https://www.figma.com/design/pXagjubrGJspsg4NGLWq89/B2B-SaaS-Dashboard-Design.

## Running locally

Run `npm i` to install dependencies.

Run `npm run dev` to start the development server.

## Environment variables used by the app

This project uses Supabase authentication and requires:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Local setup:

1. Copy `.env.example` to `.env`
2. Fill in both variables
3. Restart `npm run dev`

## GitHub Actions + Vercel CI/CD

Workflow file: `.github/workflows/vercel-deploy.yml`

The workflow deploys:

- Preview deployments for pull requests to `main` (non-fork PRs)
- Production deployments for pushes to `main`

Set these GitHub repository secrets so CI/CD can deploy and inject app env values:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Notes:

- `VITE_*` variables are public by design in Vite and are embedded at build time.
- Client-side routes are handled by `vercel.json` rewrite to `index.html`.
