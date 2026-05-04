# patch — Bakersfield home services directory

Describe a home problem, get matched with vetted local contractors, tap to call. Astro + Tailwind + Capacitor + Anthropic.

## Run locally (web)

```sh
cp .env.example .env   # paste your Anthropic key into .env
npm install
npm run dev            # http://localhost:4321
```

The site works without an API key (keyword fallback), but with one it uses Claude vision so a homeowner can attach a photo of the leaking pipe / cracked tile / dead outlet for smarter matching.

## Updating a contractor's rating

Each partner has `rating` (e.g. `4.9`) and `reviewCount` (e.g. `128`) fields in `src/data/partners.ts`. Copy these from the contractor's Google Business profile when you onboard them, and refresh occasionally. Individual reviews are not stored or shown; just the aggregate.

## Project layout

```
src/
├── data/
│   ├── trades.ts        # 5 trades + their common problems
│   └── partners.ts      # contractor data + overall rating + reviewCount
├── components/
│   ├── Logo.astro       # patch wordmark + icon
│   └── Stars.astro      # star rating component
├── layouts/Layout.astro # shared header/footer
├── pages/
│   ├── index.astro      # search + photo upload + result list
│   ├── partners.astro   # contractor signup
│   ├── trades/[trade].astro  # per-trade landing pages
│   ├── pros/[id].astro       # contractor profile
│   └── api/
│       ├── triage.ts    # POST: { problem, photos[] } → ranked partners
│       └── contact.ts   # POST: lead intake → .leads/leads.jsonl
```

## Where leads go

Right now: appended to `.leads/leads.jsonl` (gitignored) and printed to the server console.

Next step (not built): wire up Resend in `src/pages/api/contact.ts` to forward each lead to the matched partner's email + your own.

## Deploying the web (required before app builds)

Built for Node standalone (`@astrojs/node`). Pick one host:

- **Vercel** (recommended for free tier + instant deploys): swap adapter to `@astrojs/vercel`, push to a GitHub repo, connect repo in Vercel dashboard. Set `ANTHROPIC_API_KEY` in Vercel env vars.
- **Railway / Fly.io**: keep the existing Node adapter. Both have free starter tiers and one-command deploys.
- **Self-host**: `npm run build` then `node ./dist/server/entry.mjs`.

Once deployed, edit `capacitor.config.ts` and replace `PROD_URL` with your real domain.

## Building the app (iOS + Android)

The web app is wrapped with Capacitor. iOS and Android source folders are committed.

### Quick reference

```sh
# After any change to web code:
npm run build           # Astro build (used to copy assets to native projects)
npx cap sync            # Push web assets + plugins into ios/android folders

# Open native IDE:
npx cap open ios        # opens Xcode (Mac only)
npx cap open android    # opens Android Studio
```

### Local dev with the app pointing at your machine

To test the app while developing the web side, point Capacitor at your Mac/PC's LAN IP:

```sh
# In one terminal:
npm run dev -- --host   # Astro dev server, listens on 0.0.0.0

# In another terminal:
CAP_DEV_URL="http://192.168.1.42:4321" npx cap run ios       # or android
```

The app loads from your dev server with live reload.

### Production build for stores

1. Deploy the web (see "Deploying the web" above).
2. Edit `capacitor.config.ts`: replace `PROD_URL` with your deployed URL.
3. `npx cap sync`.
4. `npx cap open ios` (Mac) or `npx cap open android` → use Xcode / Android Studio to archive and upload.

## App Store + Play Store submission checklist

- [ ] Apple Developer Program enrollment ($99/year)
- [ ] Google Play Developer account ($25 once)
- [ ] App icons (1024x1024 master; Capacitor will generate sizes from it)
- [ ] At least 5 screenshots per device class (iPhone, iPad, Android phone, Android tablet)
- [ ] Privacy policy URL (legally required by both stores)
- [ ] App description, keywords, support URL
- [ ] Camera permission usage strings (already set in `ios/App/App/Info.plist`)

## To do before launch

- [ ] Replace placeholder partners in `src/data/partners.ts` with real signups
- [ ] Wire up email forwarding for leads (Resend in `src/pages/api/contact.ts`)
- [ ] Deploy the web to Vercel (or Railway/Fly)
- [ ] Update `PROD_URL` in `capacitor.config.ts`
- [ ] Generate app icons + splash screens (`@capacitor/assets` is the easy way)
- [ ] Write privacy policy + terms (a basic one is fine; both stores require a URL)
- [ ] Per-partner CallRail tracking numbers (so calls are attributable)
- [ ] Google Business profile + local SEO content per trade
