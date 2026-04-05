## OpenBrain Project

This repository sets up an OpenBrain Next.js dashboard featuring robust local optimisitic UI loading states, and integrates with the Supermemory API.

### Current Features
- Add Thought Modal (Form) matching precise inline pill tags and `Cmd+Enter` workflows
- Inline loading state (optimistic injection) mapped directly to Supermemory status stages
- Failed UI state capturing ingestion breaks

### Getting Started

```bash
npm install
npm run dev
```

A minimalist second-brain application for storing, searching, and managing thoughts, links, and documents.

## Tech Stack
- **Framework:** Next.js 16.2.1 (App Router)
- **UI:** React 19, Tailwind CSS v4, Lucide Icons
- **Backend/Auth:** Supabase (Auth & Database)
- **Memory/Vector DB:** Supermemory SDK

## Core Features
1. **Thought Ingestion:** Instantly save URLs (articles, youtube videos, etc.) or textual notes. Supermemory automatically extracts content, summaries, and vector embeddings.
2. **Semantic & Syntax Search:** 
   - Powerful search functionality leveraging both semantic search and precise entity filters.
   - Use `>type` (e.g., `>youtube`) and `/tag` (e.g., `/react`) syntax directly in the search bar.
3. **Brain Sharing:** 
   - **Global Sharing (`GlobalShareModal.tsx`)**: Generates read-only access links for the entire brain or by specific #tag, triggered from the dashboard header.
   - **Node Access (`ThoughtShareModal.tsx`)**: Generates fully isolated single-thought URLs, triggered direct from thought cards.
4. **Minimalist Design:** "Swiss Execution" style design with highly functional, distraction-free monochrome UI grids, using Geist fonts.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables by creating `.env.local` containing:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPERMEMORY_API_KEY=...
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture Guidelines
Please refer to `Gemini.md` (for AI agents) and `Design.md` for strict design and structural constraints before contributing.

## 🏷️ Type Definitions Reference
If you are modifying how items are displayed by type, be aware that we exclusively use `youtube` (not video) and `twitter` (not tweet). Please keep this consistent when interacting with the API or adding icons.
