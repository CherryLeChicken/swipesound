# Product Requirements Document (PRD): SwipeSound

**Product Name:** SwipeSound  
**Tagline:** Swipe to discover your next favorite song  
**Status:** Draft / MVP Scope  

---

## 1. Problem Statement
Discovering new music often requires high effort: searching, listening to long playlists, or trusting opaque algorithms. Many users want a quick, playful, low-commitment way to discover songs without needing an app install or long sessions.

## 2. Product Vision
SwipeSound is a mobile-first web experience that turns music discovery into a swipe-based interaction. Users listen to short song previews and swipe right to like or left to skip. Over time, the experience adapts to their taste.

**The product should feel:**
- Fast
- Lightweight
- Fun
- Intuitive on mobile browsers

## 3. Target Users
### Primary Users
- Gen Z / young millennials
- Mobile-first users
- Casual music listeners
- Enjoy discovery but avoid heavy setup

### Secondary Users
- Music enthusiasts exploring new artists
- Users who enjoy gamified experiences

## 4. Platform & Constraints
- **Platform:** Mobile web (responsive website)
- **No native app**
- **No login required for MVP**
- **Optimized for:**
  - Touch gestures
  - Vertical screen orientation
  - Short sessions

## 5. Goals & Success Metrics
### Product Goals
- Make music discovery effortless
- Encourage repeat, short sessions
- Help users find songs they genuinely enjoy

### MVP Success Metrics
- Average session length
- Number of songs swiped per session
- Like (right-swipe) rate
- Return visits within 7 days

## 6. Core Features (MVP Scope)
### 6.1 Swipe-Based Song Discovery
- Songs are presented one at a time
- Each song auto-plays a 30s preview
- Swipe right → like
- Swipe left → skip
- Tap controls available as fallback (for accessibility)

### 6.2 Song Data & Playback
- Songs sourced from Deezer API
- **Required data:**
  - Preview URL
  - Song title
  - Artist name
  - Album art
- Playback must stop when swiping to next song

### 6.3 Liked Songs View
- Users can view a list of liked songs
- **Each item shows:**
  - Album art
  - Song title
  - Artist
- Optional link to open the song on Deezer

### 6.4 Preference Tracking (Lightweight)
- Track liked and skipped songs locally or server-side
- Use basic metadata (genre, artist) to bias future songs
- No complex recommendation engine in MVP

## 7. User Flow (High-Level)
1. User opens website on mobile
2. Landing screen explains swipe interaction
3. User taps “Start Swiping”
4. Song preview auto-plays
5. User swipes left or right
6. Next song loads immediately
7. User can navigate to “Liked Songs” at any time

## 8. UX & Design Principles
- Mobile-first, thumb-friendly layout
- Minimal UI (focus on album art + audio)
- Fast load times
- Clear visual feedback for swipe actions
- Accessible controls (not swipe-only)

## 9. Non-Goals (Out of Scope for MVP)
- User accounts or authentication
- Full song playback
- Playlist creation
- Social features (friends, sharing)
- Cross-platform integrations (Spotify, Apple Music)
- Advanced ML-based recommendations

## 10. Technical Requirements (High-Level)
### Frontend
- **Framework:** React + Vite
- **Styling:** Tailwind CSS v3 + shadcn/ui
- **Gestures:** Framer Motion or specialized touch gesture library
- **Audio Handling:** Native `<audio>` element with React hooks
- **State Management:** Zustand (for UI/client state)
- **Data Fetching:** TanStack Query (React Query)

### Backend
- **Framework:** NestJS (CommonJS compatible)
- **Database:** PostgreSQL (for storing swipe data/preferences if server-side)
- **ORM:** TypeORM
- **API:** RESTful endpoints for song recommendations and liked songs storage

### API Integration
- **Deezer API:**
  - Track search/discovery
  - Preview URLs
  - Album artwork
  - Artist metadata

## 11. Risks & Open Questions
- Deezer API rate limits
- Availability and consistency of previews
- Cold start experience for new users
- Licensing constraints around previews
- How to bias recommendations without accounts (Local storage vs. Session-based server side)

## 12. Future Enhancements (Post-MVP)
- Mood-based discovery (chill, hype, sad)
- Daily swipe limits
- Taste profile summary
- Login + cross-device sync
- Shareable “liked songs” page
- PWA install support

---

## Notes for Implementation
- Prioritize simplicity over feature depth.
- Optimize for mobile web performance.
- Keep MVP scope tight.
- Use Nx Monorepo structure as defined in `stack.json`.

