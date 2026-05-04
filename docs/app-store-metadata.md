# App Store Connect metadata for patch

Copy-paste-ready text for each field. Adjust anything in [brackets] or rewrite if you want a different angle.

---

## App name (30 char max)

**`patch`** (5 chars) — try this first. Likely taken.

If taken, fall backs in order:
- **`patch — Local Pros`** (18 chars)
- **`patch: Bakersfield Pros`** (23 chars)
- **`patch Home Services`** (19 chars)
- **`Patch — Find a Pro`** (18 chars)

App Store Connect will reject the name if it's already in use; you'll see the error immediately when you create the app record.

---

## Subtitle (30 char max)

**`Find the right local pro`** (24 chars)

Alternatives:
- `Search smart. Get it fixed.` (27 chars)
- `Local pros, no spam calls` (25 chars)
- `Bakersfield home services` (25 chars)

---

## Promotional text (170 char max, can be updated without re-review)

```
Describe your home problem and get matched to vetted local Bakersfield contractors. Plumbing, HVAC, electrical, roofing, handyman and more. One tap to call.
```

(155 chars)

---

## Description (4000 char max)

```
Got a leaky faucet, broken AC, or a busted garage door? patch is the fastest way to find the right local Bakersfield contractor for any home problem.

Just describe what's wrong in your own words. Snap a photo if it helps. We figure out which trade you need and show you the top local pros, ranked by rating and reviews. One tap to call.

Why patch
- Search by problem, not by trade. Not sure if it's plumbing or roofing? Just describe what you see.
- One matched recommendation, not five spam calls. Your phone won't ring off the hook.
- Local only. Every contractor is a real Kern County business.
- Free to use. No account, no signup, no email harvesting.
- Snap a photo of the problem to get a sharper match.

Trades covered
- Plumbing
- HVAC and air conditioning
- Electrical
- Roofing
- Handyman
- Garage door
- Pest control
- Concrete

Built for Bakersfield, Oildale, Rosedale, Shafter, Delano, and surrounding Kern County.

For contractors
Want to be one of the pros we recommend? Visit patchapp.org/partners to learn about Featured listings.

Privacy
We don't sell your information. We don't require an account. Read our full privacy policy at patchapp.org/privacy.

Questions or feedback: scottwattenbarger@gmail.com
```

(1430 chars; well under 4000)

---

## Keywords (100 char max, comma separated, NO SPACES around commas)

```
bakersfield,plumber,hvac,electrician,roofing,handyman,contractor,home repair,kern county,local pros
```

(99 chars)

These target the search terms people actually type. Don't repeat your app name (Apple already indexes that).

---

## What's New (for the very first version)

Leave it as the default "Initial release" or write:

```
Welcome to patch. Search any home problem and get matched with trusted Bakersfield contractors.
```

---

## Support URL (required)

```
https://patchapp.org
```

You can later add a real `/support` page if you want, but the home page works for v1.

---

## Marketing URL (optional)

```
https://patchapp.org
```

---

## Privacy Policy URL (REQUIRED)

```
https://patchapp.org/privacy
```

---

## Category

- **Primary:** Lifestyle (best fit — most home services apps live here)
- **Secondary (optional):** Utilities

Other valid options if you don't like Lifestyle: Productivity, Reference. Avoid Business (heavy app review for that category).

---

## Age rating

Run through the App Store Connect questionnaire — answer **No** to everything. You'll get a **4+** rating. patch has no objectionable content.

---

## App Privacy Details ("Nutrition Label")

Apple asks a questionnaire about what data you collect. Honest answers for patch:

| Category | What to select |
|----------|---------------|
| Contact info — Name | Yes (collected via lead form, NOT linked to user, NOT for tracking) |
| Contact info — Phone | Yes (collected via lead form, NOT linked to user, NOT for tracking) |
| Contact info — Email | No (you don't ask for email) |
| User content — Photos | Yes (collected for AI matching, NOT linked to user, NOT for tracking) |
| User content — Other | Yes (the problem text) (NOT linked to user, NOT for tracking) |
| Identifiers — Device ID | No |
| Usage data | No |
| Diagnostics | No |

Key thing: select **NOT linked to user identity** for everything. patch has no accounts, so nothing IS linked to user identity.

---

## Pricing

**Free**. No in-app purchases (yet). Available in **United States** only initially (you can add more countries later).

---

## Build version + version

- **Version**: `1.0.0` (first submission)
- **Build**: Xcode auto-increments. Set in Xcode → App target → General → Version + Build number.

---

## After submission

Apple review usually takes 1-3 days for first submission, occasionally up to 7. They may reject for:
- Privacy details mismatch (most common — make sure questionnaire matches what the app actually does)
- "Just a webview wrapper" (we have native camera, should pass)
- Missing functionality (e.g. broken pages)

If rejected, the response tells you exactly what to fix. Iterate and resubmit; usually approved on second try within 24 hours.
