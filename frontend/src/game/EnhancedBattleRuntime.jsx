/**
 * Enhanced Battle Runtime - Immersive RPG battle experience
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Zap, 
  Shield, 
  Swords,
  Star,
  Trophy,
  RotateCcw,
  Home,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import confetti from 'canvas-confetti';
import { 
  THEMES, 
  PLAYER_CHARACTERS, 
  ENEMIES, 
  ATTACK_STYLES,
  getRandomTaunt,
  getThemeColors 
} from './AssetCatalog';
import { getSceneComponent } from './SceneBackgrounds';

// ==================== BATTLE ARENA BACKGROUND ====================

const BattleArena = ({ theme, children }) => {
  const colors = getThemeColors(theme);
  const SceneComponent = getSceneComponent(theme);
  
  const gradients = {
    fantasy_forest: 'from-green-900 via-green-800 to-emerald-900',
    fantasy_castle: 'from-slate-900 via-purple-950 to-slate-900',
    fantasy_dragon_lair: 'from-red-950 via-orange-900 to-red-950',
    space_station: 'from-slate-950 via-blue-950 to-slate-950',
    space_alien_planet: 'from-purple-950 via-indigo-900 to-purple-950',
    space_asteroid: 'from-slate-950 via-stone-900 to-slate-950',
    ocean_depths: 'from-blue-950 via-cyan-900 to-blue-950',
    ocean_coral_reef: 'from-cyan-900 via-teal-800 to-cyan-900',
    ocean_shipwreck: 'from-slate-900 via-cyan-950 to-slate-900',
    prehistoric_jungle: 'from-green-950 via-lime-900 to-green-950',
    prehistoric_volcano: 'from-stone-900 via-orange-950 to-stone-900',
    myth_olympus: 'from-sky-300 via-amber-100 to-sky-200',
    myth_underworld: 'from-purple-950 via-fuchsia-950 to-purple-950',
    myth_norse: 'from-slate-800 via-blue-900 to-slate-800',
    science_lab: 'from-slate-900 via-emerald-950 to-slate-900',
    science_cyber: 'from-slate-950 via-cyan-950 to-slate-950',
    nature_arctic: 'from-slate-300 via-blue-200 to-slate-300',
    nature_desert: 'from-amber-300 via-yellow-200 to-amber-300',
    nature_storm: 'from-slate-800 via-slate-700 to-slate-800',
    spooky_haunted: 'from-slate-950 via-purple-950 to-slate-950',
    spooky_graveyard: 'from-slate-950 via-slate-900 to-slate-950',
  };

  const gradient = gradients[theme] || 'from-slate-900 via-slate-800 to-slate-900';

  return (
    <div className={`relative w-full h-full min-h-[600px] bg-gradient-to-b ${gradient} overflow-hidden`}>
      {/* Scene-specific background elements */}
      {SceneComponent && <SceneComponent />}
      
      {/* Default animated background elements (if no scene) */}
      {!SceneComponent && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
      )}
      
      {/* Ground/floor effect */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      
      {children}
    </div>
  );
};

// ==================== PLAYER CHARACTER ====================

const PlayerCharacter = ({ character, isAttacking, health, maxHealth, combo }) => {
  const charData = PLAYER_CHARACTERS[character] || PLAYER_CHARACTERS.knight;
  
  return (
    <motion.div 
      className="absolute left-4 top-[18%] flex flex-col items-center z-10"
      animate={isAttacking ? { x: [0, 60, 0] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Character sprite area */}
      <motion.div 
        className="relative w-24 h-24 flex items-center justify-center"
        animate={isAttacking ? { scale: [1, 1.3, 1] } : { y: [0, -8, 0] }}
        transition={isAttacking ? { duration: 0.3 } : { duration: 2, repeat: Infinity }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-500/40 rounded-full blur-2xl" />
        
        {/* Character icon */}
        <div className="relative z-10 text-5xl filter drop-shadow-lg">
          {charData.icon}
        </div>
        
        {/* Attack effect */}
        <AnimatePresence>
          {isAttacking && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-yellow-400/50 rounded-full"
            />
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Player name and stats */}
      <div className="mt-1 text-center bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
        <p className="text-white font-bold text-[10px] drop-shadow-lg">{charData.name}</p>
        
        {/* Health bar */}
        <div className="mt-0.5 w-20 h-2 bg-black/50 rounded-full overflow-hidden border border-green-900/50">
          <motion.div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            initial={{ width: '100%' }}
            animate={{ width: `${(health / maxHealth) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-[9px] text-green-400 mt-0.5">{health}/{maxHealth} HP</p>
      </div>
      
      {/* Combo indicator */}
      {combo > 1 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
        >
          <span className="text-[9px] font-bold text-white">🔥 {combo}x COMBO</span>
        </motion.div>
      )}
    </motion.div>
  );
};

// ==================== ENEMY CHARACTER ====================

const EnemyCharacter = ({ enemy, health, maxHealth, isTakingDamage, taunt }) => {
  const enemyData = ENEMIES[enemy] || ENEMIES.goblin;
  const healthPercent = (health / maxHealth) * 100;
  
  return (
    <motion.div 
      className="absolute right-4 top-[18%] flex flex-col items-center z-10"
      animate={isTakingDamage ? { x: [0, -30, 15, -15, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Taunt bubble - positioned above enemy */}
      <AnimatePresence>
        {taunt && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-1 max-w-[150px] p-1.5 bg-black/80 rounded-xl border border-red-500/50"
          >
            <p className="text-[10px] text-red-300 italic text-center">"{taunt}"</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enemy sprite area */}
      <motion.div 
        className="relative w-28 h-28 flex items-center justify-center"
        animate={isTakingDamage ? { scale: [1, 0.85, 1] } : { y: [0, -10, 0] }}
        transition={isTakingDamage ? { duration: 0.3 } : { duration: 2.5, repeat: Infinity }}
      >
        {/* Danger glow */}
        <div className={`absolute inset-0 rounded-full blur-2xl transition-colors duration-300 ${
          healthPercent > 50 ? 'bg-red-500/40' : healthPercent > 25 ? 'bg-orange-500/50' : 'bg-red-600/60'
        }`} />
        
        {/* Enemy icon */}
        <div className="relative z-10 text-6xl filter drop-shadow-lg transform -scale-x-100">
          {enemyData.icon}
        </div>
        
        {/* Damage flash */}
        <AnimatePresence>
          {isTakingDamage && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white rounded-full"
            />
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Enemy name and health */}
      <div className="mt-1 text-center bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
        <p className="text-white font-bold text-[10px] drop-shadow-lg">{enemyData.name}</p>
        
        {/* Health bar */}
        <div className="mt-0.5 w-24 h-2 bg-black/50 rounded-full overflow-hidden border border-red-900/50">
          <motion.div 
            className={`h-full transition-colors duration-300 ${
              healthPercent > 50 ? 'bg-gradient-to-r from-red-600 to-red-400' :
              healthPercent > 25 ? 'bg-gradient-to-r from-orange-600 to-orange-400' :
              'bg-gradient-to-r from-red-700 to-red-500'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${healthPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-[9px] text-red-400 mt-0.5">{health}/{maxHealth} HP</p>
      </div>
    </motion.div>
  );
};

// ==================== DAMAGE NUMBER ====================

const DamageNumber = ({ damage, position, isCombo }) => {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -100, scale: isCombo ? 1.5 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className={`absolute ${position} font-bold drop-shadow-lg ${
        isCombo ? 'text-4xl text-yellow-400' : 'text-3xl text-white'
      }`}
      style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
    >
      -{damage}
      {isCombo && <span className="ml-1 text-orange-400">!</span>}
    </motion.div>
  );
};

// ==================== BATTLE ACTIONS (Answer Buttons) ====================

const BattleActions = ({ options, onSelect, disabled, attackStyle }) => {
  const styleData = ATTACK_STYLES[attackStyle] || ATTACK_STYLES.slash;
  
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {options.map((option, index) => (
        <motion.button
          key={option.id}
          onClick={() => onSelect(option)}
          disabled={disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative p-4 rounded-xl text-left transition-all
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:ring-2 hover:ring-yellow-400/50'}
            bg-gradient-to-br from-slate-800/90 to-slate-900/90
            border border-slate-600/50
          `}
        >
          {/* Attack type indicator */}
          <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Swords className="w-4 h-4 text-yellow-400" />
          </div>
          
          <span className="text-sm font-bold text-slate-400 mr-2">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="text-white font-medium">{option.text}</span>
        </motion.button>
      ))}
    </div>
  );
};

// ==================== BATTLE HUD ====================

const BattleHUD = ({ score, combo, timeLeft, questionNumber, totalQuestions }) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
      {/* Left side - Score and Combo */}
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 bg-black/60 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-xl font-bold text-white">{score}</span>
          </div>
        </div>
        
        {combo > 1 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full"
          >
            <span className="text-sm font-bold text-white">🔥 {combo}x</span>
          </motion.div>
        )}
      </div>
      
      {/* Center - Progress */}
      <div className="px-4 py-2 bg-black/60 rounded-xl backdrop-blur-sm">
        <span className="text-sm text-slate-300">
          Battle {questionNumber} of {totalQuestions}
        </span>
      </div>
      
      {/* Right side - Timer */}
      <div className={`px-4 py-2 rounded-xl backdrop-blur-sm ${
        timeLeft <= 5 ? 'bg-red-900/80 animate-pulse' : 'bg-black/60'
      }`}>
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${timeLeft <= 5 ? 'text-red-400' : 'text-blue-400'}`} />
          <span className={`text-xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>
    </div>
  );
};

// ==================== QUESTION DISPLAY ====================

const QuestionDisplay = ({ question, showHint, onHintRequest }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 p-4 bg-black/70 rounded-xl backdrop-blur-sm border border-slate-600/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-lg text-white font-medium leading-relaxed">
            {question.stem}
          </p>
        </div>
        
        {question.hints?.length > 0 && !showHint && (
          <button
            onClick={onHintRequest}
            className="ml-3 px-3 py-1 bg-yellow-600/30 hover:bg-yellow-600/50 rounded-lg text-yellow-400 text-sm transition-colors"
          >
            💡 Hint
          </button>
        )}
      </div>
      
      {showHint && question.hints?.[0] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-2 bg-yellow-900/30 rounded-lg border border-yellow-600/30"
        >
          <p className="text-sm text-yellow-300">💡 {question.hints[0]}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

// ==================== FEEDBACK OVERLAY ====================

const FeedbackOverlay = ({ isCorrect, damage, explanation, combo, onContinue }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`max-w-md p-6 rounded-2xl ${
          isCorrect 
            ? 'bg-gradient-to-br from-green-900/90 to-emerald-900/90 border border-green-500/50' 
            : 'bg-gradient-to-br from-red-900/90 to-rose-900/90 border border-red-500/50'
        }`}
      >
        <div className="text-center">
          {isCorrect ? (
            <>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-3"
              >
                ⚔️
              </motion.div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">
                {combo > 1 ? `${combo}x COMBO HIT!` : 'DIRECT HIT!'}
              </h3>
              <p className="text-4xl font-bold text-white mb-3">
                -{damage} <span className="text-red-400">HP</span>
              </p>
            </>
          ) : (
            <>
              <motion.div
                animate={{ x: [-5, 5, -5, 5, 0] }}
                transition={{ duration: 0.4 }}
                className="text-6xl mb-3"
              >
                💥
              </motion.div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">MISS!</h3>
              <p className="text-lg text-slate-300 mb-3">The enemy counterattacks!</p>
            </>
          )}
          
          {explanation && (
            <p className="text-sm text-slate-300 mb-4 italic">"{explanation}"</p>
          )}
          
          <Button
            onClick={onContinue}
            className={`${
              isCorrect 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            Continue Battle
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== VICTORY SCREEN ====================

const VictoryScreen = ({ enemy, score, accuracy, maxCombo, totalDamage, onPlayAgain, onExit }) => {
  const enemyData = ENEMIES[enemy] || ENEMIES.goblin;
  
  useEffect(() => {
    // Celebration confetti
    const duration = 3000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4']
      });
      
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-yellow-900/90 to-amber-950/90 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="max-w-lg p-8 bg-black/60 rounded-3xl border border-yellow-500/50 text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-4"
        >
          🏆
        </motion.div>
        
        <h2 className="text-4xl font-bold text-yellow-400 mb-2">VICTORY!</h2>
        <p className="text-xl text-slate-300 mb-6">
          You defeated the {enemyData.name}!
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-400">Score</p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-400">Accuracy</p>
            <p className="text-2xl font-bold text-green-400">{accuracy}%</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-400">Max Combo</p>
            <p className="text-2xl font-bold text-orange-400">{maxCombo}x</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-400">Total Damage</p>
            <p className="text-2xl font-bold text-red-400">{totalDamage}</p>
          </div>
        </div>
        
        {/* Defeat message */}
        <div className="mb-6 p-3 bg-slate-900/50 rounded-xl italic text-slate-400">
          "{enemyData.name}: {getRandomTaunt(enemyData.tauntStyle).replace(/[*]/g, '')}"
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button onClick={onPlayAgain} className="bg-yellow-600 hover:bg-yellow-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button onClick={onExit} variant="outline" className="border-slate-600">
            <Home className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== DEFEAT SCREEN ====================

const DefeatScreen = ({ enemy, score, onRetry, onExit }) => {
  const enemyData = ENEMIES[enemy] || ENEMIES.goblin;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-red-950/90 to-slate-950/90 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md p-8 bg-black/60 rounded-3xl border border-red-500/50 text-center"
      >
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl mb-4"
        >
          💀
        </motion.div>
        
        <h2 className="text-3xl font-bold text-red-400 mb-2">DEFEATED</h2>
        <p className="text-lg text-slate-300 mb-4">
          The {enemyData.name} was too powerful...
        </p>
        
        <div className="mb-6 p-3 bg-red-950/50 rounded-xl">
          <p className="text-sm text-slate-400">Final Score</p>
          <p className="text-3xl font-bold text-white">{score}</p>
        </div>
        
        <div className="mb-6 p-3 bg-slate-900/50 rounded-xl italic text-red-300">
          "{getRandomTaunt(enemyData.tauntStyle)}"
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button onClick={onRetry} className="bg-red-600 hover:bg-red-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button onClick={onExit} variant="outline" className="border-slate-600">
            <Home className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== MAIN BATTLE RUNTIME ====================

const EnhancedBattleRuntime = ({ 
  spec, 
  onComplete, 
  onExit,
  theme = 'fantasy_castle',
  playerCharacter = 'knight',
  enemyType = 'orc'
}) => {
  // Game state
  const [gamePhase, setGamePhase] = useState('intro'); // intro, battle, feedback, victory, defeat
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalDamage, setTotalDamage] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  // Character state
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState(false);
  const [isEnemyDamaged, setIsEnemyDamaged] = useState(false);
  const [enemyTaunt, setEnemyTaunt] = useState(null);
  
  // UI state
  const [timeLeft, setTimeLeft] = useState(30);
  const [showHint, setShowHint] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [damageNumbers, setDamageNumbers] = useState([]);
  
  const timerRef = useRef(null);
  
  // Get data from spec or use defaults
  const questions = spec?.content?.questions || [];
  
  // Parse battle config with proper defaults (handles undefined/NaN values)
  // Use useMemo to prevent recreating object on every render
  // IMPORTANT: This must be defined BEFORE any useEffect that references it
  const battleConfig = React.useMemo(() => {
    const rawConfig = spec?.battle_config || {};
    return {
      damage_per_correct: Number(rawConfig.damage_per_correct) || 25,
      bonus_damage_per_combo: Number(rawConfig.bonus_damage_per_combo) || 5,
      speed_bonus_threshold_seconds: Number(rawConfig.speed_bonus_threshold_seconds) || 5,
      speed_bonus_damage: Number(rawConfig.speed_bonus_damage) || 5,
      player_damage_on_wrong: Number(rawConfig.player_damage_on_wrong) || 10,
      timer_per_round: Number(rawConfig.timer_per_round) || 30,
      rounds: Number(rawConfig.rounds) || questions.length
    };
  }, [spec?.battle_config, questions.length]);
  
  // Initialize timer from config when battle starts
  useEffect(() => {
    if (gamePhase === 'battle') {
      setTimeLeft(battleConfig.timer_per_round);
    }
  }, [gamePhase, battleConfig.timer_per_round]);
  
  const enemyData = spec?.entities?.enemy || ENEMIES[enemyType];
  const maxEnemyHealth = enemyData?.health?.max || 100;
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // Timer effect
  useEffect(() => {
    if (gamePhase === 'battle' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && gamePhase === 'battle') {
      handleAnswer(null); // Time's up
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gamePhase]);
  
  // Start battle after intro
  useEffect(() => {
    if (gamePhase === 'intro') {
      const enemyChar = ENEMIES[enemyType];
      setEnemyTaunt(getRandomTaunt(enemyChar?.tauntStyle || 'aggressive'));
      
      setTimeout(() => {
        setEnemyTaunt(null);
        setGamePhase('battle');
      }, 3000);
    }
  }, [gamePhase, enemyType]);
  
  // Check win/lose conditions
  useEffect(() => {
    if (enemyHealth <= 0) {
      setGamePhase('victory');
      onComplete?.({
        score,
        accuracy: Math.round((correctAnswers / questions.length) * 100),
        maxCombo,
        totalDamage
      });
    } else if (playerHealth <= 0) {
      setGamePhase('defeat');
    }
  }, [enemyHealth, playerHealth]);
  
  // Handle answer selection
  const handleAnswer = useCallback((selectedOption) => {
    clearTimeout(timerRef.current);
    
    const isCorrect = selectedOption?.is_correct || false;
    let damage = 0;
    
    if (isCorrect) {
      // Calculate damage
      damage = battleConfig.damage_per_correct;
      
      // Combo bonus
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      damage += (newCombo - 1) * battleConfig.bonus_damage_per_combo;
      
      // Speed bonus - answered quickly
      if (timeLeft >= (battleConfig.timer_per_round - battleConfig.speed_bonus_threshold_seconds)) {
        damage += battleConfig.speed_bonus_damage;
      }
      
      // Apply damage
      setEnemyHealth(h => Math.max(0, h - damage));
      setScore(s => s + damage * 10);
      setTotalDamage(t => t + damage);
      setCorrectAnswers(c => c + 1);
      
      // Animations
      setIsPlayerAttacking(true);
      setTimeout(() => {
        setIsPlayerAttacking(false);
        setIsEnemyDamaged(true);
        setDamageNumbers(prev => [...prev, { id: Date.now(), damage, isCombo: newCombo > 1 }]);
        setTimeout(() => setIsEnemyDamaged(false), 400);
      }, 300);
      
    } else {
      // Player takes damage
      setCombo(0);
      setPlayerHealth(h => Math.max(0, h - battleConfig.player_damage_on_wrong));
      setEnemyTaunt(getRandomTaunt(ENEMIES[enemyType]?.tauntStyle || 'mocking'));
      setTimeout(() => setEnemyTaunt(null), 2000);
    }
    
    // Show feedback
    setFeedbackData({
      isCorrect,
      damage,
      explanation: currentQuestion?.explanation,
      combo: isCorrect ? combo + 1 : 0
    });
    setGamePhase('feedback');
    
  }, [combo, timeLeft, battleConfig, currentQuestion, enemyType]);
  
  // Continue to next question
  const handleContinue = useCallback(() => {
    setFeedbackData(null);
    
    if (currentQuestionIndex < questions.length - 1 && enemyHealth > 0 && playerHealth > 0) {
      setCurrentQuestionIndex(i => i + 1);
      setTimeLeft(battleConfig.timer_per_round);
      setShowHint(false);
      setGamePhase('battle');
    } else if (enemyHealth > 0 && playerHealth > 0) {
      // No more questions but enemy still alive - victory by survival
      setGamePhase('victory');
    }
  }, [currentQuestionIndex, questions.length, enemyHealth, playerHealth, battleConfig.timer_per_round]);
  
  // Restart game
  const handleRestart = useCallback(() => {
    setGamePhase('intro');
    setCurrentQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTotalDamage(0);
    setCorrectAnswers(0);
    setPlayerHealth(100);
    setEnemyHealth(maxEnemyHealth);
    setTimeLeft(battleConfig.timer_per_round);
    setShowHint(false);
    setFeedbackData(null);
    setDamageNumbers([]);
  }, [maxEnemyHealth, battleConfig.timer_per_round]);
  
  // Clean up damage numbers
  useEffect(() => {
    if (damageNumbers.length > 0) {
      const timer = setTimeout(() => {
        setDamageNumbers(prev => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [damageNumbers]);

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
      <BattleArena theme={theme}>
        {/* HUD */}
        <BattleHUD 
          score={score}
          combo={combo}
          timeLeft={timeLeft}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
        
        {/* Characters */}
        <PlayerCharacter 
          character={playerCharacter}
          isAttacking={isPlayerAttacking}
          health={playerHealth}
          maxHealth={100}
          combo={combo}
        />
        
        <EnemyCharacter 
          enemy={enemyType}
          health={enemyHealth}
          maxHealth={maxEnemyHealth}
          isTakingDamage={isEnemyDamaged}
          taunt={enemyTaunt}
        />
        
        {/* Damage numbers */}
        <AnimatePresence>
          {damageNumbers.map(dn => (
            <DamageNumber 
              key={dn.id}
              damage={dn.damage}
              isCombo={dn.isCombo}
              position="right-20 top-[22%]"
            />
          ))}
        </AnimatePresence>
        
        {/* Battle UI - Question and Actions */}
        {gamePhase === 'battle' && currentQuestion && (
          <div className="absolute bottom-0 left-0 right-0 pb-4">
            <QuestionDisplay 
              question={currentQuestion}
              showHint={showHint}
              onHintRequest={() => setShowHint(true)}
            />
            
            <BattleActions 
              options={currentQuestion.options || []}
              onSelect={handleAnswer}
              disabled={false}
              attackStyle={PLAYER_CHARACTERS[playerCharacter]?.attackStyle || 'slash'}
            />
          </div>
        )}
        
        {/* Intro overlay */}
        {gamePhase === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="text-8xl mb-4"
              >
                {ENEMIES[enemyType]?.icon || '👹'}
              </motion.div>
              <h2 className="text-3xl font-bold text-red-400 mb-2">
                {ENEMIES[enemyType]?.name || 'Enemy'} appears!
              </h2>
              <p className="text-slate-400">Prepare for battle...</p>
            </div>
          </motion.div>
        )}
        
        {/* Feedback overlay */}
        <AnimatePresence>
          {gamePhase === 'feedback' && feedbackData && (
            <FeedbackOverlay 
              {...feedbackData}
              onContinue={handleContinue}
            />
          )}
        </AnimatePresence>
        
        {/* Victory screen */}
        {gamePhase === 'victory' && (
          <VictoryScreen 
            enemy={enemyType}
            score={score}
            accuracy={Math.round((correctAnswers / questions.length) * 100)}
            maxCombo={maxCombo}
            totalDamage={totalDamage}
            onPlayAgain={handleRestart}
            onExit={onExit}
          />
        )}
        
        {/* Defeat screen */}
        {gamePhase === 'defeat' && (
          <DefeatScreen 
            enemy={enemyType}
            score={score}
            onRetry={handleRestart}
            onExit={onExit}
          />
        )}
      </BattleArena>
    </div>
  );
};

export default EnhancedBattleRuntime;
