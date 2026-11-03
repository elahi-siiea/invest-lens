# Invest Lens design direction

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

Reading this as: an analysis tool for everyday investors, in a quiet editorial-fintech style.

## Identity
- A printed statement, not a dashboard. Large serif figures, hairline rules, generous margins.
- The app opens straight into the first tool. There is no marketing landing page.
- Wordmark is plain text until a logo is supplied.

## Palette (core: paper, ink; accent: copper)
- Paper `#f6f3ec` / ink `#14201b`. Dark mode: `#101814` / `#ece9e0`.
- One accent, copper `#9a4a1b` (dark `#e08a57`). Used for the primary action, focus ring and active tab only.
- Gain and loss colors appear only on figures, always with a sign or word.
- Chart series colors are data encoding, checked for 3:1 against the page. The benchmark is a dashed ink line.
- No gradients, no glass, no glow. Shadow only on the tooltip popover, to lift it above the page.

## Type
- Display: Fraunces, for headline figures and page titles. The serif gives numbers the weight of print.
- UI: Instrument Sans. Tabular figures everywhere so columns of numbers line up.
- Both ship through npm packages, so builds need no network.

## Shape and spacing
- Radius: 6px on controls, 10px on panels. Nothing is pill-shaped.
- Spacing scale is 4px based. Sections vary: a wide chart band, a narrow controls column, a full-width table.
- Tap targets are at least 44px.

## Motion
- Hover and focus transitions only, plus skeleton shimmer while data loads (it stops when data arrives).
- Reduced-motion users get no animation.
