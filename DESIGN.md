---
name: FrameHub
description: A calm photo gallery and album-management product for casual photo sharers.
colors:
  canvas: "#f6f1ea"
  surface: "#fffdf9"
  vellum: "#ebe2d7"
  mist: "#f4f7f4"
  ink: "#151a1e"
  ink-soft: "#364047"
  ink-muted: "#65717b"
  pine: "#1f6f63"
  pine-dark: "#174d45"
  pine-light: "#dcebe7"
  lagoon: "#2f6f88"
  lagoon-dark: "#1f5065"
  lagoon-light: "#dceaf0"
  marigold: "#d9942e"
  marigold-dark: "#a86717"
  marigold-light: "#f8e4ba"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.pine-dark}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  field:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  chip-filter:
    backgroundColor: "{colors.pine-light}"
    textColor: "{colors.pine}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
---

# Design System: FrameHub

## 1. Overview

**Creative North Star: "The Quiet Contact Sheet"**

FrameHub should feel like a focused, modern gallery table where the photographs carry the emotion and the interface keeps everything legible, calm, and personal. The system uses warm surfaces, restrained teal-green actions, gentle borders, and predictable product controls so casual photo sharers can browse, upload, search, comment, and manage albums without feeling pushed into a social-media loop.

The visual language rejects the Instagram clone, the generic social media feed, and the flashy portfolio template. It also rejects generic SaaS dashboard styling: FrameHub is a gallery-management product, not a metrics console. Components should be familiar, keyboard-friendly, and clear about privacy states.

**Key Characteristics:**

- Photo-first composition with quiet chrome and restrained controls.
- Warm gallery surfaces balanced by pine and lagoon accents.
- Serif display moments for brand identity; sans-serif UI text for product clarity.
- Rounded, consistent controls with visible focus states.
- Motion limited to state feedback, hover affordance, and reduced-motion-safe transitions.

### Editorial Home Exception

The public Home page may use a bolder editorial contact-sheet composition than the rest of the product: asymmetric image grids, stronger display typography, wider negative space, and fewer conventional cards. This exception should still preserve the core palette, accessible controls, clear auth-aware actions, readable privacy/search paths, and the rule that photographs remain the dominant visual material.

## 2. Colors

The palette is a calm gallery neutral system with pine as the main action color, lagoon as a secondary discovery accent, and marigold reserved for rare warmth and emphasis.

### Primary

- **Pine Action**: The primary product action color for upload buttons, selected pagination, active navigation, focusable intent, and high-confidence calls to action.
- **Deep Pine**: The hover and active state for primary actions, also used when text needs stronger contrast on pale pine surfaces.
- **Pale Pine**: The selected and active background tint for navigation and filter chips.

### Secondary

- **Lagoon Discovery**: A quieter blue-teal accent for exploration cues, icons, and non-primary emphasis.
- **Pale Lagoon**: A soft tint for secondary information surfaces when pine would overstate importance.

### Tertiary

- **Marigold Warmth**: A sparing accent for selection highlights, image-related warmth, or celebratory moments. It must not become a generic warning color.

### Neutral

- **Gallery Canvas**: The page background. It gives the app a personal gallery feel without turning into a decorative paper texture.
- **Porcelain Surface**: The primary card, header, and form surface.
- **Vellum Border**: The standard divider and border color.
- **Mist Layer**: A cool secondary layer for soft panel contrast.
- **Ink**: Primary text.
- **Soft Ink**: Secondary text and inactive controls.
- **Muted Ink**: Metadata, helper text, and tertiary labels. Check contrast before using it on tinted backgrounds.

### Named Rules

**The Photo Leads Rule.** Pine, lagoon, and marigold are supporting colors. If a screen feels more like the palette than the photos, reduce accent usage.

**The Privacy Is Not Color Rule.** Privacy states must use text labels and icons, not color alone.

## 3. Typography

**Display Font:** Playfair Display with Georgia fallback  
**Body Font:** Inter with system sans fallbacks  
**Label/Mono Font:** Inter with system sans fallbacks

**Character:** The pairing gives FrameHub a small editorial signature without compromising product clarity. Display type is for brand-level headings and photo titles; repeated UI labels, buttons, forms, navigation, and metadata stay in Inter.

### Hierarchy

- **Display** (700, 3rem to 3.75rem, 1.1): Home-page brand title and rare hero moments only.
- **Headline** (700, 1.875rem, 1.2): Page sections such as Recent photos or Why FrameHub.
- **Title** (700, 1.25rem, 1.3): Card titles, modal titles, and compact content headings.
- **Body** (400, 1rem, 1.6): Descriptions, explanatory copy, form helper text, and empty-state guidance. Keep longer prose around 65-75ch.
- **Label** (600, 0.875rem, 1.25): Buttons, navigation, chips, form labels, and metadata.

### Named Rules

**The UI Stays Sans Rule.** Never use Playfair Display for buttons, form labels, navigation, data, or repeated operational text.

## 4. Elevation

FrameHub uses a hybrid of soft borders, translucent surface layering, and two ambient shadows. Shadows should feel like quiet gallery depth, not raised dashboard widgets. Flat or bordered surfaces are the default; stronger elevation appears on photo cards, overlays, sticky header treatment, and hover states.

### Shadow Vocabulary

- **Soft Surface** (`0 14px 40px rgba(21, 26, 30, 0.08)`): Ambient depth for header-adjacent surfaces, buttons, and calm cards.
- **Gallery Hover** (`0 24px 70px rgba(21, 26, 30, 0.16)`): Stronger depth for image cards and viewer-like moments.

### Named Rules

**The Image Gets The Drama Rule.** Reserve stronger shadow and scale treatments for photos and viewer surfaces, not routine panels.

## 5. Components

### Buttons

- **Shape:** Gently curved rectangles (8px radius).
- **Primary:** Pine background with white text and medium padding (12px 20px). Use for upload, submit, create, and primary confirmation actions.
- **Hover / Focus:** Hover shifts to Deep Pine. Focus uses the shared visible ring with Pine and a canvas-colored offset.
- **Secondary / Ghost / Tertiary:** Use surface fills or light borders with Soft Ink text. They should feel subordinate without becoming low-contrast.

### Chips

- **Style:** Filter and status chips use rounded 8px containers, text labels, and icons where the state matters.
- **State:** Selected filters use Pale Pine with Pine text. Removable chips include an icon button with an accessible label.

### Cards / Containers

- **Corner Style:** 8px for operational cards and 12px for richer photo-forward cards.
- **Background:** Porcelain Surface for forms and panels; Ink-backed overlays only when text sits on photos.
- **Shadow Strategy:** Default to borders and low shadow; use Gallery Hover on photo cards.
- **Border:** Vellum or white transparency depending on surface.
- **Internal Padding:** 16px for compact controls, 20px for cards, 32px for empty states.

### Inputs / Fields

- **Style:** White fields with Vellum or slate-neutral borders, 8px corners, and 8px 12px internal padding.
- **Focus:** Use the shared Pine focus ring. The ring must be visible on keyboard focus.
- **Error / Disabled:** Errors need text plus color. Disabled controls reduce opacity and preserve readable labels.

### Navigation

Top navigation and sidebar navigation use Inter labels, lucide icons, 8px rounded active states, and consistent hover/focus treatment. Mobile navigation collapses into the existing menu control; the primary routes remain Home, Explore, My Gallery, and Albums.

### Photo Cards

Photo cards are the signature component. They use the photo as the main surface, a dark overlay for legibility, privacy badges with icon plus text, and compact engagement metadata. Hover motion may reveal details, but core title and state information must remain accessible on touch and keyboard.

## 6. Do's and Don'ts

### Do:

- **Do** let photos provide the strongest visual energy on gallery, explore, and detail screens.
- **Do** use Pine for primary actions and active states, Lagoon for secondary discovery cues, and Marigold sparingly.
- **Do** keep keyboard focus visible with the shared Pine ring on every interactive element.
- **Do** pair privacy labels with icons and readable text.
- **Do** respect `prefers-reduced-motion` and keep product transitions in the 150-250ms range when possible.

### Don't:

- **Don't** make FrameHub feel like an Instagram clone, a generic social media feed, or a flashy portfolio template.
- **Don't** use excessive gradients, oversized animations, cluttered cards, generic SaaS dashboard styling, or engagement-first dark patterns.
- **Don't** let decorative UI compete with the photographs.
- **Don't** rely on color alone for privacy states, errors, tags, or status indicators.
- **Don't** use Playfair Display for buttons, labels, data, or other repeated product UI.
