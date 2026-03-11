/**
 * Agent Service - Client for the Game Mechanics Agent, Design Agent, and Game Ideator Agent APIs.
 *
 * Mechanics Agent:
 *   auditMechanics(spec)     → report only, no changes
 *   fixMechanics(spec)       → report + fixed spec
 *   fixBattleBalance(spec)   → instant deterministic fix, no LLM wait
 *
 * Design Agent:
 *   auditDesign(code, name, context)  → report + corrected JSX
 *   generateEmptyState(context)       → brand-compliant empty state JSX
 *   generateSkeleton(description)     → loading skeleton JSX
 */
import api from './api';

// ─────────────────────────────────────────────
// Mechanics Agent
// ─────────────────────────────────────────────

/**
 * Audit a GameSpec for mechanical problems.
 * Returns a report but does NOT modify the spec.
 *
 * @param {Object} spec - The GameSpec object
 * @returns {Promise<{ success: boolean, audit_report: Object }>}
 */
export const auditMechanics = async (spec) => {
  const response = await api.post('/agents/mechanics/audit', { spec });
  return response.data;
};

/**
 * Audit and fix a GameSpec. Returns the corrected spec and a change report.
 * Use when a teacher wants to review what changed before accepting.
 *
 * @param {Object} spec - The GameSpec object
 * @returns {Promise<{ success: boolean, fixed_spec: Object, audit_report: Object, was_modified: boolean }>}
 */
export const fixMechanics = async (spec) => {
  const response = await api.post('/agents/mechanics/fix', { spec });
  return response.data;
};

/**
 * Fast deterministic battle balance fix — no LLM, instant response.
 * Applies HP scaling, speed threshold, damage caps, combo tuning.
 *
 * @param {Object} spec - The battle GameSpec
 * @returns {Promise<{ success: boolean, fixed_spec: Object }>}
 */
export const fixBattleBalance = async (spec) => {
  const response = await api.post('/agents/mechanics/fix-battle', { spec });
  return response.data;
};

// ─────────────────────────────────────────────
// Design Agent
// ─────────────────────────────────────────────

/**
 * Audit a React component for design system violations.
 *
 * @param {string} componentCode - Full JSX source
 * @param {string} componentName - File or component name (for logging)
 * @param {'light'|'dark'} pageContext - Theme context
 * @returns {Promise<{ success: boolean, corrected_code: string, audit_report: Object, was_modified: boolean }>}
 */
export const auditDesign = async (componentCode, componentName = 'Component', pageContext = 'light') => {
  const response = await api.post('/agents/design/audit', {
    component_code: componentCode,
    component_name: componentName,
    page_context: pageContext,
  });
  return response.data;
};

/**
 * Generate a brand-compliant empty state component.
 *
 * @param {string} context - What is empty, e.g. "no games created yet"
 * @param {'light'|'dark'} pageContext - Theme context
 * @returns {Promise<{ success: boolean, jsx: string }>}
 */
export const generateEmptyState = async (context, pageContext = 'light') => {
  const response = await api.post('/agents/design/empty-state', {
    context,
    page_context: pageContext,
  });
  return response.data;
};

/**
 * Generate a Shadcn Skeleton loading state matching the described layout.
 *
 * @param {string} layoutDescription - e.g. "3-column card grid with title and description"
 * @returns {Promise<{ success: boolean, jsx: string }>}
 */
export const generateSkeleton = async (layoutDescription) => {
  const response = await api.post('/agents/design/skeleton', {
    layout_description: layoutDescription,
  });
  return response.data;
};

// ─────────────────────────────────────────────
// Game Ideator Agent
// ─────────────────────────────────────────────

/**
 * Generate a single game concept for a subject and grade level.
 *
 * @param {string} subject - e.g. "fractions", "World War 2"
 * @param {number[]} gradeLevels - e.g. [4, 5]
 * @param {Object} options - { learningObjective, gameType, tone, avoidThemes }
 * @returns {Promise<{ success: boolean, concept: Object }>}
 */
export const generateConcept = async (subject, gradeLevels, options = {}) => {
  const response = await api.post('/agents/ideator/concept', {
    subject,
    grade_levels: gradeLevels,
    learning_objective: options.learningObjective || null,
    game_type: options.gameType || null,
    tone: options.tone || null,
    avoid_themes: options.avoidThemes || null,
  });
  return response.data;
};

/**
 * Generate multiple distinct concepts for the same subject.
 *
 * @param {string} subject
 * @param {number[]} gradeLevels
 * @param {number} count - 2-8 concepts
 * @param {string[]} gameTypes - optional, generate one per type
 * @returns {Promise<{ success: boolean, concepts: Object[], count: number }>}
 */
export const generateBulkConcepts = async (subject, gradeLevels, count = 5, gameTypes = null) => {
  const response = await api.post('/agents/ideator/bulk', {
    subject,
    grade_levels: gradeLevels,
    count,
    game_types: gameTypes,
  });
  return response.data;
};

/**
 * Generate a remix or variation of an existing game.
 *
 * @param {Object} existingSpec - The current GameSpec
 * @param {string} remixDirection - e.g. "make it harder for advanced students"
 * @returns {Promise<{ success: boolean, remix: Object }>}
 */
export const remixGame = async (existingSpec, remixDirection) => {
  const response = await api.post('/agents/ideator/remix', {
    existing_spec: existingSpec,
    remix_direction: remixDirection,
  });
  return response.data;
};

/**
 * Generate a themed collection of games covering an entire curriculum unit.
 *
 * @param {string} unitTopic - e.g. "Ancient Egypt", "The Water Cycle"
 * @param {number[]} gradeLevels
 * @param {number} numGames - 3-7 games
 * @param {number} durationWeeks - optional
 * @returns {Promise<{ success: boolean, collection: Object }>}
 */
export const generateUnitCollection = async (unitTopic, gradeLevels, numGames = 5, durationWeeks = null) => {
  const response = await api.post('/agents/ideator/unit', {
    unit_topic: unitTopic,
    grade_levels: gradeLevels,
    num_games: numGames,
    duration_weeks: durationWeeks,
  });
  return response.data;
};

/**
 * Generate high-novelty game concepts for a grade band based on current trends.
 *
 * @param {'K-2'|'3-5'|'6-8'|'9-12'} gradeBand
 * @param {string} subject - optional subject focus
 * @param {number} count - 2-8 ideas
 * @returns {Promise<{ success: boolean, concepts: Object[], count: number }>}
 */
export const suggestTrendingConcepts = async (gradeBand, subject = null, count = 6) => {
  const response = await api.post('/agents/ideator/trending', {
    grade_band: gradeBand,
    subject,
    count,
  });
  return response.data;
};

/**
 * Create the Game Ideator Agent's top pick — Fault Line — as a playable game
 * for the current user. Pre-built spec, no LLM wait.
 *
 * @returns {Promise<{ success: boolean, already_existed: boolean, game_id: string, slug: string, message: string }>}
 */
export const createFaultLineDemo = async () => {
  const response = await api.post('/agents/ideator/create-demo');
  return response.data;
};
