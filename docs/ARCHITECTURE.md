# GameCraft EDU - Complete Architecture Document

## Platform Overview

**GameCraft EDU** is an AI-Powered Game Creation & Marketplace for Educators, enabling teachers to create, share, and monetize interactive educational games using natural language AI.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────────────┤
│  Marketing  │    Auth     │   Studio    │  Dashboard  │    Marketplace     │
│   Landing   │Login/Signup │ AI Compiler │  Analytics  │   Browse/Sell      │
│   Pricing   │   OAuth     │  Builder    │  Sessions   │   Purchase         │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴─────────┬──────────┘
       │             │             │             │                │
       └─────────────┴─────────────┼─────────────┴────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (FastAPI)                              │
│                              /api/*                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  /api/auth/*    │  /api/games/*   │  /api/sessions/*  │  /api/marketplace/* │
│  /api/ai/*      │  /api/users/*   │  /api/analytics/* │  /api/classes/*     │
└─────────────────┴─────────────────┴───────────────────┴─────────────────────┘
                                   │
       ┌───────────────────────────┼───────────────────────────┐
       │                           │                           │
       ▼                           ▼                           ▼
┌─────────────┐           ┌─────────────┐           ┌─────────────────────┐
│   MongoDB   │           │   Claude    │           │   External Services │
│  Database   │           │   Sonnet    │           │  (Stripe, Google)   │
│             │           │  AI Engine  │           │                     │
└─────────────┘           └─────────────┘           └─────────────────────┘
```

---

## Core Domain Models

### 1. Users Collection
```javascript
{
  id: UUID,
  email: String (unique),
  password_hash: String,
  display_name: String,
  role: Enum["teacher", "student", "admin"],
  avatar_url: String,
  subscription_tier: Enum["free", "creator", "school", "district"],
  subscription_expires_at: DateTime,
  stripe_customer_id: String (nullable),
  stripe_account_id: String (nullable - for sellers),
  google_id: String (nullable - for OAuth),
  settings: {
    theme: Enum["light", "dark", "auto"],
    email_notifications: Boolean,
    classroom_integrations: [ClassroomIntegration]
  },
  created_at: DateTime,
  updated_at: DateTime
}
```

### 2. Games Collection (Core Entity)
```javascript
{
  id: UUID,
  owner_id: UUID (FK users),
  slug: String (unique, URL-friendly),
  title: String,
  description: String,
  thumbnail_url: String,
  
  // THE GAME SPEC - Core of Game OS
  spec: GameSpec,  // Full JSON specification
  spec_version: Integer,
  
  status: Enum["draft", "published", "archived"],
  visibility: Enum["private", "public", "unlisted"],
  
  // Marketplace fields
  is_marketplace_listed: Boolean,
  price_cents: Integer (0 = free),
  license_type: Enum["single", "class", "school"],
  
  // Metadata
  grade_levels: [Integer],
  subjects: [String],
  standards_tags: [String],
  language: String (BCP-47),
  
  // Denormalized stats
  play_count: Integer,
  avg_rating: Decimal,
  
  created_at: DateTime,
  updated_at: DateTime,
  published_at: DateTime (nullable)
}
```

### 3. GameSpec Schema (The Game OS Core)
```javascript
GameSpec = {
  version: "1.0",
  
  meta: {
    title: String,
    description: String,
    grade_levels: [Integer],
    subjects: [String],
    language: String,
    estimated_duration_minutes: Integer,
    accessibility: {
      colorblind_safe: Boolean,
      screen_reader_friendly: Boolean
    }
  },
  
  // Visual and audio assets
  assets: {
    images: [{id, url, alt, license}],
    audio: [{id, url, type}],
    backgrounds: [{id, url, scene_id}]
  },
  
  // Game state variables
  state: {
    variables: [
      {id, name, type, initial_value, scope}
    ],
    // e.g., score, lives, streak, inventory, current_level
  },
  
  // Scenes = screens/levels
  scenes: [
    {
      id: String,
      type: Enum["title", "question", "story", "board", "result"],
      title: String,
      layout: LayoutSpec,
      components: [ComponentSpec],
      rules: [RuleSpec],
      transitions: {
        next: String (scene_id),
        on_complete: String (scene_id)
      }
    }
  ],
  
  // Content pools
  content: {
    questions: [
      {
        id: String,
        type: Enum["multiple_choice", "true_false", "short_answer", "matching"],
        stem: String,
        options: [Option],
        correct_answer: Any,
        explanation: String,
        difficulty: Integer (1-5),
        standards_tags: [String],
        ai_feedback: {  // Pre-generated by AI
          [option_id]: String
        }
      }
    ],
    story_nodes: [
      {
        id: String,
        text: String,
        speaker: String,
        branches: [{condition, next_node_id}]
      }
    ]
  },
  
  // Grading configuration
  grading: {
    scoring_model: Enum["points", "mastery", "completion"],
    max_score: Integer,
    passing_threshold: Decimal,
    standards_mapping: [{standard_id, questions}]
  }
}
```

### 4. Sessions Collection (Live Game Sessions)
```javascript
{
  id: UUID,
  game_id: UUID (FK games),
  teacher_id: UUID (FK users),
  class_id: UUID (FK classes, nullable),
  
  join_code: String (6-char unique, expires 24h),
  qr_code_url: String,
  
  mode: Enum["live", "async", "demo"],
  status: Enum["lobby", "active", "paused", "ended"],
  
  // Current game state
  current_scene_id: String,
  state_snapshot: Object,  // Full game state
  
  // Session config
  settings: {
    allow_late_join: Boolean,
    show_leaderboard: Boolean,
    randomize_questions: Boolean,
    time_limit_minutes: Integer (nullable)
  },
  
  // Participants
  participants: [
    {
      user_id: UUID,
      display_name: String,
      joined_at: DateTime,
      is_connected: Boolean,
      player_state: Object
    }
  ],
  
  started_at: DateTime,
  ended_at: DateTime,
  created_at: DateTime
}
```

### 5. Session Events Collection (Immutable Event Log)
```javascript
{
  id: UUID,
  session_id: UUID (FK sessions),
  player_id: UUID,
  
  event_type: Enum[
    "player_joined", "player_left",
    "answer_submitted", "answer_graded",
    "scene_advanced", "state_changed",
    "hint_used", "retry_attempted"
  ],
  
  payload: Object,  // Event-specific data
  
  // For analytics
  state_before: Object,
  state_after: Object,
  is_correct: Boolean (nullable),
  points_delta: Integer,
  time_spent_ms: Integer,
  
  created_at: DateTime (indexed)
}
```

### 6. Session Outcomes Collection (Computed at session end)
```javascript
{
  id: UUID,
  session_id: UUID,
  player_id: UUID,
  
  final_score: Integer,
  rank: Integer,
  accuracy_rate: Decimal,
  completion_rate: Decimal,
  time_total_seconds: Integer,
  
  // Standards mastery breakdown
  mastery_by_standard: {
    [standard_id]: {
      questions_attempted: Integer,
      questions_correct: Integer,
      mastery_level: Enum["novice", "developing", "proficient", "mastered"]
    }
  },
  
  hints_used: Integer,
  retries_used: Integer,
  
  // Pre-formatted for export
  gradebook_export: Object,
  
  created_at: DateTime
}
```

### 7. Marketplace Listings Collection
```javascript
{
  game_id: UUID (FK games, unique),
  seller_id: UUID (FK users),
  
  listing_status: Enum["pending_review", "active", "suspended", "removed"],
  
  // Extended marketing
  description_long: String (Markdown),
  screenshots: [String],
  preview_video_url: String,
  preview_scenes_count: Integer,
  
  // Pricing
  price_cents: Integer,
  license_type: Enum["single", "class", "school", "district"],
  
  // Categories and discovery
  categories: [String],
  featured: Boolean,
  featured_until: DateTime,
  
  // Stats
  sales_count: Integer,
  revenue_total_cents: Integer,
  view_count: Integer,
  
  // Reviews
  ratings: [{user_id, rating, review, created_at}],
  avg_rating: Decimal,
  
  published_at: DateTime,
  updated_at: DateTime
}
```

### 8. Purchases Collection
```javascript
{
  id: UUID,
  buyer_id: UUID (FK users),
  game_id: UUID (FK games),
  seller_id: UUID (FK users),
  listing_id: UUID (FK marketplace_listings),
  
  amount_cents: Integer,
  platform_fee_cents: Integer,
  seller_payout_cents: Integer,
  
  license_type: String,
  stripe_payment_intent_id: String,
  
  status: Enum["pending", "completed", "refunded"],
  
  created_at: DateTime
}
```

### 9. Classes Collection (Classroom Integration)
```javascript
{
  id: UUID,
  teacher_id: UUID (FK users),
  
  name: String,
  description: String,
  
  // External integration
  google_classroom_id: String (nullable),
  integration_type: Enum["manual", "google_classroom", "canvas"],
  
  // Roster
  students: [
    {
      user_id: UUID (nullable - for registered),
      external_id: String,
      display_name: String,
      email: String
    }
  ],
  
  // Course settings
  grade_level: Integer,
  subject: String,
  
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## API Endpoints Structure

### Authentication (`/api/auth`)
```
POST   /api/auth/register          - Email/password registration
POST   /api/auth/login             - Email/password login
POST   /api/auth/logout            - Invalidate session
GET    /api/auth/me                - Get current user
POST   /api/auth/google            - Google OAuth
POST   /api/auth/refresh           - Refresh JWT token
POST   /api/auth/forgot-password   - Password reset request
POST   /api/auth/reset-password    - Complete password reset
```

### AI Compiler (`/api/ai`)
```
POST   /api/ai/compile             - Prompt → GameSpec (streaming)
POST   /api/ai/generate-questions  - Batch question generation
POST   /api/ai/generate-feedback   - Pre-generate answer feedback
POST   /api/ai/grade-answer        - AI grading for open answers
POST   /api/ai/refine-spec         - Refine existing spec with prompt
```

### Games (`/api/games`)
```
GET    /api/games                  - List teacher's games
POST   /api/games                  - Create new game
GET    /api/games/:id              - Get game detail
PUT    /api/games/:id              - Update game
DELETE /api/games/:id              - Delete game
POST   /api/games/:id/publish      - Publish game
POST   /api/games/:id/duplicate    - Clone game
PUT    /api/games/:id/spec         - Update game spec
GET    /api/games/:id/spec         - Get game spec only
```

### Sessions (`/api/sessions`)
```
POST   /api/sessions               - Create new session
GET    /api/sessions               - List teacher's sessions
GET    /api/sessions/:id           - Get session detail
GET    /api/sessions/join/:code    - Join session by code (students)
POST   /api/sessions/:id/start     - Start session
POST   /api/sessions/:id/pause     - Pause session
POST   /api/sessions/:id/resume    - Resume session
POST   /api/sessions/:id/end       - End session
POST   /api/sessions/:id/advance   - Advance to next scene
POST   /api/sessions/:id/events    - Submit player event
GET    /api/sessions/:id/state     - Get current state
GET    /api/sessions/:id/leaderboard - Get leaderboard
```

### Analytics (`/api/analytics`)
```
GET    /api/analytics/sessions/:id/results   - Session outcomes
GET    /api/analytics/games/:id/performance  - Game performance stats
GET    /api/analytics/classes/:id/overview   - Class overview
POST   /api/analytics/sessions/:id/export    - Export CSV/JSON
```

### Marketplace (`/api/marketplace`)
```
GET    /api/marketplace            - Browse listings (filterable)
GET    /api/marketplace/:slug      - Get listing detail
POST   /api/marketplace/publish    - Submit game to marketplace
PUT    /api/marketplace/:id        - Update listing
DELETE /api/marketplace/:id        - Remove listing
POST   /api/marketplace/:id/purchase - Initiate purchase
GET    /api/marketplace/seller/dashboard - Seller analytics
GET    /api/marketplace/purchases  - Buyer's purchases
POST   /api/marketplace/:id/review - Submit review
```

### Classes (`/api/classes`)
```
GET    /api/classes                - List teacher's classes
POST   /api/classes                - Create class
GET    /api/classes/:id            - Get class detail
PUT    /api/classes/:id            - Update class
DELETE /api/classes/:id            - Delete class
POST   /api/classes/:id/students   - Add students
DELETE /api/classes/:id/students/:studentId - Remove student
POST   /api/classes/import/google  - Import from Google Classroom
POST   /api/classes/:id/sync       - Sync with external provider
```

### Users (`/api/users`)
```
GET    /api/users/profile          - Get own profile
PUT    /api/users/profile          - Update profile
PUT    /api/users/settings         - Update settings
GET    /api/users/subscription     - Get subscription status
POST   /api/users/subscription/upgrade - Upgrade subscription
```

---

## Frontend Routes Structure

```
/                           - Landing page (marketing)
/pricing                    - Pricing page
/about                      - About page

/auth/login                 - Login
/auth/signup                - Sign up
/auth/forgot-password       - Forgot password
/auth/reset-password        - Reset password
/auth/callback/google       - OAuth callback

/studio                     - Game Studio home (list games)
/studio/new                 - Create new game (AI prompt)
/studio/:gameId             - Game builder/editor
/studio/:gameId/preview     - Game preview

/dashboard                  - Teacher dashboard home
/dashboard/games            - My games
/dashboard/sessions         - Session history
/dashboard/sessions/:id     - Session detail & results
/dashboard/classes          - My classes
/dashboard/classes/:id      - Class detail
/dashboard/analytics        - Overall analytics

/marketplace                - Browse marketplace
/marketplace/:slug          - Game listing detail
/marketplace/sell           - Seller dashboard
/marketplace/purchases      - My purchases

/play/:gameId               - Play game (direct link)
/play/join                  - Join by code
/play/session/:code         - Live session

/settings                   - User settings
/settings/subscription      - Subscription management
/settings/integrations      - External integrations
```

---

## Backend File Structure

```
/app/backend/
├── server.py                    # Main FastAPI app
├── .env                         # Environment variables
├── requirements.txt             # Dependencies
│
├── core/
│   ├── __init__.py
│   ├── config.py               # App configuration
│   ├── database.py             # MongoDB connection
│   ├── security.py             # JWT, password hashing
│   └── exceptions.py           # Custom exceptions
│
├── models/
│   ├── __init__.py
│   ├── user.py                 # User models
│   ├── game.py                 # Game & GameSpec models
│   ├── session.py              # Session models
│   ├── marketplace.py          # Marketplace models
│   ├── analytics.py            # Analytics models
│   └── classroom.py            # Class models
│
├── schemas/
│   ├── __init__.py
│   ├── auth.py                 # Auth request/response schemas
│   ├── game.py                 # Game schemas
│   ├── game_spec.py            # GameSpec validation schemas
│   ├── session.py              # Session schemas
│   ├── marketplace.py          # Marketplace schemas
│   └── common.py               # Common schemas
│
├── routers/
│   ├── __init__.py
│   ├── auth.py                 # /api/auth/*
│   ├── ai.py                   # /api/ai/*
│   ├── games.py                # /api/games/*
│   ├── sessions.py             # /api/sessions/*
│   ├── marketplace.py          # /api/marketplace/*
│   ├── analytics.py            # /api/analytics/*
│   ├── classes.py              # /api/classes/*
│   └── users.py                # /api/users/*
│
├── services/
│   ├── __init__.py
│   ├── ai_compiler.py          # AI game compilation
│   ├── game_engine.py          # Game logic execution
│   ├── session_manager.py      # Session lifecycle
│   ├── grading_service.py      # Answer grading
│   ├── analytics_service.py    # Analytics computation
│   └── marketplace_service.py  # Marketplace operations
│
├── engine/
│   ├── __init__.py
│   ├── spec_validator.py       # GameSpec validation
│   ├── rules_evaluator.py      # Rules DSL evaluation
│   └── state_manager.py        # Game state management
│
└── utils/
    ├── __init__.py
    ├── helpers.py              # Utility functions
    └── constants.py            # Constants
```

---

## Frontend File Structure

```
/app/frontend/src/
├── index.js                     # Entry point
├── App.js                       # Main app with routing
├── App.css                      # Global app styles
├── index.css                    # Base styles + Tailwind
│
├── components/
│   ├── ui/                      # Radix UI components (existing)
│   │
│   ├── common/
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Navbar.jsx           # Navigation bar
│   │   ├── Sidebar.jsx          # Dashboard sidebar
│   │   ├── Footer.jsx           # Footer
│   │   ├── LoadingSpinner.jsx   # Loading states
│   │   └── ErrorBoundary.jsx    # Error boundary
│   │
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   ├── GoogleAuthButton.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── studio/
│   │   ├── PromptInterface.jsx      # AI prompt input
│   │   ├── GameBuilder.jsx          # Visual game editor
│   │   ├── SpecEditor.jsx           # JSON spec editor
│   │   ├── SceneEditor.jsx          # Scene configuration
│   │   ├── ContentEditor.jsx        # Question/content editor
│   │   ├── GamePreview.jsx          # Live preview
│   │   └── PublishDialog.jsx        # Publish flow
│   │
│   ├── game/
│   │   ├── GameEngine.jsx           # Game runtime engine
│   │   ├── SceneRenderer.jsx        # Scene display
│   │   ├── QuestionCard.jsx         # Question component
│   │   ├── Leaderboard.jsx          # Leaderboard display
│   │   ├── Timer.jsx                # Game timer
│   │   └── PlayerHUD.jsx            # Player HUD
│   │
│   ├── dashboard/
│   │   ├── DashboardHome.jsx        # Dashboard overview
│   │   ├── GamesList.jsx            # Games list
│   │   ├── SessionsList.jsx         # Sessions list
│   │   ├── SessionDetail.jsx        # Session results
│   │   ├── AnalyticsCharts.jsx      # Charts/graphs
│   │   └── ClassManager.jsx         # Class management
│   │
│   └── marketplace/
│       ├── MarketplaceBrowser.jsx   # Browse listings
│       ├── GameListing.jsx          # Single listing
│       ├── SellerDashboard.jsx      # Seller view
│       ├── PurchaseFlow.jsx         # Purchase UI
│       └── ReviewForm.jsx           # Review submission
│
├── pages/
│   ├── Landing.jsx
│   ├── Pricing.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Studio.jsx
│   ├── StudioNew.jsx
│   ├── StudioEditor.jsx
│   ├── Dashboard.jsx
│   ├── Marketplace.jsx
│   ├── MarketplaceListing.jsx
│   ├── Play.jsx
│   ├── PlaySession.jsx
│   └── Settings.jsx
│
├── hooks/
│   ├── useAuth.js               # Auth state hook
│   ├── useGame.js               # Game state hook
│   ├── useSession.js            # Session state hook
│   ├── useGameEngine.js         # Game engine hook
│   └── useToast.js              # Toast notifications (existing)
│
├── stores/
│   ├── authStore.js             # Auth state (zustand)
│   ├── gameStore.js             # Game editor state
│   ├── sessionStore.js          # Session state
│   └── uiStore.js               # UI state
│
├── services/
│   ├── api.js                   # API client
│   ├── authService.js           # Auth API calls
│   ├── gameService.js           # Game API calls
│   ├── sessionService.js        # Session API calls
│   ├── marketplaceService.js    # Marketplace API calls
│   └── analyticsService.js      # Analytics API calls
│
├── utils/
│   ├── constants.js             # Constants
│   ├── helpers.js               # Utility functions
│   ├── validators.js            # Form validators
│   └── formatters.js            # Data formatters
│
└── styles/
    └── themes.css               # Theme variables
```

---

## Implementation Phases

### Phase 1: Foundation (Current Focus)
1. **Backend Core**
   - Database models and connections
   - Authentication system (JWT + Google OAuth)
   - Base API structure with routers

2. **Frontend Core**
   - Routing setup
   - Auth flow (login/signup/protected routes)
   - Base layout components
   - Theme system

3. **Game Spec System**
   - GameSpec schema definition
   - Spec validation
   - Basic CRUD for games

### Phase 2: AI Studio
1. AI Compiler integration (Claude)
2. Prompt-to-GameSpec generation
3. Game Builder UI
4. Game Preview/Runtime

### Phase 3: Session System
1. Session creation/management
2. Real-time state sync
3. Player join flow
4. Event logging

### Phase 4: Dashboard & Analytics
1. Teacher dashboard
2. Session results
3. Analytics charts
4. Export functionality

### Phase 5: Marketplace
1. Listing management
2. Browse/search
3. Purchase flow (Stripe)
4. Seller dashboard

### Phase 6: Classroom Integration
1. Google Classroom sync
2. Class management
3. Gradebook export

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | MongoDB | Flexible schema for GameSpec JSON |
| Auth | JWT + OAuth | Standard, stateless, scalable |
| AI | Claude Sonnet | Best for structured output, reasoning |
| State | Zustand | Lightweight, React-native feel |
| Styling | Tailwind + Radix | Speed + accessibility |
| Real-time | Polling → WebSocket | Start simple, scale later |

---

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=gamecraft_edu
CORS_ORIGINS=*

# Auth
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# AI
EMERGENT_LLM_KEY=sk-emergent-xxx

# Google OAuth (Future)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe (Future)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://xxx.preview.emergentagent.com
```

---

This architecture provides the complete foundation for building GameCraft EDU incrementally while ensuring all systems are properly integrated from the start.
