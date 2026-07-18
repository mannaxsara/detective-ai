# UI/UX Design System: DetectiveAI

This document outlines the **Sand & Charcoal design system** used across the DetectiveAI platform. It defines styling variables, responsive layout properties, typography parameters, and visual principles.

---

## 1. Typography & Visual Identity
* **Concept:** Brutalist Diagnostics. Clean boundaries, monospaced metadata status logs, and elegant tabular structures.
* **Fonts:**
  * **Headers & UI Copy:** System sans-serif (`font-sans` standard) prioritizing Outfit, Inter, or Roboto.
  * **Numbers & Indicators:** System monospace (`font-mono`) for table metrics, health scores, and terminal log feeds.
* **Borders & Corners:**
  * Thin, solid borders instead of heavy box-shadows.
  * Corner border-radii locked to `rounded-cards` (`10px` for panels) and `rounded-small` (`3px` for input elements and primary action buttons).

---

## 2. Color Palette
The color palette represents a premium, warm Sand & Charcoal minimalist style.

| Token | CSS Class | Color Code (Hex) | Purpose / Context |
| :--- | :--- | :--- | :--- |
| **Ink** | `text-ink` / `bg-ink` | `#1D1A18` | Darkest charcoal. Main text color in Light Mode, default background in Dark Mode. |
| **Mid Gray** | `text-mid-gray` | `#8A8380` | Muted slate/sand. Used for subtitles, labels, and secondary indicators. |
| **Paper** | `text-paper` / `bg-paper` | `#F5F5F5` | Off-white canvas. Main background in Light Mode, main text in Dark Mode. |
| **Canvas** | `bg-canvas` | `#FFFFFF` | Writable surface cards. Adaptive to Dark/Light states. |
| **Ember** | `text-ember` / `bg-ember` | `#EE6018` | Accent orange. Used for alerts, warnings, and high-priority action states. |
| **Green Highlight** | `text-emerald-400` | `#10B981` | Success indicator. Applied to clean data, solved flags, and complete status states. |

---

## 3. UI Component Specifications

### A. Sidebar / Command Center
* **Width:** Fixed `240px` (w-60), collapsing to `56px` on tablet/mobile views.
* **Border:** Right-hand border, 1px solid `border-hairline` (separating sidebar from main view).
* **Navigation active indicator:** Left border (2px) in `text-ink` combined with `bg-canvas/50` surface highlights.

### B. Header / Command Bar
* **Height:** Locked to `48px` (h-12).
* **Breadcrumb:** Monospaced route indicators (e.g. `CASE_ID / PROFILE`) in font size `11px` (`text-mid-gray`).
* **Interactive Elements:** Sun/Moon toggle (ThemeToggleButton) rendering dynamic circle reveals.

### C. Case Details Header Card
* **Aesthetics:** `bg-card` wrapper with a 1px border.
* **Layout:** Grid flex-row displaying dataset metadata (type badge, size, row count, column count) on the left and a vertical health score bar + **Export Cleaned Data** button on the far right.

### D. Tab Control Panels
* **Navigation:** Flat text tabs separated by bottom borders.
* **Transition:** The active tab is indicated by an overlapping border highlight, shifting with zero motion delay to preserve monospaced alignment.

---

## 4. Responsive & Grid Rules
* **Container Bounds:** Centered max-width set to `1280px` (`max-w-7xl`).
* **KPI Matrix:** Scales from 1 column on mobile to 3 columns on tablet and 5 columns on desktop grid screens.
* **Tabular Feeds:** Scroll properties set to `overflow-x-auto` with hidden scroll bars for a clean mobile screen appearance.
