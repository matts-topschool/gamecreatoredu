# GameCraft EDU - Product Requirements Document

## Project Overview

**Product Name:** GameCraft EDU  
**Description:** AI-Powered Game Creation & Marketplace for Educators  
**Target Audience:** K-12 teachers and educators globally  
**Vision:** Enable every teacher to create and sell interactive educational games using natural language AI

---

## Original Problem Statement

User provided two documents:
1. **Executive Plan (PDF)** - Business strategy, market analysis, revenue model
2. **Technical Plan (JSX)** - Architecture specifications, tech stack, data models

The platform aims to:
- Let teachers describe games in natural language, AI generates full game specs
- Run real-time classroom game sessions
- Provide analytics dashboards for learning outcomes
- Enable marketplace for buying/selling educational games

---

## User Personas

### 1. Sarah - The Tech-Curious Teacher
- **Role:** 5th Grade Math Teacher
- **Goal:** Create engaging math games without coding
- **Pain:** Current tools require too much technical skill
- **Use Case:** Uses AI Prompt Mode to create quiz games

### 2. Mike - The Power Creator
- **Role:** High School Science Teacher, side income seller
- **Goal:** Build and sell premium educational content
- **Pain:** Existing marketplaces don't support interactive games
- **Use Case:** Uses Builder Mode, sells on marketplace

### 3. Emma - The Department Head
- **Role:** Middle School Admin
- **Goal:** Track student progress across classrooms
- **Pain:** Fragmented analytics, manual gradebook entry
- **Use Case:** Dashboard analytics, Google Classroom sync

### 4. Student - Alex
- **Role:** 8th Grade Student
- **Goal:** Have fun while learning
- **Pain:** Boring worksheets
- **Use Case:** Plays games in class, competes on leaderboard

---

## Core Requirements

### P0 - Must Have (MVP)

| Feature | Description | Status |
|---------|-------------|--------|
| User Auth | Register, login, JWT tokens | ✅ Complete |
| Game CRUD | Create, read, update, delete games | ✅ Complete |
| AI Compiler | Prompt → GameSpec generation | ⬜ Phase 2 |
| Game Preview | Preview games in studio | ⬜ Phase 2 |
| Basic Sessions | Create session, join by code | ⬜ Phase 3 |
| Question Gameplay | Multiple choice questions work | ⬜ Phase 3 |
| Dashboard | View games and session results | ✅ Complete |

### P1 - Should Have

| Feature | Description | Status |
|---------|-------------|--------|
| Game Builder UI | Visual editor for specs | ⬜ Not Started |
| Live Leaderboard | Real-time multiplayer scores | ⬜ Not Started |
| Marketplace Browse | Browse free games | ⬜ Not Started |
| Analytics Charts | Performance visualizations | ⬜ Not Started |
| CSV Export | Export session results | ⬜ Not Started |

### P2 - Nice to Have

| Feature | Description | Status |
|---------|-------------|--------|
| Paid Marketplace | Stripe purchases | ⬜ Not Started |
| Google Classroom | Roster sync, grade passback | ⬜ Not Started |
| Advanced Game Types | Story games, board games | ⬜ Not Started |
| AI Grading | Open-ended answer grading | ⬜ Not Started |

---

## Technical Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Frontend | React 19 + Tailwind + Radix | Existing setup |
| Backend | FastAPI + Motor | Existing setup |
| Database | MongoDB | Flexible for GameSpec JSON |
| AI | Claude Sonnet via Emergent | For game compilation |
| State | Zustand | Lightweight client state |
| Auth | JWT + bcrypt | Standard stateless |

---

## What's Been Implemented

### January 2026 - Framework Planning

| Date | Item | Details |
|------|------|---------|
| Jan 2026 | Architecture Document | Complete system architecture defined |
| Jan 2026 | GameSpec Schema | Full JSON specification documented |
| Jan 2026 | Implementation Plan | 6-phase development roadmap |
| Jan 2026 | Design Guidelines | UI/UX system defined (Violet/Orange theme) |

### March 2026 - Phase 1 Foundation

| Date | Item | Details |
|------|------|---------|
| Mar 4, 2026 | Backend Core | Config, database, security modules |
| Mar 4, 2026 | User Model | Full user schema with auth |
| Mar 4, 2026 | Game Model | GameSpec schema, CRUD operations |
| Mar 4, 2026 | Auth Routes | Register, login, logout, me endpoints |
| Mar 4, 2026 | Game Routes | Full CRUD, publish, duplicate |
| Mar 4, 2026 | Frontend Routing | All routes configured |
| Mar 4, 2026 | Auth Store | Zustand state with persist |
| Mar 4, 2026 | Landing Page | Full marketing homepage |
| Mar 4, 2026 | Auth Pages | Login and Signup forms |
| Mar 4, 2026 | Dashboard | Bento grid layout with stats |
| Mar 4, 2026 | Studio Pages | Game list and AI creation form |

### March 2026 - Phase 2A: Universal Game Engine

| Date | Item | Details |
|------|------|---------|
| Mar 4, 2026 | Session Model | Live sessions with join codes, participants |
| Mar 4, 2026 | Analytics Model | GameEvent, SessionOutcome, HighScore, StudentProgress |
| Mar 4, 2026 | Sessions Routes | Create, join, start, end, submit events |
| Mar 4, 2026 | Analytics Routes | Results, leaderboards, exports |
| Mar 4, 2026 | Leaderboard System | Configurable per-game (score/time/accuracy/combo) |
| Mar 4, 2026 | GameWorld Engine | ECS-based universal game engine |
| Mar 4, 2026 | GameCanvas Component | React wrapper with HUD and question overlay |
| Mar 4, 2026 | Telemetry System | Event tracking for learning analytics |

### March 2026 - Phase 2B: AI Compiler & Visual Editor

| Date | Item | Details |
|------|------|---------|
| Mar 4, 2026 | AI Compiler Service | Claude-powered game generation via Emergent LLM Key |
| Mar 4, 2026 | AI Router | /api/ai/compile, /api/ai/refine, /api/ai/generate-questions |
| Mar 4, 2026 | StudioNew AI UI | Prompt-based game creation with live preview |
| Mar 4, 2026 | Visual Editor | StudioEditor.jsx with tabbed interface |
| Mar 4, 2026 | LivePreview | Real-time game preview component |
| Mar 4, 2026 | Question Editor | Expandable cards with full field editing |
| Mar 4, 2026 | Spec Update API | PUT /api/games/:id/spec with versioning |
| Mar 4, 2026 | JWT Persistence | Fixed auth token persistence on page refresh |

### March 2026 - Phase 2C: Game Runtime Engine

| Date | Item | Details |
|------|------|---------|
| Mar 4, 2026 | GameRuntime Component | Scene-based quiz flow (Title -> Question -> Feedback -> Victory) |
| Mar 4, 2026 | Play Page | /play/:gameId route with game loading and exit handling |
| Mar 4, 2026 | Title Scene | Game info display with Start button |
| Mar 4, 2026 | Question Scene | Timer countdown, progress bar, answer options, hint support |
| Mar 4, 2026 | Feedback Scene | Correct/incorrect feedback with confetti, explanation display |
| Mar 4, 2026 | Victory Scene | Final stats, accuracy, max combo, Play Again/Exit buttons |
| Mar 4, 2026 | Score System | Base points + combo bonus + speed bonus mechanics |

### March 2026 - Phase 2D: Multi-Runtime & OpenAI Integration

| Date | Item | Details |
|------|------|---------|
| Mar 4, 2026 | OpenAI GPT-5.1 | Switched from Claude to OpenAI for game generation |
| Mar 4, 2026 | BattleRuntime | Monster battle game mode with enemy health, damage, combos |
| Mar 4, 2026 | GameRuntimeSelector | Routes to correct runtime based on game_type |
| Mar 4, 2026 | Game Type Prompts | Type-specific AI instructions for quiz, battle, adventure, etc |
| Mar 4, 2026 | Battle Config | damage_per_correct, bonus_per_combo, speed_bonus settings |
| Mar 4, 2026 | Enemy Entities | Enemy name, health, taunt messages, defeat message |


### March 2026 - Phase 3: Leaderboards & Classroom Management

| Date | Item | Details |
|------|------|---------|
| Mar 4, 2026 | GameResult Model | Records score, accuracy, time, combo, damage for each play |
| Mar 4, 2026 | PlayerHighScore Model | Tracks best scores per player per game |
| Mar 4, 2026 | Leaderboard Router | Submit results, get leaderboards, player stats, rankings |
| Mar 4, 2026 | Classroom Model | Classes with join codes, student enrollment, settings |
| Mar 4, 2026 | Classes Router | Create/list/update classes, add/remove students |
| Mar 4, 2026 | Join by Code | Students join classes using 8-char join code |
| Mar 4, 2026 | Integration Framework | Abstract interfaces for Google Classroom, Canvas, Clever |
| Mar 4, 2026 | Provider Stubs | GoogleClassroomProvider, CanvasProvider, CleverProvider |
| Mar 4, 2026 | Play Page Integration | Auto-submits game results to leaderboard on completion |

---

## Prioritized Backlog

### Phase 1: Foundation (COMPLETED)
- [x] Backend core (config, database, security)
- [x] User model and auth routes
- [x] Game model and basic CRUD
- [x] Frontend routing and layout
- [x] Auth pages (login, signup)
- [x] Landing page
- [x] Dashboard with Bento grid
- [x] Studio pages (list, create new)

### Phase 2A: Universal Engine (COMPLETED)
- [x] Session management (create, join, start, end)
- [x] Analytics models (events, outcomes, high scores)
- [x] Leaderboard system (score/time/accuracy/combo)
- [x] ECS-based GameWorld engine
- [x] React GameCanvas component
- [x] Telemetry/analytics tracking

### Phase 2B: AI Compiler & Preview (COMPLETED)
- [x] Claude integration for game generation
- [x] AI Compile API endpoint (/api/ai/compile)
- [x] GameSpec validator
- [x] Game Builder UI (visual editor) - StudioEditor.jsx
- [x] Live game preview component - LivePreview.jsx
- [x] Question editing with expandable cards
- [x] Spec update persistence API
- [x] AI Refine feature (UI complete, budget-limited)

### Phase 2C: Game Runtime (COMPLETED)
- [x] GameRuntime component with scene-based flow (quiz)
- [x] BattleRuntime component for monster battle games
- [x] GameRuntimeSelector - routes to correct runtime by game_type
- [x] Battle mechanics: enemy health, damage system, combo multiplier
- [x] Score system with base points, combo bonus, speed bonus
- [x] Victory scene with stats and confetti celebration
- [x] Play page wrapper with game loading

### Phase 2D: Multi-Model AI & Game Types (COMPLETED)
- [x] OpenAI GPT-5.1 integration for game generation
- [x] Game-type specific AI prompts (quiz vs battle)
- [x] Battle game spec with entities.enemy and battle_config
- [x] Proper game_type preservation in backend models

### Phase 3A: Frontend - Leaderboards & Classroom UI (COMPLETED)
- [x] Leaderboard component with rank badges, medals for top 3
- [x] PlayerStats component with achievements
- [x] Classes page for teachers (list, create, delete)
- [x] ClassDetail page (students table, add students, join code)
- [x] Classroom service API wrapper
- [x] Leaderboard integrated into Play page sidebar

### Phase 4: Marketplace (NEXT)
- [ ] Marketplace listings model
- [ ] Browse/search UI
- [ ] Publish flow
- [ ] Purchase flow (Stripe)

### Phase 5: Classroom
- [ ] Class model
- [ ] Google Classroom integration
- [ ] Gradebook export

---

## Open Decisions

| Decision | Options | Status |
|----------|---------|--------|
| Product Name | GameCraft EDU (working) | Pending user input |
| Domain | TBD | Pending |
| Real-time Strategy | Polling vs WebSocket | Start with polling |
| Storage for Assets | Local vs S3/Cloudinary | Start local |

---

## Next Tasks

1. **Implement Phase 1.1** - Backend core setup
   - Create core/ directory with config, database, security
   - Implement User model
   - Implement Auth routes

2. **Implement Phase 1.2** - Frontend core setup
   - Setup all routes
   - Create layout components
   - Implement auth flow

3. **Test Phase 1** - Verify foundation works
   - Auth flow end-to-end
   - Game CRUD operations

---

## Session Notes

**Current Session:** Framework planning and architecture documentation
**User Preference:** Build complete infrastructure first, then implement piece by piece
**AI Integration:** Using Emergent LLM key for Claude Sonnet
**Tech Stack:** Adapted to React + FastAPI + MongoDB (Emergent environment)
