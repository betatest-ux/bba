# BBAlliance — Design Plan

A design record for the BBAlliance website (bballiance.org.uk): the palette, type system,
layout concept and signature element, and the reasoning behind them. Read this before
changing any visual code; the tokens here are the source of truth and are mirrored in
`src/app/(frontend)/globals.css` (CSS custom properties) and `src/design/tokens.ts`.

## 1. Who this is for

BBAlliance is a community charity rooted in **Blackburn with Darwen, Lancashire** — a
real, specific place: mill-town brick and sandstone, terraced streets climbing towards
moorland, one of the youngest and most diverse boroughs in England. The charity works
street-by-street locally and also supports projects nationally and internationally.

The design must read as **warm, civic and trustworthy** — a neighbour, not a brand.
We deliberately avoid: corporate-NGO gloss, the cream/serif/terracotta "AI startup"
look, black-with-acid-accent, and hairline-rule broadsheet minimalism. The look is
grounded, saturated and human, with real photography carrying the story.

## 2. Signature element — "the weave"

Blackburn was a weaving town — "the weaving capital of the world" at its height — and
*alliance* means strands brought together. The identity's one recurring device is the
**weave**: parallel bands that interlace, over-under, like warp and weft.

Where it appears (and nowhere else — restraint is the point):

- **Section divider** (`<WeaveDivider />`): a low, interlaced band pattern between major
  page sections, tinted by the active accent.
- **Hero underlay**: a large, quiet weave pattern behind the homepage hero media.
- **Appeal thermometer**: the progress bar's track uses the weave pattern; the fill is a
  solid accent band "threading through" it.
- **Detail accents**: card top-borders on hover, the announcement bar edge, blockquote
  markers — a single 3px "thread" that picks up the accent colour.

The weave is implemented as inline SVG (`src/components/Weave/`) so it inherits
`currentColor`, respects dark mode, and costs no image requests.

## 3. Palette

Drawn from the borough: brick terraces, moorland, indigo workwear, festival gold.
Six colours plus neutrals; every combination used for text is WCAG 2.2 AA checked
(the contrast maths lives in `src/design/contrast.ts` and is re-run at save time
whenever an admin picks an accent).

| Token          | Hex       | Name          | Role                                        |
| -------------- | --------- | ------------- | ------------------------------------------- |
| `--bb-loom`    | `#1F3A5F` | Loom Indigo   | Primary brand; headings, primary buttons    |
| `--bb-brick`   | `#9E3B32` | Mill Brick    | Default accent; CTAs, links, thread details |
| `--bb-moor`    | `#3D6B50` | Moor Green    | Secondary accent option; success states     |
| `--bb-gold`    | `#D98E32` | Festival Gold | Decorative highlights, stat numerals on dark; never body text on light |
| `--bb-cotton`  | `#F6F2EA` | Cotton        | Light surface / page background             |
| `--bb-soot`    | `#191E24` | Soot          | Dark surface / body text on light           |

Supporting neutrals: `--bb-cotton-2 #ECE6D9` (raised light surface), `--bb-soot-2
#232A33` (raised dark surface), plus a 5-step warm grey ramp for borders/muted text.

**Admin accent options** (Appearance global) are exactly: Mill Brick, Loom Indigo,
Moor Green — each ships as a pre-computed trio (`accent`, `on-accent`, `accent-soft`)
validated ≥ 4.5:1 against both Cotton and Soot surfaces. Festival Gold is *not* an
accent option (3.05:1 on Cotton) — it stays a decorative colour. The Appearance panel
re-validates contrast on save and refuses silently-failing combinations; this is why
admins get a curated set, not a free colour wheel (documented in ADMIN-GUIDE.md).

Dark mode: same hues, lifted for contrast on Soot — `brick → #D26A5F`, `loom →
#7FA3D1`, `moor → #7FB394`, `gold → #E3A85C`. Body text `#E8E4DC` on `#191E24` (12.9:1).

## 4. Typography

Self-hosted via `next/font/google` (downloaded and served first-party at build time;
no runtime Google requests). Both faces are SIL Open Font Licence.

- **Display — Bricolage Grotesque** (variable, 200–800). A warm, characterful grotesque
  with just enough quirk to feel hand-made and civic rather than corporate. Used for
  h1–h3, stat numerals, nav wordmark. Tight tracking (-0.02em), weights 600–800.
- **Body — Figtree** (variable, 300–900 + italic). Friendly geometric sans, excellent
  legibility at 16–18px. Weights 400/500/600 in practice.

Scale (fluid, `clamp()`-based): `display 40→72px`, `h1 36→56`, `h2 28→40`, `h3 22→28`,
`body 16→18`, `small 14`. Line-heights: display 1.05, headings 1.15, body 1.6.

Admins deliberately get **no font or size controls** — the type system is load-bearing
for accessibility and identity (see ADMIN-GUIDE.md, "Why can't I change the font?").

## 5. Layout concept

- **Grid**: 12-col, max-width 1280px (`--bb-container`), 24px gutters mobile / 40px desktop.
- **Rhythm**: sections breathe — 64px mobile / 112px desktop vertical padding; the
  WeaveDivider replaces heavy borders between alternating Cotton / Cotton-2 sections.
- **Cards**: 16px radius, 1px warm-grey border, flat by default; on hover they lift
  2px with a soft shadow and show the 3px accent thread on the top edge.
- **Buttons**: pill-radius (999px), solid accent primary, outlined secondary; 44px min
  touch target; focus ring is a 3px offset outline in the accent.
- **Photography-first**: heroes and project cards lead with images (16:9 and 4:3),
  focal-point cropped from the CMS. Placeholder art uses weave-patterned tint blocks,
  sized exactly as the real photos will be.
- **Dark mode**: full support, class-driven (`data-theme`), user-toggleable, honouring
  `prefers-color-scheme`; can be disabled site-wide from Appearance.

## 6. Motion

Motion says "alive and cared-for", never "look at me". Framer Motion throughout, with
a global `useReducedMotion` gate that collapses everything to opacity-only (or nothing).

- Durations 150–450ms; easing `cubic-bezier(0.22, 1, 0.36, 1)` ("confident settle").
- Scroll reveals: 12px rise + fade, 60ms stagger within a group, trigger once at 20% visibility.
- Stat count-ups: 900ms, once, `tabular-nums` to avoid layout shift.
- Appeal thermometer: width animates to value on first view; weave track static.
- Header condenses (88px → 64px) after 80px scroll; mobile menu staggers items 40ms.
- Activities grid: FLIP layout animations on filter (Framer `layout` prop).

## 7. Voice

Plain English, first person plural, Lancashire-warm ("Everyone's welcome. Bring the
kids."). Sentence case everywhere including buttons. No NGO jargon — "we run a food
pantry", not "we deliver food-security interventions".
