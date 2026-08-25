# CLAUDE.md

Static gallery app serving starfish.zama.space — pieces live under
`public/projects/<slug>/`, indexed by the array in `app/page.tsx`.

## Shared auth & entitlements (platform convention)

This app has no auth yet, but when any feature here needs user auth or makes
an LLM/paid-API call, it must use the **shared Supabase project**
`sdkofcvuflhfhxrrpeou` (to be renamed `zama`) — one Google sign-in shared with
motif.name and ideograph.co. Full conventions:
`~/docs/shared-auth-conventions.md`. The short version:

- **Never** add a new Supabase project, standalone auth, or an ungated
  paid-provider route. The in-memory limiter on `/api/imagine` is per-lambda
  on Vercel and does not actually limit anything; the real gate is the
  `llm.imagine` entitlement flag once auth lands here.
- **Every flag must be manageable from the admin console** — registry at
  `~/code/motifs/app/src/lib/entitlements.ts`, console at
  motif.name/admin/dashboard (Users tab). New signups have zero flags.
- Log paid-provider calls to `public.usage_events` (user_id, app: 'starfish',
  route, provider, model, units, cost_cents).
- This domain can share a session with zama.space (`.zama.space` cookie
  domain) when both adopt the shared auth.
