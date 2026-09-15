# SourceWise RAG — Frontend Foundation

This directory contains the Next.js frontend application for **SourceWise RAG** (Retrieve. Ground. Verify.).

## Frontend Purpose

The frontend serves as the enterprise user interface for SourceWise RAG. Its primary objective is to present an evidence-first knowledge experience where internal documentation and support resources can be searched, grounded, and verified with clear citation tracking.

In this initial foundation (PR 3), the application shell, visual identity, landing layout, and responsive UI components are established to prepare for subsequent feature integration.

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) (App Router, v14.2.15)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (v5.6)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v3.4) & PostCSS
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting & Code Quality**: [ESLint](https://eslint.org/) (`eslint-config-next`)

## Package Manager

- **Package Manager**: `npm`

## Getting Started

### 1. Install Dependencies

Navigate to the `frontend/` directory and install the dependencies:

```bash
cd frontend
npm install
```

### 2. Run the Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

### 3. Build for Production

To create an optimized production build:

```bash
npm run build
```

To start the production server after building:

```bash
npm run start
```

### 4. Run Linting Checks

Run ESLint to check for code quality and syntax issues:

```bash
npm run lint
```

## Expected Local URL

- Development Server: `http://localhost:3000`

## Current Implementation Limitations (PR 3)

This release establishes the clean, working application foundation. The following items are explicitly **out of scope** for PR 3 and will be introduced in future PRs:

- Real RAG API integration & retrieval pipeline communication
- Live interactive chat interface
- Document ingestion & Knowledge Base browsing
- Citation inspector details & verification drawers
- Authentication and session management
- State management libraries & external API clients
