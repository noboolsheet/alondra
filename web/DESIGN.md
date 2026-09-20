---
name: Alondra Music Academy
description: Premium private, at-home music lessons for children across Miami-Dade & Broward — warm, credible, refined.
colors:
  night-purple: "#150A1E"
  concert-purple: "#260B38"
  velvet-purple: "#4A2060"
  golden-note: "#FFB236"
  warm-glow: "#FFE7C2"
  lavender-light: "#FCF9FF"
  pure-white: "#FFFFFF"
  secondary-lavender: "#F4EEF6"
  muted-lavender: "#F1EDF3"
  muted-plum: "#6B5775"
  lavender-line: "#E8DEED"
  alert-red: "#E23636"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  accent:
    fontFamily: "Fraunces, Georgia, serif"
    fontStyle: "italic"
    fontSize: "clamp(2.25rem, 5vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.28em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  hero: "32px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-cta:
    backgroundColor: "{colors.golden-note}"
    textColor: "{colors.concert-purple}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
    typography: "{typography.label}"
  button-cta-hover:
    backgroundColor: "{colors.golden-note}"
    textColor: "{colors.concert-purple}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-outline:
    backgroundColor: "{colors.lavender-light}"
    textColor: "{colors.concert-purple}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-outline-hover:
    backgroundColor: "{colors.concert-purple}"
    textColor: "{colors.lavender-light}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  card:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.concert-purple}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.concert-purple}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
  eyebrow:
    backgroundColor: "{colors.lavender-light}"
    textColor: "{colors.golden-note}"
    typography: "{typography.label}"
---

# Design System: Alondra Music Academy

## 1. Overview

**Creative North Star: "The Golden Note"**

Alondra is a calm, premium field of deep concert purple, lit by a single golden note — the warm-amber accent that carries every moment of delight, every call to action, every spark of a child discovering music. Purple is the room: serious, hushed, credible, the color of a recital hall and of trust. **The site ships dark-first** — the deep-purple field (`night-purple #150A1E`, `--background` in `.dark`) is the default surface on first visit; the lavender-white field is the light-theme alternate. Both themes are first-class and must hold WCAG AA. Yellow is the note that lands inside it: rare, warm, joyful. The whole system runs on that contrast — a disciplined, refined stage on which one warm color is allowed to sing. The playfulness is never in the decoration; it is in that one golden voice against the quiet.

This is a brand where **design IS the product**. A parent deciding where to send their child forms their judgment of Alondra from this surface before they ever meet a teacher, so the craft has to *be* the reassurance. Warmth is earned through generous space, soft lavender light, tender imagery of children and music, and gentle motion — never through cartoons, crayon scribbles, or primary-color "kids' site" clichés. Credibility is earned through specificity: verified faculty badges, real families, concrete methods, actual coverage. The hero accent, set in Fraunces italic, is the single note of expressive flourish; everywhere else the Fraunces display face (roman) and rounded Nunito body carry a composed, adult confidence.

The system **explicitly rejects**: the childish-daycare register (mascots, scribbles, rainbow blocks), cheap/discount energy (coupon clutter, loud promos), generic edu-tech/SaaS templates (cold gradients, stock hero-metric grids), and corporate-conservatory stiffness. Alondra is for children but sold to discerning parents — the craft signals premium, the warmth signals care.

**Key Characteristics:**
- Deep concert-purple foundation lit by a single warm golden accent (≤15% of any screen)
- **Dark-first**: the shipped default is the deep-purple field (`night-purple #150A1E`); the light theme swaps in a lavender-white base (`#FCF9FF`) — never a warm cream/sand; both tints lean purple, the brand's own hue
- Serif display (Fraunces, with its italic used for accents) + rounded humanist sans (Nunito)
- Soft, reassuring components: pill CTAs, generous radii, gentle ambient shadow, tender hover lift
- Trilingual (en/es/fr) parity is structural — layouts must hold at every language's word lengths
- Motion is warm and calm; every animation has a reduced-motion alternative

## 2. Colors

A deep-purple stage lit by one golden note, on a lavender-white base — committed contrast, not a timid neutral palette.

### Primary
- **Concert Purple** (`#260B38`): The foundation. All primary text, the header/footer fields, hero gradients, outline-button strokes. This is the "room" — serious, credible, the color of a recital hall. Also carried at partial opacity (`/70`, `/60`) for secondary text on light surfaces.
- **Velvet Purple** (`#4A2060`): A softer mid-purple (`--brand-purple-soft`) for gradient midpoints and lifted purple surfaces where pure `#260B38` would read too heavy.

### Secondary
- **Golden Note** (`#FFB236`): The signature. The single warm accent that carries delight and every primary CTA (`btn-cta`), badge highlights, the script flourish, focus rings, and the hero glow. Rare by design — its scarcity is what makes it sing.
- **Warm Glow** (`#FFE7C2`): A pale amber (`--brand-yellow-soft`) for soft accent washes and highlight backgrounds where the full Golden Note would overpower.

### Neutral
- **Night Purple** (`#150A1E`, `hsl(280 45% 8%)`): The **default** body background — the dark-theme deep-purple field shipped on first visit. Cards lift to `hsl(280 40% 12%)`, text is lavender-white. This is the primary surface most visitors see.
- **Lavender Light** (`#FCF9FF`): The **light-theme** body background. A near-white tinted toward the brand's *own* purple hue — deliberately NOT a warm cream/sand. The calm air the page breathes when a visitor toggles to light.
- **Pure White** (`#FFFFFF`): Card and popover surfaces in light theme, floating badges — a clean lift off the lavender base.
- **Secondary Lavender** (`#F4EEF6`) / **Muted Lavender** (`#F1EDF3`): Quiet fill surfaces, chip backgrounds, section alternation.
- **Muted Plum** (`#6B5775`): The muted-foreground. Use with care — see the Contrast Floor Rule.
- **Lavender Line** (`#E8DEED`): Borders, dividers, input strokes — a soft purple-tinted hairline, never gray.

### Tertiary (functional)
- **Alert Red** (`#E23636`): Destructive/error states only. Never decorative.

### Named Rules
**The One Golden Note Rule.** The Golden Note (`#FFB236`) appears on ≤15% of any given screen. It is the color of the CTA and the moment of delight — its rarity is the entire point. Flooding a section with yellow kills the signal. When in doubt, purple carries the surface and the note lands once.

**The No-Cream Rule.** The default surface is night-purple (`#150A1E`); the light-theme base is lavender-white (`#FCF9FF`), tinted toward the brand's purple. Never drift either background toward warm cream, sand, beige, or ivory. Warmth is carried by the Golden Note and by imagery — never by a warm-tinted background.

**The Dark-First Parity Rule.** Dark is the shipped default (`index.html` boots `class="dark"`; `ThemeContext` defaults to dark). The light lavender theme is one toggle away, so it is never a second-class citizen: every surface, contrast ratio, and component state must hold in **both** themes. Design and test the dark field first, then verify light.

**The Contrast Floor Rule.** In light theme, Muted Plum (`#6B5775`) and Concert Purple at `/60` on Lavender Light sit at or below the 4.5:1 AA floor. For anything smaller than 18px or that must be reliably readable, use Concert Purple at `/70` opacity or darker — never lighten body text "for elegance." Placeholder and helper text still owe the reader 4.5:1 in both themes.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** Nunito (with system-ui, sans-serif fallback)
**Accent:** Fraunces italic — reserved for signature flourishes (e.g. the hero accent), not general-purpose

**Character:** A high-contrast pairing: Fraunces brings composed, editorial gravitas (the credibility), while Nunito's rounded humanist terminals bring warmth and approachability (the care). Fraunces italic supplies the expressive flourish — used sparingly, as an accent, never as a workhorse. The pairing contrasts on a real axis (serif display + rounded sans), which is why it reads as designed rather than generic. *Note: Fraunces is a deliberate brand choice (echoing a nostalgic display serif the owner liked), not a greenfield reflex — identity is now committed to it.*

### Hierarchy
- **Display** (Fraunces 600, `clamp(3rem, 6vw, 5rem)`, line-height 0.98, letter-spacing -0.02em): Hero and page-title headlines only. Ceiling is 5rem (80px) — the page designs, it doesn't shout. Uses `text-wrap: balance`.
- **Accent** (Fraunces italic 600, `clamp(2.25rem, 5vw, 4.5rem)`): The signature flourish, rendered in Golden Note — e.g. "the joy of music" in the hero. One deliberate moment per surface, never repeated.
- **Headline** (Fraunces 600, `clamp(2rem, 4vw, 3rem)`, line-height 1.1, letter-spacing -0.015em): Section titles (h2).
- **Title** (Fraunces 600, ~1.5rem): Card titles, sub-section heads, hero stat values.
- **Body** (Nunito 400, 1.125rem base / 1rem small, line-height 1.625): All prose. Cap measure at 65–75ch (`max-w-xl` on the hero paragraph). Secondary body via Concert Purple `/70`.
- **Label** (Nunito 700, 0.6875rem / 11px, letter-spacing 0.28em, UPPERCASE): The `eyebrow` kicker and small tracked metadata (e.g. "Miami-Dade · Broward"), in Golden Note.

### Named Rules
**The One Flourish Rule.** The Fraunces italic accent appears once per surface, as a single deliberate flourish. It is a garnish, never a heading system. Stacking multiple italic accents on one page reads as a wedding invitation, not a music academy.

**The Display Ceiling Rule.** Display headings never exceed 5rem (80px) and letter-spacing never tightens past -0.02em. Cramped, touching letters read as amateur, not premium.

## 4. Elevation

A soft, low-elevation system. Surfaces rest nearly flat on the lavender base; shadows are diffuse, purple-tinted, and used to gently *lift* cards and to *glow* around the Golden Note — never to create hard, dark drop-shadows. Depth comes from tonal layering (lavender base → white card) as much as from shadow. All shadows are tinted with the brand purple (`#260B38`), never neutral black.

### Shadow Vocabulary
- **Soft** (`box-shadow: 0 4px 20px -6px hsl(280 66% 13% / 0.08)`): The default resting lift for cards and quiet surfaces. Barely-there.
- **Lift** (`box-shadow: 0 20px 40px -20px hsl(280 66% 13% / 0.25)`): Featured cards, the hero image, floating badges — a generous but soft elevation.
- **Glow** (`box-shadow: 0 0 40px hsl(37 100% 60% / 0.35)`): The Golden Note's signature. Applied on CTA hover — the button warms and radiates rather than casting a shadow.

### Named Rules
**The Purple-Tint Shadow Rule.** Every shadow tints toward Concert Purple, never neutral gray/black. A gray drop-shadow on this lavender field reads as a generic 2014 card and breaks the warmth.

**The Glow-Not-Drop Rule.** The Golden Note lifts by *glowing* (the Glow shadow), not by hard drop-shadow. Warmth radiates; it doesn't loom.

## 5. Components

Soft and reassuring is the governing feel: gentle radii, pill CTAs, diffuse purple shadow, a tender hover lift. Nothing sharp, nothing pillowy-overdone.

### Buttons
- **Shape:** Full pill (`border-radius: 9999px`). CTAs and outline buttons are always pills.
- **Primary CTA** (`btn-cta`): Golden Note background (`#FFB236`), Concert Purple text (`#260B38`), semibold, padding 14px 28px (`px-7 py-3.5`), letter-spacing wide. This is the trial-booking button — the gravitational center of every page.
- **Hover / Focus:** Golden glow (`shadow-glow`) blooms and the button lifts `-2px` (`-translate-y-0.5`); returns on active. 300ms ease.
- **Outline** (`btn-outline`): Transparent on lavender, 2px Concert Purple border, Concert Purple text. Hover fills with Concert Purple and flips text to lavender. Secondary actions ("Explore Programs").

### Cards / Containers
- **Corner Style:** 16px (`rounded-2xl`) for standard cards; 32px (`rounded-[2rem]`) reserved for the hero image only.
- **Background:** Pure White (`#FFFFFF`) lifting off the Lavender Light base.
- **Shadow Strategy:** Soft at rest, Lift for featured/floating elements (see Elevation). Purple-tinted always.
- **Border:** Optional 1px Lavender Line (`#E8DEED`). Never pair a 1px border with a wide soft drop-shadow on the same element — pick one.
- **Internal Padding:** 16–24px (`md`–`lg`).

### Inputs / Fields
- **Style:** Pure White fill, 1px Lavender Line stroke, 12px radius (`lg`), padding 10px 14px.
- **Focus:** Ring in Golden Note (`--ring`), 2px — the accent confirms interaction.
- **Error:** Alert Red (`#E23636`) border + message. Placeholder text must still meet 4.5:1 (Muted Plum or darker, never a pale gray).

### Navigation
- Header on Lavender Light with backdrop blur; nav links in Concert Purple, Golden Note on hover/active. Language switcher (en/es/fr) is a first-class control. The "Book a Trial" CTA lives in the header as a pill. Mobile collapses to a sheet/drawer.

### Signature: The Eyebrow Kicker
- The `eyebrow` (11px, 700, letter-spacing 0.28em, uppercase, Golden Note) is Alondra's one deliberate label system — often paired with a Sparkles icon in a bordered pill. It is a *named brand element used consistently*, not reflexive per-section scaffolding; keep it purposeful.

### Signature: The Floating Trust Badge
- A small Pure White card (`rounded-2xl`, Lift shadow, Lavender Line border) floating over the hero image — Golden Note icon chip + "Verified Faculty / 100% background checked". Turns the credibility claim into a visible artifact. This is Principle 2 ("show the proof") made physical.

## 6. Do's and Don'ts

### Do:
- **Do** keep the Golden Note (`#FFB236`) to ≤15% of any screen — it carries the CTA and the moments of delight, and its rarity is the point.
- **Do** keep the body background lavender-white (`#FCF9FF`), tinted toward the brand purple.
- **Do** tint every shadow toward Concert Purple (`#260B38`); use Soft at rest, Lift for featured, Glow for CTA hover.
- **Do** lead every page toward the "Book a Trial" pill CTA — it is the gravitational center.
- **Do** ship real, tender imagery of children and music (Principle 1); make trust visible with badges and verified-faculty artifacts (Principle 2).
- **Do** reserve the Fraunces italic accent for a single flourish per surface, in Golden Note.
- **Do** hold layouts at en/es/fr word lengths — test the longest language at every breakpoint.
- **Do** provide a `prefers-reduced-motion: reduce` alternative for every animation (crossfade or instant).

### Don't:
- **Don't** drift toward a **childish-daycare** look — no cartoon mascots, crayon scribbles, rainbow primary-color blocks, or hand-drawn "kids' site" decoration. The craft signals premium; the warmth signals care.
- **Don't** introduce **cheap/discount** energy — no coupon clutter, loud promo banners, or anything that undercuts the world-class, high-touch price point.
- **Don't** default to **generic edu-tech/SaaS** patterns: cold stock gradients, hero-metric templates, identical icon-card grids, or corporate-conservatory stiffness.
- **Don't** use a warm **cream/sand/beige/ivory** background. The base is lavender-white; warmth comes from the Golden Note and imagery, never a warm-tinted bg.
- **Don't** lighten body text "for elegance." Muted Plum (`#6B5775`) is already at the AA floor; go darker (Concert Purple `/70`+) for small or critical text. Placeholders owe 4.5:1.
- **Don't** pair a 1px border with a wide (≥16px) soft drop-shadow on the same card or button — pick one.
- **Don't** over-round: cards top out at 16px (32px is the hero image's exclusive privilege); pills are for tags and buttons only.
- **Don't** overuse the Fraunces italic accent or stack a tracked eyebrow on *every* section — one flourish, purposeful kickers.
- **Don't** cast neutral gray/black shadows — they read as a generic 2014 card on this lavender field.
