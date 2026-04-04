# OpenBrain Agent Context & Rules
*This document contains context for AI coding agents to reference when working on the project.*

## 📌 Project Overview
- **Name:** OpenBrain
- **Description:** A minimalist second-brain app.
- **Key Technologies:** Next.js 16.2.1 (App Router), React 19, Supabase, Supermemory, Tailwind CSS v4.
- **Design System:** "Swiss Execution" PRD. Strict Grids, high contrast monochrome hierarchy, minimal typography (Geist / Geist Mono), sharp corners (max 2px radius), 1px borders, #10B981 (Emerald) for validation, #6366F1 (Indigo) for actions.

### Design & Architecture Decisions
- **Authentication**: Using Email/Username input locally tracked as `email`, but submitted to the backend as `identifier` for Supabase lookup functionality.
- **Auth Redirects**: Specifically relying on the native server-side `redirect()` from Next.js server actions rather than client-side `useRouter()` router.push to reduce unnecessary client renders.
- **Third-party Auth**: OAuth buttons (Google/Apple) intentionally omitted from the UI for minimalism and immediate core feature focus.

## 🧱 Core Architecture & Typings
The app's data models are located in `types/index.ts`. All IDs strictly use `string` to align with Supabase UUIDs.

- **`Thought`**: `id`, `title`, `url`, `type`, `tags` (string[]), `description`
- **`Profile`**: `id`, `username`, `email`, `is_brain_shared` (boolean)
- **`ShareLink`**: `id`, `token`, `entityType` ('brain' | 'thought' | 'tag'), `entityId`, `userId`

## 🔌 API Integrations
- **Supabase**: 
  - Managed via `@supabase/ssr` to smoothly handle cookies inside the Next.js App Router context.
  - Client instance: `lib/supabase/client.ts`
  - Server instance: `lib/supabase/server.ts`
  - **Upcoming Task**: OAuth sign-in handlers for Google and Apple will be added soon into `actions/auth.ts`.
- **Supermemory**:
  - SDK initialized in `lib/supermemory.ts` (using `supermemory@4.17.0`).
  - Exposes `getSupermemoryClient()` for easy ingestion and retrieval during API routes.
  - **Ingestion Pipeline**: The `/api/thoughts/add` route utilizes a short polling mechanism (up to ~5s) when a URL is ingested. Because Next.js serverless functions timeout, it maps what it can. Status is normalized to three values: `done`, `failed`, or `processing`. If processing exceeds the polling limits, it returns `status: 'processing'` rather than blocking indefinitely. We persist calculated `type` and `embed_url` back into Supermemory `metadata` alongside `manualTags` before calling add. Console logging is enabled at every polling step for debugging.
  - **Error Handling**: When a document fails, the route extracts error details from Supermemory's `raw` response field and surfaces it as `error_details` in the JSON response. For YouTube failures, a contextual error message is provided mentioning video access restrictions and the 10MB URL-fetched content limit.
  - **Polling Pipeline**: The `/api/thoughts/[id]` route acts as a status ping for specific memories. When the frontend encounters a `processing` status, it hits this endpoint every 5 seconds until `done` or `failed`. Includes staleness detection — if a document has been processing for 10+ minutes, a `stale: true` flag is returned.
  - **Search Pipeline**: The `/api/thoughts/search` route utilizes custom parsed queries where `/tagname` specifies tags mapping to `metadata.manualTags`, and `>typename` specifies types mapping to `metadata.type`. Default `GET` request expecting `?q=` queries. When `q` is parsed empty and only filters are left, it falls back to `documents.list()` to bypass `search.memories()`'s strict `q >= 1` character requirement. Tag filter values must be consistently formatted with a `#` prefix to match ingested metadata.
  - **Sidebar Filter Pipeline**: The `/api/thoughts` route strictly fetches matches using `?type` or `?tag` search parameters. A `Server Action` in `actions/getSidebarTags.ts` retrieves the top 10 most used tags dynamically. Both use `documents.list()` with pagination limits (`limit: 100`) instead of `search.memories()`, as the latter throws 400 errors for empty semantic search queries. IMPORTANT: Ensure `supermemory.documents.list()` is awaited and assigned to the `results` variable before checking `results.memories` to prevent `ReferenceError: results is not defined`. NOTE: Tags are securely normalized with a `#` before filtering using `formatTag()` rather than rigidly stripping it.
  - **Sharing Pipeline**: A public sharing engine enables users to share their entire brain, a specific thought, or a tag collection. Sharing creates a 10-character alphanumeric `share_token` via `/api/share/generate` and tracks it in a Supabase `shares` table. The `/api/share/retrieve?token=...` endpoint uses the **Supabase Service Role Key** to bypass Row-Level Security and verify tokens. It dynamically queries Supermemory using `documents.list()` or `documents.get()` depending on the shared entity, ensuring that retrieved documents explicitly match the owner's `containerTag` for security.
  - **Supermemory Known Constraints**:
    - `search.memories()` requires `q` to be at least 1 character long. Filter-only fetches must use `documents.list()`.
    - YouTube videos: Supported via URL content, but fetched content must be ≤10MB. There is no specific video length limit. Failures can occur due to video access restrictions (private/unlisted), region locks, or content exceeding the fetch limit.
    - Document status lifecycle: `queued → extracting → chunking → embedding → indexing → done` (or `failed` at any stage).
    - `containerTag` max 100 chars, alphanumeric with hyphens/underscores/dots.
    - Metadata values must be `string | number | boolean | Array<string>`. No nested objects.
  - **Filtering Architecture (SDK Bypass)**:
    - **The Bug**: The Supermemory SDK `v4.17.0` has a critical constraint where mixing the `containerTag` (or `containerTags` array) parameter with a `.filters` object explicitly results in a silent validation failure on the database query. This causes `documents.list()` and `search.memories()` to always return `[]` empty arrays despite the data legitimately matching the queried type, tag, and container.
    - **The Solution**: We completely bypassed the vendor's `.filters` API schema. Both API routes (`/api/thoughts` for the sidebar, and `/api/thoughts/search` for semantic querying) send unbound queries utilizing `limit: 100` alongside the `containerTag` validation object. Once the pure arrays are returned, the Next.js server utilizes a highly strict Node.js `Array.prototype.filter()` algorithm locally verifying exact metadata equality for `#` prefixed tag strings and explicitly matched types before returning to the frontend.
    - **Tag Normalization**: All tags passed to `search/route.ts` and `thoughts/route.ts` undergo formatting into `Set<string>` maps, strictly preserving `#` tags without rigidly stripping to accommodate JSON parsing variations inherent in stringified metadata properties during memory ingress.

## � UI Architecture Rules
- **Textual Thoughts (Articles, Docs, Links):** The dashboard prioritizes rendering the `description` (mapped from Supermemory's summary field) for these types. If no summary is successfully extracted, the container degrades gracefully to print the raw `url` to prevent rendering empty visual blocks in the CSS masonry grid. These are specifically styled with `text-zinc-600` (light) / `text-zinc-400` (dark) for clear, non-distracting reading.

## �🔒 Rules
- UI: Do not build overly complex UI when minimalist is requested.
- Types: All IDs generated or retrieved must conform to the `string` (UUID) type.
- Env: Always load secrets asynchronously or safely from `.env.local`. Do not leak `SUPABASE_SERVICE_ROLE_KEY` or `SUPERMEMORY_API_KEY` to the client.
- Tags: The `formatTag()` helper allows alphanumeric characters (`[a-z0-9]`), lowercases, and prepends `#`. Do not strip digits from tags.
- Status: Always normalize Supermemory document statuses to `done | failed | processing` for frontend consumption. Include the raw `supermemory_status` field for debugging.

  - **UI Search Tokenization Update**: The frontend (`components/dashboard/header.tsx`) and backend (`lib/search-parser.ts`) uses strict global RegEx parsing (`/(>[\w-]+|\/[\w-]+)/g`) to support consecutive, space-less filter tokens cleanly (e.g. typing `>youtube/react` automatically resolves logically into format type: `youtube`, tags: `['react']`). Do not regress styling to split by spaces (`split(/\s+/)`). Furthermore, to preserve visually identical horizontal caret movement on identical ghost overlay inputs, ensure no font weight variance (like `font-medium`) exists on highlighted regex components, matching the raw `font-mono` baseline layout exactly pixel-for-pixel.

## 🏷️ Type Conventions
- **Naming Constraints:** We explicitly use `youtube` (not `video`) and `twitter` (not `tweet`) for types on the UI. Ensure any filters (`>youtube`, `>twitter`) or entity type comparisons align with these identifiers strictly. This applies to both the sidebar and search tokens.
