# Deploying to GitHub Pages

GitHub Pages serves static files only. This app uses TanStack Start server
functions (investments, admin, profile), which need a server runtime, so on
Pages you get the static site: marketing pages, /demo and /admin-demo. Sign-in,
investing, admin approvals and profile saves need a server host (Lovable
publish, Cloudflare, Vercel, ...).

## One-time setup
1. Repo Settings > Pages > Source: **GitHub Actions**.
2. Add secrets `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Add variables `VITE_PAYOUT_BANK`, `VITE_PAYOUT_ACCOUNT_NAME`,
   `VITE_PAYOUT_ACCOUNT_NUMBER`, `VITE_PAYOUT_BRANCH_CODE`, `VITE_PAYOUT_ACCOUNT_TYPE`.
4. Run `supabase/migrations/20261103000000_avatars_bucket.sql` on your database.

## Vite/TanStack config needed for a static build (not visible to me)
In `vite.config.ts` enable TanStack Start SPA mode so a static shell is emitted,
and set the base path when serving from `https://<user>.github.io/<repo>/`:

    tanstackStart({ spa: { enabled: true } })
    base: process.env.GITHUB_PAGES ? "/<repo-name>/" : "/"

and pass `basepath: "/<repo-name>"` to `createRouter` in `src/router.tsx`
(skip both if using a custom domain). If your Lovable preset overrides the
config, make these changes there.
