# Project Analysis: Tarun Sri Sai

## Overview

This is a **pnpm monorepo** hosting a personal portfolio/blog website with GitHub statistics visualization. The project uses modern web technologies including Next.js 16, React 19, and serverless functions deployed on Vercel.

---

## Architecture

### High-Level Structure

```plaintext
tarun-sri-sai (pnpm monorepo)
├── apps/
│   └── web (Next.js 16 application - main website)
├── packages/
│   ├── function-cache (Utility library for caching)
│   └── github-term-svg (GitHub stats visualization)
├── db/ (Database migrations)
└── temp/ (Temporary files)
```

---

## Core Components

### 1. **Root Project** (`package.json`)

**Purpose**: Workspace orchestration and shared development tools

**Key Details**:

- Node version: `>= 20.20.2`
- Package manager: `pnpm@10.34.4`
- Type: ES Module (`"type": "module"`)
- License: ISC

**Root Scripts**:

- `dev` → Start development server
- `build` → Build the Next.js app
- `start` → Start production server
- `format` → Code formatting with Prettier
- `migrate` → Database migrations using libsql-migrate

**Dependencies**:

- `libsql-migrate`: Database migration tool
- `prettier`: Code formatter with JSON sorting plugin

---

### 2. **Main Application: apps/web** (Next.js 16)

**Purpose**: Personal website featuring a blog, portfolio, and GitHub statistics

#### Directory Structure

```plaintext
apps/web/
├── app/
│   ├── api/
│   │   └── github/
│   │       ├── commits-last-year/ (API route)
│   │       ├── top-languages/     (API route)
│   │       └── top-repos/         (API route)
│   ├── blog/
│   │   ├── page.jsx (Blog listing page)
│   │   └── [slug]/ (Dynamic blog post page)
│   │       └── page.module.css (Scoped styles)
│   ├── lib/
│   │   ├── db/
│   │   │   └── blog/ (Blog database layer)
│   │   ├── html/ (HTML utilities)
│   │   └── svg/ (SVG utilities)
│   ├── globals.css (Global styles)
│   ├── layout.jsx (Root layout)
│   └── page.jsx (Home page)
├── public/ (Static assets)
├── next.config.js
├── jsconfig.json
└── eslint.config.mjs
```

#### Key Features

**GitHub Statistics API Routes** (`/api/github/*`):

- Fetches and visualizes GitHub stats as SVG images
- Three endpoints:
  1. `commits-last-year` - Shows commit count over the past year
  2. `top-languages` - Displays most-used programming languages
  3. `top-repos` - Lists top repositories

**Blog System**:

- Database-backed blog with Turso (SQLite)
- Dynamic routing via `[slug]` parameter
- Blog history tracking in database
- Caching layer for database queries

**Database Layer** (`lib/db/blog/`):

- Uses `@libsql/client` to connect to Turso
- Implements caching for recent blogs using `function-cache`
- SQL queries for fetching blog content with versioning

#### Technology Stack

| Layer       | Technology                                |
| ----------- | ----------------------------------------- |
| Framework   | Next.js 16.2.9                            |
| UI          | React 19.2.4                              |
| Database    | Turso (SQLite) + @libsql/client           |
| DOM Parsing | JSDOM                                     |
| Date/Time   | Luxon                                     |
| Caching     | Redis (via @tarun-sri-sai/function-cache) |
| Linting     | ESLint 9 with Next.js config              |

#### Environment Variables (Required)

Based on the code, these are needed:

- `FUNC_CACHE_REDIS_URL` - Redis connection URL for function caching
- `BLOG_TURSO_DATABASE_URL` - Turso database URL
- `BLOG_TURSO_AUTH_TOKEN` - Turso authentication token

---

### 3. **Shared Packages**

#### A. **@tarun-sri-sai/function-cache**

**Purpose**: Generic function result caching with Redis backend

**Features**:

- Wraps async functions with automatic caching
- Redis-backed persistent cache using Keyv
- Compression (gzip) for stored values
- SHA-256 hash-based cache keys from function arguments
- 1-day default TTL (time-to-live)
- Custom TTL support

**Architecture**:

```javascript
const cached = (fn, { ttl } = {}) => {
  // Returns cached results if available
  // Falls back to function execution and caches result
  // Uses stable JSON stringification for consistent keys
}
```

**Dependencies**:

- `keyv` - Abstraction layer for key-value stores
- `@keyv/redis` - Redis adapter for Keyv
- `fast-json-stable-stringify` - Consistent JSON serialization
- `luxon` - Duration calculations
- `zlib` - Gzip compression

**Export**:

- `cached(fn, options)` - Default export

#### B. **@tarun-sri-sai/github-term-svg**

**Purpose**: Generate terminal-style SVG visualizations of GitHub statistics

**Features**:

- Creates animated terminal recordings as SVG
- Fetches GitHub user statistics (commits, languages, repos)
- Formats output as terminal commands and responses
- Uses svg-term for rendering

**Export Functions**:

- `exportCommitsLastYear()` - Terminal animation of yearly commits
- `exportTopLanguages(top)` - Language statistics as terminal output
- `exportTopRepositories()` - Repository list as terminal output

**Dependencies**:

- `express` - HTTP server (likely for rendering/serving)
- `svg-term` - Convert terminal recordings to SVG
- `@tarun-sri-sai/function-cache` - Caches GitHub API results
- `luxon` - Date/time utilities

---

### 4. **Database** (`db/web/`)

**Type**: Turso (SQLite-compatible)

**Structure**:

- Migrations folder: `migrations/`
- Initial migration: `20260704024616_init_schema.js` (July 4, 2026)

**Likely Tables** (based on blog queries):

- `blogs` - Blog post metadata (id, slug, created_at)
- `blog_history` - Blog post versions (blog_id, title, created_at)

---

## Data Flow

### GitHub Stats Visualization

```plaintext
User Request
    ↓
Next.js API Route (/api/github/*)
    ↓
github-term-svg package
    ↓
function-cache (Redis)
    ↓
GitHub API (if not cached)
    ↓
svg-term (renders as SVG)
    ↓
SVG response to browser
```

### Blog Post Retrieval

```plaintext
User Request
    ↓
Next.js Route Handler ([slug])
    ↓
lib/db/blog (getRecentBlogs)
    ↓
function-cache (Redis)
    ↓
Turso Database (if not cached)
    ↓
HTML/JSX rendering
    ↓
Blog page response
```

---

## Development Setup

### Prerequisites

- Node.js >= 20.20.2
- pnpm >= 10.34.4
- Redis instance (for caching)
- Turso database (for blog)

### Installation

```bash
pnpm install
```

### Running Development Server

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
pnpm start
```

### Code Formatting

```bash
pnpm format
```

### Database Migrations

```bash
pnpm migrate
```

---

## Key Design Patterns

### 1. **Workspace Monorepo**

- Centralized dependency management
- Code reuse across packages
- Shared development tools (Prettier, ESLint)

### 2. **Caching Strategy**

- Two-level caching:
  - Application-level: Function result caching with function-cache
  - Framework-level: Next.js automatic static/dynamic optimization
- Reduces API calls to GitHub and database

### 3. **Terminal-Style Visualization**

- Unique approach: GitHub stats rendered as animated terminal sessions
- ASCII-art style output embedded as SVG images
- Supports embedding in READMEs and documentation

### 4. **Serverless Architecture**

- Next.js API routes handle backend logic
- Deployed on Vercel (inferred from README deployment URL)
- Stateless functions with Redis for persistence

### 5. **Database Versioning**

- Blog post history tracking
- Multi-version support for content updates
- Latest version retrieved via window functions in SQL

---

## Configuration Files

| File                  | Purpose                           |
| --------------------- | --------------------------------- |
| `pnpm-workspace.yaml` | Defines monorepo structure        |
| `next.config.js`      | Next.js app configuration         |
| `jsconfig.json`       | JavaScript path aliases (web app) |
| `eslint.config.mjs`   | ESLint rules (web app)            |
| `libsqlrc.js`         | LibSQL client configuration       |

---

## Deployment

**Platform**: Vercel (inferred from README URLs)

**GitHub Integration**:

- API routes consume GitHub API
- Statistics embedded in README as images:
  - `https://tarun-sri-sai.vercel.app/api/github/commits-last-year`
  - `https://tarun-sri-sai.vercel.app/api/github/top-languages`
  - `https://tarun-sri-sai.vercel.app/api/github/top-repos`

---

## Summary

This is a well-structured **full-stack personal portfolio project** leveraging:

- **Modern web stack**: Next.js 16 + React 19
- **Smart caching**: Redis-backed function caching with compression
- **Creative visualizations**: Terminal-style SVG GitHub stats
- **Database persistence**: Turso for blog content with versioning
- **Monorepo benefits**: Shared packages for reusable functionality
- **Type safety**: ES Modules throughout with consistent module format

The project demonstrates best practices in:

- Monorepo organization with pnpm workspaces
- Performance optimization through multi-layer caching
- Creative API integrations (GitHub stats as visual SVGs)
- Database design with content versioning
