# Next.js 16 with Tailwind CSS v4, Mantine v8, and TypeScript

A modern, responsive web application built with the latest technologies.

## Tech Stack

- **Next.js 16** - React framework with App Router
- **Tailwind CSS v4** - Utility-first CSS framework
- **Mantine v8** - React components library
- **TypeScript** - Type-safe JavaScript

## Project Structure

This project uses a **feature-based folder structure** for better organization and maintainability:

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with Mantine provider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind
├── features/              # Feature-based modules
│   ├── hero/             # Hero section feature
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── features/         # Features showcase
│   │   └── components/
│   ├── stats/            # Statistics section
│   │   └── components/
│   └── contact/          # Contact form
│       ├── components/
│       └── services/
├── components/            # Shared components (if needed)
└── public/               # Static assets
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build for Production

```bash
npm run build
npm start
```

## Features

- ✅ Next.js 16 with App Router
- ✅ Tailwind CSS v4 configuration
- ✅ Mantine v8 UI components
- ✅ TypeScript for type safety
- ✅ Feature-based folder structure
- ✅ Fully responsive design
- ✅ Dark mode support (via Mantine)
- ✅ Modern UI with gradient backgrounds
- ✅ Contact form with validation

## Responsive Design

The application is fully responsive and uses:
- Mobile-first approach with Tailwind CSS
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Flexible grid layouts with Mantine's `SimpleGrid`
- Responsive typography and spacing

## GitHub Actions Workflow

This repository includes an automated PR analysis workflow that runs on every pull request:

- **CodeQL Security Analysis** - Scans for security vulnerabilities
- **SonarCloud Code Quality** - Analyzes code quality and maintainability
- **AI-Powered PR Review** - Provides intelligent code review using Cursor AI or OpenAI

### Two Workflow Options:

1. **Cursor AI Workflow** (`pr-analysis-cursor.yml`) - **Recommended if you have Cursor Pro**
   - Uses your existing Cursor subscription
   - No additional API costs
   - See [CURSOR_SETUP.md](CURSOR_SETUP.md) for setup

2. **OpenAI Workflow** (`pr-analysis.yml`)
   - Uses OpenAI API directly
   - Pay-per-use pricing
   - See [SETUP_WORKFLOW.md](SETUP_WORKFLOW.md) for setup

See [.github/workflows/README.md](.github/workflows/README.md) for detailed setup instructions.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Mantine Documentation](https://mantine.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

