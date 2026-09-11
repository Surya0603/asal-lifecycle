# ASAL — Product Lifecycle + QR System

A complete, working web app: admin-authenticated product refurbishment lifecycle
tracking, with QR code generation that links to a public, no-login lifecycle
page. Built with **Next.js 14 (App Router) + TypeScript + Prisma + SQLite +
Tailwind CSS**.

This is a real, runnable project — not a static prototype. Every admin action
(editing a stage, uploading media, generating a QR) writes to a real database
and real files on disk.

---

## 1. Setup

```bash
npm install
cp .env.example .env
# edit .env if you want — the defaults work out of the box for local dev

npx prisma db push      # creates dev.db (SQLite) with the schema
npm run db:seed         # creates the admin login (see SEED_ADMIN_EMAIL/PASSWORD in .env)

npm run dev
```

Open **http://localhost:3000**.

Default admin login (from `.env.example`, change before real use):
- Email: `admin@asal.com`
- Password: `ChangeMe123!`

## 2. Replace the placeholder logo

`public/asal-logo.svg` is a placeholder text logo. Replace that file with the
real ASAL logo (same filename, or update the `<img src="/asal-logo.svg">`
references in `src/app/page.tsx`, `src/components/admin/Nav.tsx`,
`src/app/admin/login/page.tsx`, `src/app/p/[productId]/page.tsx`, and
`src/components/admin/QRSheet.tsx`).

## 3. Contact / social info

Set these in `.env` — they appear on the public lifecycle page and the QR
print sheet:

```
NEXT_PUBLIC_ASAL_CONTACT_PHONE="+91 90000 00000"
NEXT_PUBLIC_ASAL_INSTAGRAM="@asal.refurbished"
```

## 4. Deploying

- SQLite (`dev.db`) is fine for a single-server deployment. For multi-instance
  hosting, switch `prisma/schema.prisma`'s datasource to `postgresql` and
  point `DATABASE_URL` at a real Postgres instance — nothing else changes.
- Uploaded media and generated QR PNGs are written to `public/uploads/`. On
  platforms with an ephemeral filesystem (e.g. Vercel), point `saveMediaFile`
  (`src/lib/media.ts`) and `generateQrPng` (`src/lib/qr.ts`) at S3 or another
  persistent object store instead — a self-hosted Node server (Docker, a VPS)
  works as-is.
- Set `AUTH_SECRET` to a real random string and `NEXT_PUBLIC_BASE_URL` to your
  production domain (used to build the QR target URL).

---

## What's implemented

### Admin flow
Login → Dashboard → Product Lifecycle → select product → view/manage
6-stage lifecycle → Generate QR → customize → generate → download / copy /
print → QR appears in QR History. All connected end-to-end.

### Database (Prisma / `prisma/schema.prisma`)
- `Admin` — login accounts (bcrypt-hashed passwords)
- `Product` — name, category, status, SKU
- `LifecycleStage` — one row per product per stage (`PREVIOUS_STAGE`,
  `CLEANING`, `SERVICE`, `PAINTING`, `TESTING`, `COMPLETE`), each with
  date/time/location/description; auto-created (empty) when a product is
  created, so the six stages always exist and are never mock data
- `Media` — images/videos belonging to a stage, stored as file URLs
  (`/uploads/media/...`), not base64 blobs
- `QRCode` — one row per **generated** QR (not overwritten on regenerate),
  with its own customization snapshot (title, instructions, footer, colors,
  size), public URL, PNG path, status (`ACTIVE`/`INACTIVE`), and who
  generated it

### Auth & security
- Custom JWT session in an httpOnly cookie (`src/lib/auth.ts`), bcrypt
  password hashing — no plaintext passwords anywhere
- `src/middleware.ts` enforces auth server-side on every `/admin/*` page and
  every `/api/admin/*` route (not just client-side route guards)
- The public page/API (`/p/[id]`, `/api/public/lifecycle/[id]`) deliberately
  expose **only** product + lifecycle + media fields — no admin fields, no
  tokens, no internals

### Admin UI
- `src/app/admin/(protected)/products/page.tsx` — searchable product list,
  inline "add product" form
- `src/app/admin/(protected)/products/[id]/lifecycle/page.tsx` — product
  header (name/ID/category/status left, ASAL logo right) + the vertical
  two-sided timeline (`src/components/admin/Timeline.tsx`) + Generate QR CTA
- `src/components/admin/StageCard.tsx` — per-stage edit form (date, time,
  location, description) + `MediaGallery.tsx` (multi-image/video upload,
  gallery grid, delete) — every save is a real API call, nothing lives only
  in React state
- `src/app/admin/(protected)/products/[id]/lifecycle/qr/page.tsx` — QR
  customization (title, instructions, footer, size, margin, colors), live A4
  preview, Download PNG, Download PDF (jsPDF-composed A4 sheet), Print
  (browser print, A4 CSS in `globals.css`), Copy Link
- `src/app/admin/(protected)/qr-history/page.tsx` — every QR ever generated,
  with product/date/time/generated-by/status, and view/copy/download/print
  actions; multiple QRs per product are all kept (never overwritten)

### Public page
- `src/app/p/[productId]/page.tsx` — no auth, `force-dynamic` so it always
  reflects the current lifecycle data (the QR points at this URL, not a
  snapshot — edits after generating the QR show up immediately), proper
  "No lifecycle information added yet" empty states instead of Lorem Ipsum,
  responsive timeline for mobile scanning

### QR generation
- `src/lib/qr.ts` uses the `qrcode` package server-side, `errorCorrectionLevel: 'H'`
  for maximum scan reliability, saved as a real PNG file referenced by URL
  (not embedded as base64 in the DB)
- The decorative A4 sheet (logo, title, product info, instructions, ASAL
  footer) is composed *around* the QR image, never overlapping or reducing
  its scannable area

---

## Manual test checklist (maps to the acceptance test)

1. `npm run dev`, log in at `/admin/login`
2. `/admin` → Product Lifecycle → **+ Add Product**
3. Open the product's lifecycle, fill in all 6 stages with real dates/times/
   locations/descriptions, upload a few images/videos per stage → **Save**
   each stage
4. Refresh the page — confirm everything persisted (it's in SQLite, not
   local state)
5. Click **Generate QR**, customize, click **Generate QR** again
6. Download PNG / Download PDF / Print — all produce an A4-ready output
7. Copy the public link, open it in an incognito window — no login prompt,
   full timeline renders
8. Scan the downloaded/printed QR with a phone camera — it opens the same
   public URL
9. Go back to admin, edit a stage, refresh the public URL — updated content
   appears immediately (same QR, same URL, live data)
10. `/admin/qr-history` — the generated QR is listed with product, date,
    time, and working actions

---

## Known limitations / next steps

- No image/video thumbnail generation — videos render directly with native
  browser controls; for very large libraries you'd want a background
  transcode + poster-frame step
- No pagination on the products list or QR history table (fine for
  moderate catalog sizes; add `skip`/`take` to the Prisma queries if you
  scale up)
- Single admin role — no per-admin permissions/roles beyond "logged in or
  not"
- File storage is local disk (`public/uploads/`) — swap for S3 if you
  deploy somewhere with an ephemeral filesystem (see Deploying above)
- The "Print" action in QR History links back to that product's QR page
  rather than reprinting the exact historical customization snapshot;
  the data needed to do that (`customTitle`, `instructionText`, etc.) is
  already stored on each `QRCode` record if you want to wire up a
  dedicated `/admin/qr-history/[id]/print` page next
