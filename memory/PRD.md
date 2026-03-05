# GameCraft EDU - Product Requirements Document

## Original Problem Statement
Build an AI-Powered Game Creation & Marketplace for Educators - a platform where teachers can describe educational games in natural language and have AI generate playable games with customizable themes and characters.

## Core User Personas
1. **Teachers** - Create, customize, and share educational games
2. **Students** - Play games assigned by teachers
3. **School Admins** - Manage integrations with LMS/SIS systems

## What's Been Implemented

### Phase 1: Core Platform (COMPLETED)
- [x] User authentication (JWT-based)
- [x] React frontend with Shadcn UI
- [x] FastAPI backend with MongoDB
- [x] Basic dashboard and navigation

### Phase 2: AI Game Generation (COMPLETED)
- [x] AI compiler service using OpenAI GPT-5.1
- [x] GameSpec JSON schema for game definitions
- [x] Async task-based compilation (handles proxy timeouts)
- [x] Multi-runtime game engine

### Phase 3: Game Runtimes (COMPLETED - Enhanced March 2026)
- [x] Quiz Runtime - Basic question/answer flow
- [x] Battle Runtime - Enhanced with visual themes
  - 20 Battle Arena themes (Fantasy, Space, Ocean, etc.)
  - 18 Player Characters with attack styles
  - 30+ Enemy Types with health/difficulty
  - Animated damage numbers and combos
  - Victory/Defeat screens with effects
  - Theme Selector component for customization
  - Free/Premium tier system for future paywall
- [x] Adventure Runtime - Multi-scene journey with artifact collection
  - 6 Adventure Worlds (Pirate, Mansion, Space, Egypt, Forest, Ocean)
  - Journey Map UI showing progress across scenes
  - NPC dialogue system with typewriter effect
  - Artifact collection mechanic (collect pieces, assemble at end)
  - Detailed scene backgrounds for each world
  - Adventure World Selector component for customization
  - Dynamic thumbnails showing world preview
- [ ] Platformer Runtime - Coming soon
- [ ] Puzzle Runtime - Coming soon
- [ ] Simulation Runtime - Coming soon

### Phase 4: Marketplace (COMPLETED)
- [x] Game publishing and discovery
- [x] Game forking with derivative permissions
- [x] Creator stores (TpT-style profiles)
- [x] Search and browse functionality

### Phase 5: LMS/SIS Integrations (COMPLETED)
- [x] Integration framework with provider abstraction
- [x] Google Classroom (active)
- [x] 15+ provider stubs (Canvas, Clever, Arbor, etc.)
- [x] CTF/CSV file import for UK schools
- [x] Integrations page with navigation links

### Phase 5A: UI Navigation (COMPLETED - March 5, 2026)
- [x] Added "Integrations" link to landing page header
- [x] Added "Integrations" link to dashboard sidebar

## Architecture

### Frontend (`/app/frontend/`)
```
src/
├── components/
│   ├── common/        # Navbar, Sidebar, Layout
│   ├── game/          # GameRuntimeSelector, GameThumbnail
│   └── ui/            # Shadcn components
├── game/              # Enhanced game system
│   ├── AssetCatalog.js        # Battle: Themes, characters, enemies
│   ├── AdventureCatalog.js    # Adventure: Worlds, NPCs, dialogues
│   ├── AdventureScenes.jsx    # Scene backgrounds for adventure
│   ├── AdventureWorldSelector.jsx # World selection UI
│   ├── EnhancedAdventureRuntime.jsx # Main adventure runtime
│   ├── EnhancedBattleRuntime.jsx
│   ├── SceneBackgrounds.jsx   # Battle scene backgrounds
│   └── ThemeSelector.jsx      # Battle theme selection
├── pages/             # All page components
├── services/          # API client
└── stores/            # Zustand stores
```

### Backend (`/app/backend/`)
```
├── core/              # Database, security
├── models/            # Pydantic models
├── routers/           # API routes
│   └── ai.py          # Async compilation with polling
└── services/          # AI compiler, integrations
```

## Key Technical Details

### Async Compilation Flow (Fixed March 2026)
1. `POST /api/ai/compile/start` → Returns task_id immediately
2. Background task runs AI compilation
3. `GET /api/ai/compile/status/{task_id}` → Poll for results
4. Frontend polls every 2 seconds until complete

### Asset Catalog System
- 20 themes across 8 categories
- Free tier: ~60% of assets
- Premium tier: Remaining assets (future paywall)
- Theme-compatible character/enemy filtering

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- Quiz Runtime enhancement (game show visuals)
- Adventure theme polish (more unique scenes per world)
- Marketplace search and filtering
- Seller Dashboard for creators

### P2 (Medium Priority)
- Platformer Runtime
- Puzzle Runtime
- Advanced Analytics Dashboard
- Sound effects integration

### P3 (Future)
- Simulation Runtime
- AI-generated custom sprites (Premium)
- Stripe payment integration
- Community features (ratings, reviews)

## Adventure Game Configuration

### Spec Fields for Adventure Games
```json
{
  "meta": { "game_type": "adventure" },
  "adventure_visuals": {
    "world": "pirate_voyage"  // or mystery_mansion, space_mission, etc.
  },
  "adventure_config": {
    "scene_count": 5,           // 3, 5, or 7 scenes
    "questions_per_scene": 2    // 1, 2, or 3 questions
  }
}
```

### Available Worlds
1. `pirate_voyage` - Sail the seas, collect treasure map pieces
2. `mystery_mansion` - Explore haunted mansion, forge skeleton key
3. `space_mission` - Blast off to space, build hyperdrive core
4. `ancient_egypt` - Uncover pharaoh secrets, restore Eye of Ra
5. `enchanted_forest` - Discover magic, collect Crystal of Light
6. `ocean_quest` - Dive deep, restore Poseidon's Trident

## Environment Configuration

### Frontend (.env)
- `REACT_APP_BACKEND_URL` - Backend API URL

### Backend (.env)
- `MONGO_URL` - MongoDB connection
- `DB_NAME` - Database name
- `OPENAI_API_KEY` - User-provided for AI generation

## Test Credentials
- Email: `test@adventure.com`
- Password: `test123456`

## Last Updated
March 5, 2026 - Implemented Enhanced Adventure Runtime with 6 worlds, artifact collection, and journey map
