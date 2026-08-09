# DetectiveAI — Frontend

Next.js 16 (App Router + Turbopack) frontend for the DetectiveAI autonomous data intelligence platform. Built with React 19, TypeScript, TanStack Query, Zustand, and the custom **Ink Design System** on TailwindCSS v4.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The FastAPI backend must be running on port 8000 (see the [root README](../README.md)).

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Production build (type-check + static generation) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Environment Variables (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional — Google Sign-In (Firebase Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## App Structure

```text
src/
├── app/
│   ├── (auth)/      # login, register, forgot-password
│   ├── (dashboard)/ # dashboard, upload, history, analysis/[id], profile, settings
│   ├── blog/        # Blog landing
│   ├── pricing/     # Interactive pricing studio
│   └── page.tsx     # Marketing landing
├── components/
│   ├── analysis/    # 12 analysis tab modules
│   ├── reports/     # Executive report generator
│   ├── layout/      # Dashboard shell (sidebar, header)
│   ├── ui/          # Base primitives + forensic charts (ECharts)
│   └── animate-ui/  # Motion & micro-interaction components
├── hooks/           # Theme-aware ECharts hook, UI listeners
├── lib/             # Axios API client, Firebase init, utils
├── store/           # Zustand stores (auth, analysis)
└── types/           # Shared TypeScript contracts
```

## Design System

The UI uses the **Ink Design System** — hard offset shadows, 18px-radius panels, monospace status readouts, and an `#edfe5e` acid accent on near-black/paper canvases. Design tokens and component specs live in [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) at the repository root.

## Key Dependencies

- **Routing/Data:** `next` (App Router), `@tanstack/react-query`, `axios`
- **State:** `zustand`
- **Styling:** `tailwindcss` v4, `tw-animate-css`, `class-variance-authority`, `tailwind-merge`
- **Charts:** `echarts` + custom theme-aware wrapper hook
- **Motion:** `framer-motion` / `motion`
- **UI:** `@base-ui/react`, `lucide-react`, `sonner`, `react-dropzone`, `next-themes`
- **Auth:** `firebase` (email/password + Google popup), `jwt-decode`
