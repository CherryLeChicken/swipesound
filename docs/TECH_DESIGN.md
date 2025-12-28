# Technical Design Document: SwipeSound

**Project Name:** SwipeSound  
**Target Architecture:** Nx Monorepo  
**Date:** December 24, 2025  

---

## 1. Overview
This document outlines the technical architecture and step-by-step implementation plan for SwipeSound, a mobile-first web application for music discovery.

## 2. System Architecture
Following the `stack.json` and `devrules.md`, the system will be built as an Nx monorepo:

- **`apps/web`**: React + Vite frontend (Tailwind CSS, shadcn/ui).
- **`apps/api`**: NestJS backend (TypeORM, PostgreSQL).
- **`libs/shared-types`**: Shared interfaces and DTOs.
- **`libs/shared-ui`**: Shared React components (shadcn/ui base).
- **`libs/shared-utils`**: Pure utility functions.

## 3. Data Model (High-Level)
### 3.1 Entities
- **Song (External/Cache)**: Metadata from Deezer (ID, Title, Artist, Album Art, Preview URL).
- **Interaction**: Stores user swipes (UserID/SessionID, SongID, Type: [LIKE, SKIP], Timestamp).

## 4. Implementation Steps & Verification

### Phase 1: Project Initialization
1. **Initialize Nx Monorepo**: Create the workspace with `npm`.
   - **Verification**: Run `npx nx graph`. It should open a browser showing the project dependencies (currently empty or just 'web').
2. **Generate Applications**:
   - `nx generate @nx/react:app web` (Vite, Tailwind).
     - **Verification**: Run `npx nx serve web`. Open `http://localhost:4200` to see the default Nx welcome page.
   - `nx generate @nx/nest:app api`.
     - **Verification**: Run `npx nx serve api`. Open `http://localhost:3000/api` to see the hello world response.
3. **Generate Libraries**:
   - `nx generate @nx/js:lib shared-types`.
   - `nx generate @nx/react:lib shared-ui`.
   - `nx generate @nx/js:lib shared-utils`.
     - **Verification**: Ensure folders exist in `libs/` and check `tsconfig.base.json` for paths.

### Phase 2: Shared Contracts (`libs/shared-types`)
1. Define `Song` and `Artist` interfaces.
2. Define `SwipeAction` enum and `SwipeRequest` DTO.
3. Define `LikedSong` response type.
   - **Verification**: Run `npx nx build shared-types`. It should compile without errors.

### Phase 3: Backend Development (`apps/api`)
1. **Database Setup**:
   - Configure TypeORM with PostgreSQL in `app.module.ts`.
   - Create `Interaction` entity to store swipes.
     - **Verification**: Run the app and check if tables are created in PostgreSQL (using `psql` or a GUI).
2. **Deezer API Integration**:
   - Implement `DeezerService` to proxy requests (Search, Discovery).
     - **Verification**: Create a temporary test endpoint `GET /music/test-deezer` and verify it returns real song data from Deezer.
3. **Music Controller**:
   - `GET /music/discover`: Returns a list of song previews.
   - `POST /music/swipe`: Records a like/skip action.
   - `GET /music/liked`: Returns list of liked songs for the current session.
     - **Verification**: Use Postman or `curl` to test each endpoint. Verify `POST /music/swipe` actually saves to the DB.

### Phase 4: Frontend Development (`apps/web`)
1. **Core Layout**:
   - Mobile-first responsive container.
   - Navigation (Swipe View vs. Liked Songs View).
     - **Verification**: Resize browser to mobile width and check if layout holds.
2. **Swipe Component**:
   - Integrate `framer-motion` for smooth swipe animations.
     - **Verification**: Manually drag the card on the screen. It should move and snap back or fly off based on distance.
3. **Audio Handling**:
   - Create a `useAudioPlayer` hook to manage the 30s preview playback.
     - **Verification**: Songs should start playing automatically and stop when the next one is swiped into view.
4. **State Management**:
   - **React Query**: Manage fetching songs and posting swipes.
     - **Verification**: Check the Network tab in DevTools to ensure requests are being made to `/api/music/discover`.

### Phase 5: Genre Preferences
1. **Define Genre Types**: Add `Genre` interface and list of common genres to `shared-types`.
2. **Backend: User Genre Storage**:
   - Update `User` entity to store selected genre IDs.
   - Update `AuthService` to allow saving/retrieving genre preferences.
3. **Backend: Genre-Based Discovery**:
   - Update `MusicService.getDiscoverSongs` to prioritize tracks from selected genres if no liked songs exist yet.
4. **Frontend: Genre Selection UI**:
   - Create an onboarding view where users select at least 3 genres they like.
   - **Verification**: Ensure selection is saved and the first set of discovery cards match the chosen genres.

### Phase 6: Polishing & UX
1. **Shadcn/UI Integration**: Use `Card`, `Button`, and `ScrollArea` for the "Liked Songs" list.
2. **Accessibility**: Add keyboard shortcuts and visible tap buttons for swipe actions.
     - **Verification**: Test swiping with Left/Right arrow keys.
3. **Adaptive Discovery Algorithm**:
   - Implement "Skip Fatigue" detection: Analyzes the last 10 interactions.
   - If skip rate is > 70%, the algorithm triggers a "Shakeup" and rotates to different genres to break repetition.
   - **Verification**: Skip 7 songs in a row and verify that the next set of cards contains different genres than your initial preferences.

---

## 5. Technical Decisions & Tradeoffs
- **Session-based Tracking**: For the MVP, we will use a session-based or local-storage approach instead of full user accounts to minimize friction.
- **Deezer Proxy**: Proxying Deezer requests through our NestJS backend prevents CORS issues and allows for future server-side caching/filtering.
- **Framer Motion**: Chosen for gestures over a raw touch-event implementation for better developer experience and smoother animations on high-refresh-rate mobile screens.

## 6. Development Workflow
- **Linting & Formatting**: Enforced via ESLint and Prettier (per `devrules.md`).
- **Testing**:
  - `nx test web` (Vitest).
  - `nx test api` (Jest).
- **Environment**: Managed via `.env` files in `apps/api` and `apps/web`.

---

## 7. Step-by-Step Implementation Guide for Cursor

1. **Step 1**: Initialize Nx and create the folder structure.
2. **Step 2**: Set up `libs/shared-types` with initial interfaces.
3. **Step 3**: Configure NestJS with TypeORM and create the `DeezerService`.
4. **Step 4**: Build the `apps/web` basic layout and Tailwind config.
5. **Step 5**: Implement the Swipe Card with Framer Motion.
6. **Step 6**: Connect Frontend to Backend using React Query.
7. **Step 7**: Implement Authentication and User profiles.
8. **Step 8**: Implement Genre Selection and adaptive discovery logic.
9. **Step 9**: Add final UI touches and ensure mobile responsiveness.

