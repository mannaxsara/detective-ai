# UI/UX Design System: DetectiveAI — "Ink"

This document outlines the **Ink design system** used across the DetectiveAI platform. It defines the color palette, typography, component specifications, and responsive layout rules. Source of truth: `frontend/src/app/globals.css` (Tailwind v4 `@theme` + CSS variables).

> **Note:** This system replaces the original "Sand & Charcoal" system. Design tokens such as `text-ink`, `bg-paper`, `bg-canvas`, and `text-ember` are **obsolete** — do not use them.

---

## 1. Concept & Visual Identity

* **Concept:** Brutalist Diagnostics. High-contrast ink-on-paper canvases, thin 1px borders, hard offset shadows, monospaced metadata readouts, and uppercase micro-labels.
* **Personality:** Forensic, editorial, high-trust. Flat surfaces with crisp edges — no heavy blur or gradient decoration.

---

## 2. Typography

* **UI & Body Copy:** `ABCArizonaSans` (fallback: `Inter`, system sans). Set globally on `html, body, button, input, textarea, select`.
* **Display Headlines:** `ABCArizonaFlare` (fallback: `Fraunces`, serif). Applied via `h1, h2, h3, .font-serif-display`.
* **Heavy Display:** `ABCCameraHeavy` (fallback: `Druk`) with `line-height: 0.74` for oversized marketing numerals — `.font-display-heavy`.
* **Numbers & Status Readouts:** system monospace (`font-mono`, JetBrains Mono) for health scores, table metrics, breadcrumbs, and terminal-style log feeds.

### Type Scale (`@theme` tokens)

| Token | Size | Usage |
| :--- | :--- | :--- |
| `text-caption` | 11px | Micro-labels, breadcrumbs, metadata |
| `text-body` | 15px | Default body copy |
| `text-body-lg` | 18px | Lead paragraphs |
| `text-subheading` | 20px | Section titles |
| `text-heading-sm` | 28px | Card / panel headings |
| `text-heading` | 57px | Page hero headings |
| `text-display` | 68px | Landing display type |

---

## 3. Color Palette

### Core tokens (light mode `:root` / dark mode `.dark`)

| Token | Light | Dark | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `#f9f9f7` (paper) | `#11120d` (near-black) | Canvas |
| **Foreground / Ink** | `#000000` | `#f9f9f7` | Primary text |
| **Card** | `#f9f9f7` | `#1c1d18` | Panels, cards, modals |
| **Muted surface** | `#edf0e9` | `#262720` | Hover fills, secondary chips |
| **Muted foreground** | `#555555` | `#a09e93` | Secondary copy, metadata |
| **Primary (CTA)** | `#000000` | `#edfe5e` (lime) | Buttons, active states |
| **Accent** | `#edfe5e` | `#edfe5e` | Highlights, key markers |
| **Border / Input** | `#000000` | `#3b3a33` | 1px hairlines |
| **Destructive** | `#bc3e3e` | `#bc3e3e` | Errors, alerts |
| **Success** | `#31e992` | `#31e992` | Health indicators, clean state |

### Named palette (available as Tailwind utilities)

`manuscript-cream` `#f9f9f7` · `press-black` `#000000` · `sage-border` `#d2ddd2` · `mist-green` `#dee5dd` · `paper-shadow` `#edf0e9` · `smoke` `#c7c7c6` · `highlighter-lime` `#edfe5e` · `cornflower-wash` `#bed4fb` · `spring-green` `#31e992`

### Chart palette (`chart-1` … `chart-5`)

Light: `#000000`, `#edfe5e`, `#bed4fb`, `#31e992`, `#bc3e3e`
Dark: `#edfe5e`, `#31e992`, `#bed4fb`, `#d8cfbc`, `#bc3e3e`

---

## 4. Shape, Elevation & Interaction

* **Border radius:** inputs & primary buttons `3px` (`rounded-sm`); nested cards `6px`; standard panels `12px`; large panels/cards `18px` (inline `rounded-[18px]`); hero/dialogs up to `24px`.
* **Elevation:** hard offset shadow `shadow-[4px_4px_0px_#000000]` for raised/interactive cards; soft `shadow-sm` (`rgba(0,0,0,.2) 0 2px 6px 0`) for subtle depth in dark contexts.
* **Borders:** thin 1px solid hairlines (`border-black dark:border-[#3b3a33]`) instead of heavy box-shadows.
* **Focus rings:** `ring` token — black in light mode, lime (`#edfe5e`) in dark mode.

---

## 5. Component Specifications

### A. Sidebar / Command Center
* Fixed `240px` (`w-60`), collapsing to `56px` icon rail on tablet/mobile.
* Right-hand 1px hairline border separating it from the main view.
* Active item: left 2px accent bar with `bg-muted` surface highlight.

### B. Header / Command Bar
* Height locked to `48px` (`h-12`).
* Monospaced breadcrumb route indicators (e.g. `CASE_ID / PROFILE`) at `11px` in muted foreground.
* Sun/Moon theme toggle with circle-reveal animation (Framer Motion).

### C. Case Details Header Card
* `bg-card` wrapper with 1px hairline border.
* Grid layout: dataset metadata (type badge, size, row/column counts) on the left; vertical health-score bar and export actions on the right.

### D. Tab Control Panels
* Flat text tabs separated by bottom hairlines.
* Active tab: overlapping border-highlight indicator shifting with zero motion delay to preserve monospaced alignment.

### E. KPI Metric Cards
* Label in 11px uppercase `tracking-widest` muted type; value in bold display numeral (`font-mono` for health scores).

---

## 6. Responsive & Grid Rules

* **Container bounds:** centered, `max-w-7xl` (`1280px`).
* **KPI matrix:** 1 column (mobile) → 3 (tablet) → 5 (desktop).
* **Tabular feeds:** `overflow-x-auto` with hidden scrollbars for clean mobile rendering.
* **Landing typography:** `text-display` scales down through `text-heading` on smaller breakpoints.

---

## 7. Implementation Conventions

* Converted pages use **explicit arbitrary-value classes** (e.g. `bg-[#f9f9f7] dark:bg-[#1c1d18]`, `text-[#555555] dark:text-[#a09e93]`, `border-black dark:border-[#3b3a33]`, `bg-black dark:bg-[#edfe5e]`).
* `components/ui/*` primitives (Button, Card, etc.) map through CSS variables (`bg-card`, `text-muted-foreground`, `border-border`, …) — keep them on the var tokens; only page-level code uses inline hex values.
* Dark mode is class-based: `dark:` variants with the `.dark` class on `<html>` (managed by `next-themes`).
