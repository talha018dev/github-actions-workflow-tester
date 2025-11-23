# Next.js + Mantine + Tailwind CSS Demo

A modern, responsive demo application built with:
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Mantine v7** - Comprehensive React component library
- **Tailwind CSS** - Utility-first CSS framework

## Project Structure

This project follows a **feature-based folder structure** for better organization and maintainability:

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Mantine provider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind
├── features/              # Feature-based modules
│   ├── hero/
│   │   ├── components/    # Hero-specific components
│   │   ├── hooks/        # Hero-specific hooks
│   │   └── utils/        # Hero-specific utilities
│   ├── stats/
│   │   └── components/    # Statistics components
│   ├── features/
│   │   └── components/    # Features showcase components
│   └── contact/
│       ├── components/    # Contact form components
│       └── services/      # Contact API services
├── components/            # Shared components (if needed)
├── hooks/                # Shared hooks (if needed)
└── utils/                # Shared utilities (if needed)
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- ✅ **Responsive Design** - Works seamlessly on all devices
- ✅ **Dark Mode Support** - Automatic dark mode based on system preferences
- ✅ **TypeScript** - Full type safety
- ✅ **Feature-Based Architecture** - Easy to find and maintain code
- ✅ **Modern UI Components** - Powered by Mantine
- ✅ **Utility-First Styling** - Tailwind CSS for rapid development

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Next.js 15.1.3** - React framework
- **React 18.3.1** - UI library
- **TypeScript 5.7.2** - Type safety
- **Mantine 7.15.0** - Component library
- **Tailwind CSS 3.4.17** - Styling
- **Tabler Icons** - Icon library

## Project Organization

Each feature module contains:
- `components/` - React components specific to that feature
- `hooks/` - Custom React hooks (if needed)
- `services/` - API calls and business logic (if needed)
- `utils/` - Utility functions (if needed)

This structure makes it easy to:
- Find code related to a specific feature
- Maintain and update features independently
- Scale the application as it grows
- Test features in isolation

## License

MIT
