# Google Places API setup for hours and reviews

Patchly's pro detail pages can show **business hours** and **3 recent reviews** for each contractor, pulled live from Google. This doc walks through setting it up.

## What you get when you wire this up

- Hours card on each pro detail page (`Monday: 8 AM to 5 PM`, etc.)
- "Recent reviews" card with 3 reviews from Google Business Profile
- "Powered by Google" attribution (required by Google's terms)
- Auto-refreshed on every Vercel deploy
- Cost: typically $0/month (within Google's $200/month free tier)

## What you need to do

### 1. Create a Google Cloud account (if you don't have one)

- Go to https://console.cloud.google.com/
- Sign in with any Google account
- Accept the terms

### 2. Create a project

- Top bar → project dropdown → **New Project**
- Name: `patchly` (or anything)
- Click Create

### 3. Enable the Places API

- Top search bar → search **"Places API (New)"** → click the result
- Click **Enable**
- Wait ~30 seconds

### 4. Create an API key

- Left sidebar → **APIs & Services → Credentials**
- Click **+ Create Credentials → API key**
- Copy the key (starts with `AIza...`)

### 5. Add billing (required even for free tier)

- Left sidebar → **Billing**
- Add a credit card. Google won't charge anything unless you exceed $200/month — for Patchly's scale (~187 contractors, refreshed maybe weekly) you'll use ~$5/month worth of API calls and never get a bill.

### 6. Restrict the key (recommended, for security)

- **Credentials** → click your key
- Under **Application restrictions** → **HTTP referrers** → add `*.vercel.app/*`, `patchapp.org/*`, and `localhost/*`
- Under **API restrictions** → restrict to just **Places API (New)**
- Save

### 7. Add the key to your environments

**Local dev** (your `.env` file at repo root):
```
GOOGLE_PLACES_API_KEY=AIza...
```

**Vercel production**:
- Vercel dashboard → Patchly project → Settings → Environment Variables
- Add `GOOGLE_PLACES_API_KEY` with the same value
- Apply to: Production
- Redeploy (Vercel doesn't pick up new env vars automatically; trigger a new deploy)

### 8. Look up Google place IDs for your contractors

You have two paths.

**Bulk (recommended): one command looks up all 187 partners in ~30 seconds.**

```sh
npm run find-place-ids
```

The script reads every partner from `src/data/partners.ts`, queries Google Places "Text Search" with `<name> Bakersfield CA`, prefers a result that matches the partner's phone number (high confidence), falls back to the top result otherwise, and writes everything to `src/data/place-ids.json`. Re-runs are safe — it skips partners that already have a place ID.

Output legend:
- ✓ matched by phone (definitely correct)
- ~ first search result (worth eyeballing if the name is generic, e.g. "Sample Plumbing Co.")
- ✗ no match found (handful of these you'd manually look up)

After running, commit `src/data/place-ids.json`, push, and the next Vercel deploy populates hours and reviews on every contractor with a place ID.

Cost of the lookup itself: roughly $0.005 per call × 187 partners = under $1. Well inside Google's free tier.

**Manual (per contractor):** for the few that didn't get a match or that you want to override:

1. Go to https://developers.google.com/maps/documentation/places/web-service/place-id
2. Type the contractor name + "Bakersfield" in the search box
3. Click their pin on the map
4. Copy the place ID (starts with `ChIJ...`)
5. Either:
   - Add the entry to `src/data/place-ids.json` directly: `"p-plumb-1": "ChIJ..."`,
   - Or add `googlePlaceId: 'ChIJ...'` to that partner in `partners.ts`. The inline version always wins over the JSON file.

### 9. Push and deploy

Once you've added `googlePlaceId` to one or more partners and deployed:
- Visit that contractor's detail page on the live site
- Hours and reviews cards appear, sourced from Google
- "Powered by Google" attribution shows next to reviews

## Manual override

If you want to override what Google returns for a specific contractor (or fill in data for a contractor without a place ID), just set the fields manually in `partners.ts`:

```ts
{
  id: 'p-plumb-1',
  name: 'Bakersfield Plumbing Pros',
  // ... other fields ...
  hours: [
    'Monday: 8 AM to 5 PM',
    'Tuesday: 8 AM to 5 PM',
    'Wednesday: 8 AM to 5 PM',
    'Thursday: 8 AM to 5 PM',
    'Friday: 8 AM to 5 PM',
    'Saturday: Closed',
    'Sunday: Closed',
  ],
  reviews: [
    {
      author: 'Jennifer M.',
      rating: 5,
      date: '2026-04-12',
      text: 'Same day for a burst pipe. Fixed it under an hour, fair price.',
    },
  ],
},
```

Manual values **always win** over Google data.

## Cost reality

- Place Details (with hours + reviews via FieldMask): roughly **$5 per 1,000 requests**
- 187 contractors × deploys per month (say 20) = **3,740 requests/month** = **~$18.70/month**
- Google credit: **$200/month free**
- Net cost: **$0**

Even if you push 100x as often, you're still inside the free tier.

## What happens if the API key is missing or invalid

The build doesn't fail. The fetch call returns nothing, the detail page just doesn't show Hours and Recent Reviews cards. Everything else works normally.
