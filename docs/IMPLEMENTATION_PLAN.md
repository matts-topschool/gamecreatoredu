# GameCraft EDU - Implementation Plan

## Phase Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: FOUNDATION                                                          │
│ Core infrastructure, auth, basic CRUD                                        │
│ Duration: ~2 sessions                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: AI STUDIO                                                           │
│ AI Compiler, Game Builder, Preview                                           │
│ Duration: ~3 sessions                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: GAME RUNTIME & SESSIONS                                             │
│ Game engine, live sessions, real-time sync                                   │
│ Duration: ~2 sessions                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: DASHBOARD & ANALYTICS                                               │
│ Teacher dashboard, session results, exports                                  │
│ Duration: ~2 sessions                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: MARKETPLACE                                                         │
│ Browse, purchase, sell, Stripe integration                                   │
│ Duration: ~2 sessions                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: CLASSROOM INTEGRATION                                               │
│ Google Classroom, roster sync, gradebook export                              │
│ Duration: ~1 session                                                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## PHASE 1: FOUNDATION

### 1.1 Backend Core Setup

#### Task 1.1.1: Database Models & Connection
**Files to create:**
- `/app/backend/core/__init__.py`
- `/app/backend/core/config.py` - Environment configuration
- `/app/backend/core/database.py` - MongoDB async connection
- `/app/backend/core/security.py` - JWT, password hashing

**Implementation:**
```python
# core/config.py
- Load all env vars with validation
- Define Settings class with Pydantic

# core/database.py  
- Async MongoDB connection with Motor
- Collection references
- Index creation on startup

# core/security.py
- JWT token creation/verification
- Password hashing with bcrypt
- OAuth token handling
```

#### Task 1.1.2: User Model & Auth Routes
**Files to create:**
- `/app/backend/models/user.py`
- `/app/backend/schemas/auth.py`
- `/app/backend/routers/auth.py`

**Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

#### Task 1.1.3: Game Model & Basic CRUD
**Files to create:**
- `/app/backend/models/game.py`
- `/app/backend/schemas/game.py`
- `/app/backend/schemas/game_spec.py`
- `/app/backend/routers/games.py`

**Endpoints:**
- `GET /api/games` - List user's games
- `POST /api/games` - Create game
- `GET /api/games/:id` - Get game
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

### 1.2 Frontend Core Setup

#### Task 1.2.1: Routing & Layout
**Files to create:**
- `/app/frontend/src/components/common/Layout.jsx`
- `/app/frontend/src/components/common/Navbar.jsx`
- `/app/frontend/src/components/common/Sidebar.jsx`
- `/app/frontend/src/components/common/Footer.jsx`

**Updates:**
- `/app/frontend/src/App.js` - All routes
- `/app/frontend/src/index.css` - Theme variables, fonts

#### Task 1.2.2: Auth State & Services
**Files to create:**
- `/app/frontend/src/stores/authStore.js` - Zustand auth state
- `/app/frontend/src/services/api.js` - Axios instance with interceptors
- `/app/frontend/src/services/authService.js` - Auth API calls
- `/app/frontend/src/hooks/useAuth.js` - Auth hook
- `/app/frontend/src/components/auth/ProtectedRoute.jsx`

#### Task 1.2.3: Auth Pages
**Files to create:**
- `/app/frontend/src/pages/Login.jsx`
- `/app/frontend/src/pages/Signup.jsx`
- `/app/frontend/src/components/auth/LoginForm.jsx`
- `/app/frontend/src/components/auth/SignupForm.jsx`

#### Task 1.2.4: Landing Page
**Files to create:**
- `/app/frontend/src/pages/Landing.jsx`

**Sections:**
- Hero with CTA
- Features overview
- How it works
- Pricing preview
- Footer

---

## PHASE 2: AI STUDIO

### 2.1 AI Compiler Backend

#### Task 2.1.1: AI Service Setup
**Files to create:**
- `/app/backend/services/ai_compiler.py`
- `/app/backend/routers/ai.py`

**Implementation:**
```python
# services/ai_compiler.py
- Claude API integration via emergentintegrations
- Prompt template for GameSpec generation
- Streaming response handling
- Spec validation post-generation

# routers/ai.py
- POST /api/ai/compile (streaming)
- POST /api/ai/generate-questions
- POST /api/ai/generate-feedback
```

#### Task 2.1.2: GameSpec Validation Engine
**Files to create:**
- `/app/backend/engine/__init__.py`
- `/app/backend/engine/spec_validator.py`

**Validation rules:**
- Schema compliance
- Reference integrity
- Required fields
- Type checking

### 2.2 Studio Frontend

#### Task 2.2.1: Studio Layout & Navigation
**Files to create:**
- `/app/frontend/src/pages/Studio.jsx` - Games list
- `/app/frontend/src/pages/StudioNew.jsx` - Create new
- `/app/frontend/src/pages/StudioEditor.jsx` - Edit game
- `/app/frontend/src/services/gameService.js`
- `/app/frontend/src/stores/gameStore.js`

#### Task 2.2.2: AI Prompt Interface
**Files to create:**
- `/app/frontend/src/components/studio/PromptInterface.jsx`

**Features:**
- Large text input for game description
- Grade/subject selectors
- Question count slider
- Real-time AI streaming display
- Generated spec preview

#### Task 2.2.3: Game Builder (Visual Editor)
**Files to create:**
- `/app/frontend/src/components/studio/GameBuilder.jsx`
- `/app/frontend/src/components/studio/SceneEditor.jsx`
- `/app/frontend/src/components/studio/ContentEditor.jsx`
- `/app/frontend/src/components/studio/SpecEditor.jsx`

**Features:**
- Scene list/navigation
- Component drag-and-drop
- Question editor (CRUD)
- Rules editor
- Settings panel

#### Task 2.2.4: Game Preview
**Files to create:**
- `/app/frontend/src/components/studio/GamePreview.jsx`
- `/app/frontend/src/components/game/GameEngine.jsx`

**Features:**
- Live preview of spec
- Play through as student
- Debug panel (state viewer)

---

## PHASE 3: GAME RUNTIME & SESSIONS

### 3.1 Session Backend

#### Task 3.1.1: Session Models & CRUD
**Files to create:**
- `/app/backend/models/session.py`
- `/app/backend/schemas/session.py`
- `/app/backend/routers/sessions.py`

**Endpoints:**
- `POST /api/sessions` - Create session
- `GET /api/sessions` - List sessions
- `GET /api/sessions/:id` - Get session
- `GET /api/sessions/join/:code` - Join by code
- `POST /api/sessions/:id/start`
- `POST /api/sessions/:id/end`
- `POST /api/sessions/:id/events` - Submit event

#### Task 3.1.2: Session Manager Service
**Files to create:**
- `/app/backend/services/session_manager.py`

**Implementation:**
- Session state machine (lobby → active → ended)
- Join code generation
- Player management
- Event processing
- State updates

#### Task 3.1.3: Game Engine Backend
**Files to create:**
- `/app/backend/engine/rules_evaluator.py`
- `/app/backend/engine/state_manager.py`
- `/app/backend/services/game_engine.py`

**Implementation:**
- Rules DSL evaluation
- State transitions
- Score calculation
- Event validation

### 3.2 Game Runtime Frontend

#### Task 3.2.1: Game Engine Component
**Files to update:**
- `/app/frontend/src/components/game/GameEngine.jsx`

**Sub-components to create:**
- `/app/frontend/src/components/game/SceneRenderer.jsx`
- `/app/frontend/src/components/game/QuestionCard.jsx`
- `/app/frontend/src/components/game/Leaderboard.jsx`
- `/app/frontend/src/components/game/Timer.jsx`
- `/app/frontend/src/components/game/PlayerHUD.jsx`

#### Task 3.2.2: Play Pages
**Files to create:**
- `/app/frontend/src/pages/Play.jsx` - Direct game play
- `/app/frontend/src/pages/PlaySession.jsx` - Live session
- `/app/frontend/src/pages/JoinGame.jsx` - Join by code
- `/app/frontend/src/stores/sessionStore.js`
- `/app/frontend/src/services/sessionService.js`

#### Task 3.2.3: Teacher Session Controls
**Files to create:**
- `/app/frontend/src/components/session/TeacherControls.jsx`
- `/app/frontend/src/components/session/SessionLobby.jsx`
- `/app/frontend/src/components/session/LiveDashboard.jsx`

---

## PHASE 4: DASHBOARD & ANALYTICS

### 4.1 Analytics Backend

#### Task 4.1.1: Analytics Models & Service
**Files to create:**
- `/app/backend/models/analytics.py`
- `/app/backend/services/analytics_service.py`
- `/app/backend/routers/analytics.py`

**Endpoints:**
- `GET /api/analytics/sessions/:id/results`
- `GET /api/analytics/games/:id/performance`
- `GET /api/analytics/classes/:id/overview`
- `POST /api/analytics/sessions/:id/export`

### 4.2 Dashboard Frontend

#### Task 4.2.1: Dashboard Home (Bento Grid)
**Files to create:**
- `/app/frontend/src/pages/Dashboard.jsx`
- `/app/frontend/src/components/dashboard/DashboardHome.jsx`
- `/app/frontend/src/components/dashboard/StatsCard.jsx`
- `/app/frontend/src/components/dashboard/RecentGames.jsx`
- `/app/frontend/src/components/dashboard/RecentSessions.jsx`

#### Task 4.2.2: Games & Sessions Management
**Files to create:**
- `/app/frontend/src/components/dashboard/GamesList.jsx`
- `/app/frontend/src/components/dashboard/SessionsList.jsx`
- `/app/frontend/src/components/dashboard/SessionDetail.jsx`
- `/app/frontend/src/services/analyticsService.js`

#### Task 4.2.3: Analytics Charts
**Files to create:**
- `/app/frontend/src/components/dashboard/AnalyticsCharts.jsx`
- `/app/frontend/src/components/dashboard/PerformanceChart.jsx`
- `/app/frontend/src/components/dashboard/StandardsMastery.jsx`

---

## PHASE 5: MARKETPLACE

### 5.1 Marketplace Backend

#### Task 5.1.1: Marketplace Models
**Files to create:**
- `/app/backend/models/marketplace.py`
- `/app/backend/schemas/marketplace.py`
- `/app/backend/routers/marketplace.py`

**Endpoints:**
- `GET /api/marketplace` - Browse listings
- `GET /api/marketplace/:slug` - Get listing
- `POST /api/marketplace/publish` - Publish game
- `POST /api/marketplace/:id/purchase` - Purchase
- `GET /api/marketplace/seller/dashboard`

#### Task 5.1.2: Payment Integration (Stripe)
**Files to create:**
- `/app/backend/services/payment_service.py`

### 5.2 Marketplace Frontend

#### Task 5.2.1: Browse & Search
**Files to create:**
- `/app/frontend/src/pages/Marketplace.jsx`
- `/app/frontend/src/components/marketplace/MarketplaceBrowser.jsx`
- `/app/frontend/src/components/marketplace/GameCard.jsx`
- `/app/frontend/src/components/marketplace/FilterSidebar.jsx`
- `/app/frontend/src/services/marketplaceService.js`

#### Task 5.2.2: Listing Detail & Purchase
**Files to create:**
- `/app/frontend/src/pages/MarketplaceListing.jsx`
- `/app/frontend/src/components/marketplace/GameListing.jsx`
- `/app/frontend/src/components/marketplace/PurchaseFlow.jsx`

#### Task 5.2.3: Seller Dashboard
**Files to create:**
- `/app/frontend/src/components/marketplace/SellerDashboard.jsx`
- `/app/frontend/src/components/marketplace/PublishFlow.jsx`

---

## PHASE 6: CLASSROOM INTEGRATION

### 6.1 Class Management

#### Task 6.1.1: Class Models & Routes
**Files to create:**
- `/app/backend/models/classroom.py`
- `/app/backend/schemas/classroom.py`
- `/app/backend/routers/classes.py`

**Endpoints:**
- `GET /api/classes`
- `POST /api/classes`
- `POST /api/classes/import/google`
- `POST /api/classes/:id/sync`

#### Task 6.1.2: Google Classroom Integration
**Files to create:**
- `/app/backend/services/classroom_service.py`

### 6.2 Class Management Frontend

#### Task 6.2.1: Class Manager UI
**Files to create:**
- `/app/frontend/src/components/dashboard/ClassManager.jsx`
- `/app/frontend/src/components/dashboard/ClassDetail.jsx`
- `/app/frontend/src/components/dashboard/StudentRoster.jsx`
- `/app/frontend/src/components/dashboard/GradebookExport.jsx`

---

## Testing Checkpoints

After each phase, we'll run:
1. Backend API tests (curl + testing agent)
2. Frontend component tests (screenshot + testing agent)
3. E2E flow tests (testing agent)

---

## Ready to Start

**Next Action:** Begin Phase 1.1 - Backend Core Setup

This will establish:
- Database connection and models
- Authentication system
- Base API structure

Should I proceed with Phase 1 implementation?
