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
| User Auth | Register, login, JWT tokens | ⬜ Not Started |
| Game CRUD | Create, read, update, delete games | ⬜ Not Started |
| AI Compiler | Prompt → GameSpec generation | ⬜ Not Started |
| Game Preview | Preview games in studio | ⬜ Not Started |
| Basic Sessions | Create session, join by code | ⬜ Not Started |
| Question Gameplay | Multiple choice questions work | ⬜ Not Started |
| Dashboard | View games and session results | ⬜ Not Started |

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

---

## Prioritized Backlog

### Phase 1: Foundation (NEXT)
- [ ] Backend core (config, database, security)
- [ ] User model and auth routes
- [ ] Game model and basic CRUD
- [ ] Frontend routing and layout
- [ ] Auth pages (login, signup)
- [ ] Landing page

### Phase 2: AI Studio
- [ ] AI Compiler service (Claude integration)
- [ ] Prompt interface
- [ ] GameSpec validator
- [ ] Game Builder UI
- [ ] Game Preview component

### Phase 3: Game Runtime
- [ ] Session model and routes
- [ ] Game Engine (frontend)
- [ ] Question gameplay
- [ ] Leaderboard
- [ ] Player join flow

### Phase 4: Dashboard
- [ ] Dashboard home (Bento grid)
- [ ] Session results view
- [ ] Analytics charts
- [ ] Export functionality

### Phase 5: Marketplace
- [ ] Marketplace listings model
- [ ] Browse/search UI
- [ ] Publish flow
- [ ] Purchase flow (Stripe)

### Phase 6: Classroom
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
