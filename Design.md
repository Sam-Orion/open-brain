# OpenBrain - Strict Swiss Execution

## Product Overview

**The Pitch:** A minimalist, distraction-free "Second Brain" to instantly capture and semantically retrieve fleeting digital artifacts—videos, tweets, articles, and posts. It brings extreme structural clarity to digital hoarding.

**For:** Researchers, designers, and curators suffering from information overload who need a precise, visually calm repository for their references.

**Device:** Desktop

**Design Direction:** Strict Swiss Execution. A rigorous grid system, high-contrast monochrome hierarchy, structural whitespace, and glassmorphic modal overlays over a stark, unstyled canvas.

**Inspired by:** Linear, Raycast

---

## Screens

- **Landing:** Stark typographic entry point with dual authentication actions
- **Registration:** Progressive validation form for account creation
- **Authentication:** Streamlined credential entry
- **Dashboard (Private):** Main command center with sidebar taxonomy and masonry-grid thought cards
- **Dashboard (Public):** Read-only view of a curated second brain
- **Thought (Public):** Isolated, distraction-free single-item view

---

## Key Flows

**Semantic Capture:** Storing a new digital artifact
1. User is on Dashboard -> sees top-right action bar
2. User clicks `Add Thought` -> background instantly applies 12px blur, modal renders in absolute center
3. User pastes URL, tags, and submits -> modal closes, new thought appears top-left in the grid

**Precision Retrieval:** Finding a specific memory
1. User is on Dashboard -> sees top-center search bar
2. User types `>twitter /design typography` -> grid instantly filters
3. Dashboard displays only Twitter embeds tagged "design" containing the word "typography"

---

<details>
<summary>Design System</summary>

## Color Palette

- **Primary:** `#6366F1` - Active states, toggles, submit actions, primary highlights
- **Background:** `#F8FAFC` - Page background (Light) / `#09090B` (Dark)
- **Surface:** `#FAFAFA` - Cards, sidebar background (Light) / `#18181B` (Dark)
- **Text:** `#18181B` - Primary headings, body (Light) / `#FAFAFA` (Dark)
- **Muted:** `#A1A1AA` - Secondary text, placeholders, inactive icons
- **Border:** `#E4E4E7` - Divider lines, card outlines (Light) / `#27272A` (Dark)
- **Tag:** `#9492db` (Background) / `#7164c0` (Text) - Global styling for taxonomy tags
- **Accent:** `#10B981` - Success states (username available, password criteria met)
- **Destructive:** `#EF4444` - Delete actions, error states

## Typography

Embracing **Geist**, a highly structural, modern neo-grotesque optimized for high-density interfaces.

- **Headings:** Geist, 600, 24px (H1), 20px (H2)
- **UI Text:** Geist, 500, 14px - Navigation, buttons, inputs
- **Body:** Geist, 400, 14px - Descriptions, tags
- **Microtext:** Geist Mono, 400, 12px - Metadata, keyboard shortcuts

**Style notes:** 
- **Borders:** 1px solid, sharp edges (0px to 4px max radius)
- **Shadows:** Hard, short drop shadows (`0 4px 0 rgba(0,0,0,0.1)`)
- **Blur:** Heavy backdrop filter (`backdrop-blur-md`) for modals
- **Transitions:** Snappy, un-eased (`150ms linear`)

## Design Tokens

```css
:root {
  --color-primary: #6366F1;
  --color-bg: #09090B;
  --color-surface: #18181B;
  --color-text: #FAFAFA;
  --color-muted: #A1A1AA;
  --color-border: #27272A;
  --color-tag-bg: #9492DB;
  --color-tag-text: #7164C0;
  
  --font-sans: 'Geist', sans-serif;
  --font-mono: 'Geist Mono', monospace;
  
  --radius-sm: 2px;
  --radius-md: 4px;
  
  --grid-gap: 24px;
  --content-padding: 32px;
}
```

</details>

---

<details>
<summary>Screen Specifications</summary>

### Landing Page

**Purpose:** Pure, unadulterated entry point to the application.

**Layout:** Absolute center, rigid container constraints.

**Key Elements:**
- **Hero Title:** `OpenBrain`, Geist 600, 48px, `#18181B`
- **Subtitle:** `A minimal repository for the digital mind.`, Geist 400, 16px, `#A1A1AA`
- **Actions:** 
  - `Sign In` Button: 40px height, 1px `#E4E4E7` border, transparent background, `#18181B` text
  - `Create Account` Button: 40px height, `#18181B` background, `#FFFFFF` text

### Registration Screen

**Purpose:** Onboarding with immediate, inline validation.

**Layout:** 400px wide modal-style container, centered.

**Key Elements:**
- **Email Input:** 40px height. Inline validation text (e.g., `Valid email`, `#10B981` text, 12px).
- **Username Input:** 40px height. Inline validation text (e.g., `Available`, `#10B981` text, 12px).
- **Password Input:** 40px height. Below input: 3 criteria checklist (`8+ chars`, `1 number`, `1 special`). Checkmarks turn `#10B981` when met.
- **SSO Options:** `Continue with Google`, `Continue with Apple`. 40px height, SVG icons left-aligned.
- **Divider:** 1px line `#E4E4E7` with "or" centered in background color.

### Authentication Screen

**Purpose:** Streamlined credential entry for returning users.

**Layout:** 400px wide modal-style container, centered.

**Key Elements:**
- **Identifier Input:** Email or Username, 40px height.
- **Password Input:** 40px height. Include `Forgot password?` link aligned right above the input.
- **Login Action:** `Sign In` Button, 40px height, `#6366F1` background, `#FFFFFF` text.
- **SSO Options:** `Continue with Google`, `Continue with Apple`. 40px height, SVG icons left-aligned.
- **Divider:** 1px line `#E4E4E7` with "or" centered in background color.

### Main Dashboard

**Purpose:** The central nervous system. Strict separation between navigation (left) and content (right).

**Layout:** 
- Sidebar: Fixed 240px left column, incorporating the uploaded OpenBrain logo image at the top.
- Header: Fixed 64px top bar.
- Content: Fluid masonry grid taking remaining space.

**Key Elements:**
- **Logo:** Uploaded OpenBrain logo image positioned at the top of the Sidebar.
- **Sidebar Toggle:** `[ / ]` icon button, top left. Collapses sidebar to 0px.
- **Sidebar Taxonomy:** 
  - `Types`: Links for Videos, Articles, Tweets, Docs. Active states get a full border (`#6366F1`) with a `rounded-xl` border radius.
  - `Tags`: `#design`, `#engineering`, `#inspiration`. Globally styled with `#9492db` background and `#7164c0` text. If a tag is active, it also gets the active full border (`#6366F1`) and `rounded-xl` radius.
- **Search Bar:** 480px wide, centered in header. Geist Mono, 14px. Placeholder: `Search thoughts, use >type or /tag...`. `Ctrl+K` shortcut indicator inside. When focused/active, it receives a 2px `#6366F1` border and becomes `rounded-full`. When a user types syntax like `>twitter` or `/design`, those specific keywords automatically get styled inline with a background color of `#9492db` and text color of `#7164c0`.
- **Action Group (Top Right):**
  - `Add Thought` Button: `#18181B` bg, `#FFFFFF` text, 36px height.
  - `Share Brain` Button: `#FFFFFF` bg, `#18181B` text, 1px border.
  - Theme Toggle: Sun/Moon SVG.
  - Avatar/Logout: 32px square, initials.

### Thought Card

**Purpose:** Encapsulate diverse media into a uniform, strict visual container.

**Layout:** Fluid width within masonry columns (min 320px). Fixed structure within.

**Key Elements:**
- **Card Container:** `#FFFFFF` bg, 1px `#E4E4E7` border, 4px radius. No internal padding for the embed area.
- **Header (40px):** 16px horizontal padding. 
  - Left: Source Icon (e.g., Twitter bird, 16px). Title (Geist 500, 14px, truncated).
  - Right: Share Icon (modal trigger), Bin Icon (`#EF4444` on hover).
- **Media Embed:** Variable height. Fills 100% width. Videos maintain 16:9 aspect ratio.
- **Footer (32px):** 16px horizontal padding, top border 1px `#E4E4E7`. 
  - Left: Tags (e.g., `#design`, 12px, `#9492db` bg, `#7164c0` text).
  - Right: External Link Arrow `↗` (14px).

### Capture Modal (Add Thought)

**Purpose:** Frictionless input without losing dashboard context.

**Layout:** 480px fixed width panel, absolute center. Background Dashboard receives `backdrop-blur-md` and `bg-black/20`.

**Key Elements:**
- **URL Input:** Focused immediately on open. 
- **Type Dropdown:** Auto-detected from URL, but manually overrideable.
- **Title Input:** Fetched automatically if possible.
- **Tags Input:** Comma separated.
- **Submit Action:** 100% width button, `#6366F1` background.

**States:**
- **Loading:** Submit button text swaps to `Fetching metadata...` with a CSS spinner.
- **Error:** Input border turns `#EF4444`, 12px red text below.

### Share Modals & Public Views

**Purpose:** Distributing content while preventing unauthorized modifications.

**Layout:** 
- **Share Modal:** 400px wide, centered. Input field with read-only URL and a `Copy` button inside the input.
- **Public Dashboard:** Identical to Main Dashboard, minus top-right action group, sidebar edit states, and card bin icons.
- **Public Single Card:** Viewport centered. 600px max-width container. Only the thought card and a minimalist `Powered by OpenBrain` footer.

</details>

---

<details>
<summary>Build Guide</summary>

**Stack:** Next.js, React, Tailwind CSS v3, Framer Motion (for strict layout transitions only, no bouncy springs)

**Build Order:**
1. **Design Tokens & Shell:** Configure Tailwind `tailwind.config.js` with Geist fonts, Zinc/Indigo colors, Tag styling, and sharp border radii. Establish Sidebar/Header/Main grid.
2. **Thought Card Component:** Build the card first. It dictates the grid rhythm. Mock up YouTube, Twitter, and Article embeds.
3. **Dashboard Layout:** Implement the masonry layout for the cards, ensure responsive columns (1 on mobile, 2 on tablet, 3-4 on desktop).
4. **Capture Flow:** Build the `Add Thought` glassmorphic modal and state management.
5. **Search:** Implement the semantic search parser (`>type`, `/tag`) and state filtering.
6. **Authentication Views:** Construct Registration and Login screens.
7. **Public Views:** Strip actions from dashboard components to create public equivalents.

</details>