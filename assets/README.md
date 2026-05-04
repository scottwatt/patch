# App icon and splash screen sources

Drop two PNGs in this folder, then run `npm run gen-icons` to generate every size iOS and Android need.

## Required files

| File | Size | Notes |
|------|------|-------|
| `icon.png` | **1024 x 1024** | Square, opaque (no transparency), no rounded corners. iOS adds the rounded corners automatically. |
| `splash.png` | **2732 x 2732** | Square. The launch image. Logo centered with safe padding around it (top/bottom/sides cropped on smaller devices). |

Optional:

| File | Size | Notes |
|------|------|-------|
| `icon-foreground.png` | 1024 x 1024 | Android adaptive icon foreground (transparent background, logo only). |
| `icon-background.png` | 1024 x 1024 | Android adaptive icon background (solid color or simple pattern). |
| `splash-dark.png` | 2732 x 2732 | Splash for users in dark mode. |

If you skip the optional ones, `@capacitor/assets` falls back to `icon.png` and `splash.png` and does the right thing.

## Generating

```sh
npm run gen-icons
npx cap sync
```

The first command writes generated icon and splash images into `ios/App/App/Assets.xcassets/` and `android/app/src/main/res/`. The second copies them into the platform-ready locations.

After running, commit the generated changes:

```sh
git add ios android
git commit -m "Regenerate app icons and splash"
git push
```
