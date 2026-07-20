# NorthstarLabs Learning Platform

NorthstarLabs is a multi-academy learning platform built with vinext, Cloudflare
D1 and R2, and Supabase authentication. It includes creator onboarding, course
authoring, protected media, learner progress, assessments, certificates,
communities, reporting, email operations, platform administration, and
production reliability controls. Creators can also package courses and
communities as bundles, memberships or live programmes, schedule live sessions,
grant product access, and connect signed webhooks.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

This starter does not use `wrangler.jsonc`.

## Production shape

- `.openai/hosting.json` declares the Sites D1 and R2 bindings.
- `db/schema.ts` and `drizzle/` hold the versioned data model.
- `worker/index.ts` applies request IDs, security headers, body limits, rate
  limits, and operational error capture.
- `/api/health` provides a minimal public health signal.
- `/admin` contains platform health, moderation, storage, backup, and audit
  controls for allowlisted platform administrators.
- `/dashboard/products` manages bundles, creator memberships, product access,
  and storefront publishing.
- `/dashboard/live` schedules provider-linked live learning and records
  registrations and attendance.
- `/dashboard/integrations` manages signed outbound webhooks. Calendar export
  and installable mobile/PWA access require no external credentials.

## Product and live-learning access

- A product can include any number of courses and the academy community.
- Free published products support signed-in self-enrolment from the academy
  storefront. Paid products can be granted manually until checkout is connected.
- Product entitlements materialise protected course, community, and upcoming
  live-session access. Revocation pauses only access originating from that
  entitlement and preserves direct enrolments.
- Live sessions support Zoom, Google Meet, Microsoft Teams, or another secure
  HTTPS provider link. Eligible learners can download an `.ics` calendar file.
- Webhooks include timestamped HMAC-SHA256 signatures in
  `x-northstar-signature`; the signing secret is shown once at creation.

## Required production configuration

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for complete account deletion and privileged
  identity administration
- `PLATFORM_ADMIN_EMAILS`, a comma-separated allowlist
- `RESEND_API_KEY`, `EMAIL_FROM`, and optionally `EMAIL_REPLY_TO`
- `MAINTENANCE_SECRET`, at least 24 characters, for the scheduled maintenance
  endpoint

Optional quota overrides:

- `SCHOOL_STORAGE_QUOTA_BYTES` defaults to 5 GB per academy.
- `SCHOOL_MEDIA_ASSET_LIMIT` defaults to 2,000 files per academy.

Call `POST /api/platform/maintenance` from a trusted hourly scheduler with the
secret in `x-maintenance-secret`. It creates a daily backup when due and removes
expired rate-limit buckets, playback grants, old resolved events, and expired
product access. It also backfills future live-session reminders and hands their
exact delivery times to the email provider. Backup integrity can be verified
from the platform reliability console.

## Workspace Auth Headers

OpenAI workspace sites can read the current user's email from
`oai-authenticated-user-email`.

SIWC-authenticated workspace sites may also receive
`oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty
`name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by
`oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs
optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send
  anonymous visitors through Sign in with ChatGPT.
- Use `chatGPTSignInPath(returnTo)` and `chatGPTSignOutPath(returnTo)` for
  browser links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in
  or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because
  they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the
OAuth cookies, and identity header injection. Do not implement app routes for
those reserved paths. Routes that do not import and call the helper remain
anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the
Sites hosting platform's access policy controls for workspace-wide restrictions,
or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write
actions tied to the current ChatGPT user. Leave public content anonymous.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the vinext build output
- `npm test`: build the platform and run all release checks
- `npm run test:journeys`: run creator-to-learner, product entitlement,
  isolation, deletion, and security journey checks
- `npm run db:generate`: generate Drizzle migrations after schema changes
- `npm run db:validate`: apply every migration to a fresh database and validate
  the resulting model

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
