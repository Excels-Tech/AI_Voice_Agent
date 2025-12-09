# Project Setup Summary

## Project Type
This is a **React + TypeScript + Vite** web application for an AI Meeting Voice Agent Workflow.

## Dependencies Installed

### Production Dependencies (43 packages)
- **React Ecosystem**: react (^18.3.1), react-dom (^18.3.1)
- **UI Components (Radix UI)**:
  - accordion, alert-dialog, aspect-ratio, avatar, checkbox
  - collapsible, context-menu, dialog, dropdown-menu, hover-card
  - label, menubar, navigation-menu, popover, progress
  - radio-group, scroll-area, select, separator, slider
  - slot, switch, tabs, toggle, toggle-group, tooltip
- **Form Handling**: react-hook-form (^7.55.0)
- **Charts & Visualization**: recharts (^2.15.2)
- **Date Picker**: react-day-picker (^8.10.1)
- **Icons**: lucide-react (^0.487.0)
- **UI Utilities**:
  - class-variance-authority (^0.7.1)
  - clsx, tailwind-merge
  - cmdk (^1.1.1)
  - embla-carousel-react (^8.6.0)
  - input-otp (^1.4.2)
  - react-resizable-panels (^2.1.7)
  - sonner (toast notifications)
  - vaul (^1.1.2)

### Development Dependencies (6 packages)
- **TypeScript**: typescript (^5.6.0)
- **React Types**: @types/react (^18.3.0), @types/react-dom (^18.3.0)
- **Node Types**: @types/node (^20.10.0)
- **Build Tool**: vite (6.4.1)
- **React Plugin**: @vitejs/plugin-react-swc (^3.10.2)

## Configuration Files
- `frontend/tsconfig.json` - TypeScript configuration
- `frontend/tsconfig.node.json` - TypeScript configuration for Vite config
- `frontend/vite.config.ts` - Vite build/dev configuration (outDir `build`, dev port 3000)

## Project Structure
```
AI_Voice_Agent/
├── backend/                # FastAPI backend (serves static frontend build from backend/static/frontend)
├── frontend/               # New Vite frontend source
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/                # React components, styles, utilities
└── build.sh                # Helper to build frontend and copy into backend/static/frontend
```

## Running the Project

### Development Server (frontend)
```bash
cd frontend
npm install
npm run dev
```
- Server URL: http://localhost:3000 (configure in `frontend/vite.config.ts`)
- Features hot module replacement (HMR)

### Build for Production (served by backend)
```bash
cd frontend
npm run build
cd ..
rm -rf backend/static/frontend
mkdir -p backend/static/frontend
cp -r frontend/build/* backend/static/frontend/
```
Or run `./build.sh` from the repo root to build both backend deps and the frontend, then copy automatically.

## Notes

- **CSS Framework**: Uses pre-compiled Tailwind CSS v4.1.3 (no additional build step needed).
- **Port**: Development server runs on port 3000.
- **Security**: All security vulnerabilities fixed.
- **Module System**: ESNext modules with bundler resolution.
- **React Version**: 18.3.1 with modern concurrent features.

## Available Scripts (from `frontend/`)
- `npm run dev` - Start development server
- `npm run build` - Build for production (outputs to `frontend/build`)

## Features
Based on the component structure, this application includes:
- Dashboard & Analytics
- Agent Builder (Basic & Advanced)
- Real-time Monitoring
- Call Logs & Meeting Details
- Knowledge Base & Intelligent Q&A
- Integrations & API Documentation
- Billing & Settings
- White Label Settings
- Workflow Management
- Live Meeting Features
- Security & Notifications
- User Management

## Technology Stack
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.6.0
- **Build Tool**: Vite 6.4.1
- **Styling**: Tailwind CSS 4.1.3
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form

## Browser Support
Modern browsers with ES2020 support
