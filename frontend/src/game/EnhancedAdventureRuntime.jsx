/**
 * Enhanced Adventure Runtime - Story-driven exploration with artifact collection
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight,
  Star,
  Trophy,
  RotateCcw,
  Home,
  MapPin,
  Check,
  Lock,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { 
  ADVENTURE_WORLDS,
  ADVENTURE_NPCS,
  getRandomDialogue,
  getWorldById,
  getNpcById,
  getWorldScenes
} from './AdventureCatalog';
import { getAdventureScene } from './AdventureScenes';

// ==================== JOURNEY MAP ====================

const JourneyMap = ({ world, scenes, currentSceneIndex, collectedPieces }) => {
  const worldData = getWorldById(world);
  
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-white">{worldData?.name || 'Adventure'}</span>
      </div>
      
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {scenes.map((scene, index) => {
          const isCompleted = index < currentSceneIndex;
          const isCurrent = index === currentSceneIndex;
          const isLocked = index > currentSceneIndex;
          const isFinal = index === scenes.length - 1;
          
          return (
            <React.Fragment key={scene.id}>
              {/* Scene node */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative flex flex-col items-center min-w-[60px]
                  ${isCurrent ? 'scale-110' : ''}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-2 ring-offset-black/50' : ''}
                  ${isLocked ? 'bg-slate-700 text-slate-400' : ''}
                  ${isFinal ? 'bg-gradient-to-br from-amber-400 to-yellow-600' : ''}
                `}>
                  {isCompleted ? <Check className="w-5 h-5" /> : 
                   isLocked ? <Lock className="w-4 h-4" /> : 
                   scene.icon}
                </div>
                <span className={`text-[10px] mt-1 text-center max-w-[60px] truncate
                  ${isCurrent ? 'text-amber-400 font-medium' : 'text-slate-400'}
                `}>
                  {scene.name}
                </span>
                
                {/* Collected piece indicator */}
                {isCompleted && !isFinal && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 text-sm"
                  >
                    {worldData?.artifact?.pieces?.[index] || '⭐'}
                  </motion.div>
                )}
              </motion.div>
              
              {/* Connector line */}
              {index < scenes.length - 1 && (
                <div className={`w-6 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-slate-600'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ==================== ARTIFACT DISPLAY ====================

const ArtifactDisplay = ({ world, collectedPieces, totalScenes, isComplete }) => {
  const worldData = getWorldById(world);
  const artifact = worldData?.artifact;
  
  if (!artifact) return null;
  
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-amber-400">{artifact.name}</span>
        <span className="text-xs text-slate-400">{collectedPieces}/{totalScenes - 1} pieces</span>
      </div>
      
      <div className="flex items-center gap-2 justify-center">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10 }}
            className="text-5xl"
          >
            {artifact.complete}
          </motion.div>
        ) : (
          <div className="flex gap-1">
            {Array.from({ length: totalScenes - 1 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg
                  ${i < collectedPieces 
                    ? 'bg-amber-500/30 border border-amber-400' 
                    : 'bg-slate-700/50 border border-slate-600'}
                `}
              >
                {i < collectedPieces ? artifact.pieces[i] : '?'}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== NPC DIALOGUE BOX ====================

const NPCDialogue = ({ npc, message, onContinue, showContinue = true }) => {
  const npcData = getNpcById(npc);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const timer = setInterval(() => {
      if (index < message.length) {
        setDisplayedText(message.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [message]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
    >
      <div className="flex items-start gap-3">
        {/* NPC Avatar */}
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-3xl border-2 border-amber-500/50">
          {npcData?.icon || '👤'}
        </div>
        
        {/* Dialogue */}
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-400 mb-1">
            {npcData?.name || 'Stranger'}
          </p>
          <p className="text-white leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
      </div>
      
      {showContinue && !isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 flex justify-end"
        >
          <Button 
            onClick={onContinue}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700"
          >
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

// ==================== QUESTION PANEL ====================

const QuestionPanel = ({ question, onAnswer, disabled }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700"
    >
      <p className="text-lg text-white font-medium mb-4">{question.stem}</p>
      
      <div className="grid grid-cols-1 gap-2">
        {question.options?.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => onAnswer(option)}
            disabled={disabled}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              p-3 rounded-xl text-left transition-all flex items-center gap-3
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700/50'}
              bg-slate-800/80 border border-slate-600/50
            `}
          >
            <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-white">{option.text}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// ==================== FEEDBACK OVERLAY ====================

const FeedbackOverlay = ({ isCorrect, npc, onContinue, artifactPiece }) => {
  const npcData = getNpcById(npc);
  const style = npcData?.style || 'friendly';
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`max-w-md p-6 rounded-2xl ${
          isCorrect 
            ? 'bg-gradient-to-br from-green-900/90 to-emerald-900/90 border border-green-500/50' 
            : 'bg-gradient-to-br from-amber-900/90 to-orange-900/90 border border-amber-500/50'
        }`}
      >
        <div className="text-center">
          <div className="text-5xl mb-3">
            {isCorrect ? '✨' : '🤔'}
          </div>
          
          <h3 className={`text-2xl font-bold mb-3 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
            {isCorrect ? 'Correct!' : 'Not quite...'}
          </h3>
          
          <p className="text-white mb-4">
            {isCorrect 
              ? getRandomDialogue('correct', style)
              : getRandomDialogue('wrong', style)
            }
          </p>
          
          {isCorrect && artifactPiece && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="mb-4 p-3 bg-amber-500/20 rounded-xl border border-amber-400/50"
            >
              <p className="text-amber-300 text-sm mb-2">Artifact piece collected!</p>
              <span className="text-4xl">{artifactPiece}</span>
            </motion.div>
          )}
          
          <Button
            onClick={onContinue}
            className={isCorrect ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}
          >
            {isCorrect ? 'Continue Journey' : 'Try Again'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== VICTORY SCREEN ====================

const VictoryScreen = ({ world, score, totalQuestions, correctAnswers, onReplay, onExit }) => {
  const worldData = getWorldById(world);
  
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
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-amber-900/95 to-purple-950/95 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="max-w-lg p-8 text-center"
      >
        {/* Completed artifact */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-8xl mb-4"
        >
          {worldData?.artifact?.complete || '🏆'}
        </motion.div>
        
        <h2 className="text-4xl font-bold text-amber-400 mb-2">Adventure Complete!</h2>
        <p className="text-xl text-white mb-2">{worldData?.artifact?.completeMessage}</p>
        <p className="text-slate-300 mb-6">You've completed the {worldData?.name}!</p>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-black/30 rounded-xl">
            <p className="text-sm text-slate-400">Score</p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div className="p-3 bg-black/30 rounded-xl">
            <p className="text-sm text-slate-400">Accuracy</p>
            <p className="text-2xl font-bold text-green-400">
              {Math.round((correctAnswers / totalQuestions) * 100)}%
            </p>
          </div>
          <div className="p-3 bg-black/30 rounded-xl">
            <p className="text-sm text-slate-400">Questions</p>
            <p className="text-2xl font-bold text-amber-400">{correctAnswers}/{totalQuestions}</p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button onClick={onReplay} className="bg-amber-600 hover:bg-amber-700">
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button onClick={onExit} className="bg-slate-100 hover:bg-white text-slate-900">
            <Home className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ==================== ARTIFACT ASSEMBLY SCREEN ====================

const ArtifactAssemblyScreen = ({ world, pieces, onComplete }) => {
  const worldData = getWorldById(world);
  const [assembling, setAssembling] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssembling(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ffb700', '#ff9500']
      });
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-amber-400 mb-6">
          {assembling ? 'Assembling the artifact...' : 'The artifact is complete!'}
        </h2>
        
        <div className="relative h-40 flex items-center justify-center">
          {assembling ? (
            <div className="flex gap-2">
              {pieces.map((piece, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -50, rotate: Math.random() * 360 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    rotate: 0,
                    x: (pieces.length / 2 - i - 0.5) * -20
                  }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  className="text-4xl"
                >
                  {piece}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-8xl"
            >
              {worldData?.artifact?.complete}
            </motion.div>
          )}
        </div>
        
        {!assembling && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-white text-lg mb-4">{worldData?.artifact?.completeMessage}</p>
            <Button onClick={onComplete} className="bg-amber-600 hover:bg-amber-700">
              <Sparkles className="w-4 h-4 mr-2" />
              See Your Results
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ==================== MAIN ADVENTURE RUNTIME ====================

const EnhancedAdventureRuntime = ({ 
  spec, 
  onComplete, 
  onExit,
  world = 'pirate_voyage'
}) => {
  // Game configuration from spec
  const questions = spec?.content?.questions || [];
  const sceneCount = spec?.adventure_config?.scene_count || 5;
  const questionsPerScene = spec?.adventure_config?.questions_per_scene || 2;
  
  // Get world and scenes
  const worldData = getWorldById(world);
  const scenes = getWorldScenes(world, sceneCount);
  
  // Game state
  const [gamePhase, setGamePhase] = useState('intro'); // intro, exploring, questioning, feedback, assembly, victory
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [currentQuestionInScene, setCurrentQuestionInScene] = useState(0);
  const [globalQuestionIndex, setGlobalQuestionIndex] = useState(0);
  
  // Stats
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [collectedPieces, setCollectedPieces] = useState([]);
  
  // UI state
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const currentScene = scenes[currentSceneIndex];
  const currentQuestion = questions[globalQuestionIndex];
  const SceneBackground = getAdventureScene(world, currentScene?.id);
  const npcId = currentScene?.npc;
  const npcData = getNpcById(npcId);
  const isFinalScene = currentSceneIndex === scenes.length - 1;
  
  // Start exploring after intro
  useEffect(() => {
    if (gamePhase === 'intro') {
      const timer = setTimeout(() => setGamePhase('exploring'), 500);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);
  
  // Handle answer submission
  const handleAnswer = useCallback((option) => {
    const isCorrect = option.is_correct;
    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);
    
    if (isCorrect) {
      setScore(s => s + 100);
      setCorrectAnswers(c => c + 1);
    }
  }, []);
  
  // Handle continuing after feedback
  const handleContinueFeedback = useCallback(() => {
    setShowFeedback(false);
    
    if (!lastAnswerCorrect) {
      // Wrong answer - stay on same question
      return;
    }
    
    const nextQuestionInScene = currentQuestionInScene + 1;
    const nextGlobalQuestion = globalQuestionIndex + 1;
    
    // Check if scene is complete
    if (nextQuestionInScene >= questionsPerScene) {
      // Scene complete - collect artifact piece
      if (!isFinalScene) {
        const piece = worldData?.artifact?.pieces?.[currentSceneIndex] || '⭐';
        setCollectedPieces(prev => [...prev, piece]);
      }
      
      // Move to next scene
      const nextScene = currentSceneIndex + 1;
      
      if (nextScene >= scenes.length) {
        // All scenes complete - show assembly
        setGamePhase('assembly');
      } else {
        setCurrentSceneIndex(nextScene);
        setCurrentQuestionInScene(0);
        setGlobalQuestionIndex(nextGlobalQuestion);
        setGamePhase('exploring');
      }
    } else {
      // More questions in this scene
      setCurrentQuestionInScene(nextQuestionInScene);
      setGlobalQuestionIndex(nextGlobalQuestion);
    }
  }, [lastAnswerCorrect, currentQuestionInScene, globalQuestionIndex, questionsPerScene, currentSceneIndex, scenes.length, isFinalScene, worldData]);
  
  // Handle NPC dialogue continue
  const handleDialogueContinue = useCallback(() => {
    setGamePhase('questioning');
  }, []);
  
  // Handle assembly complete
  const handleAssemblyComplete = useCallback(() => {
    setGamePhase('victory');
    onComplete?.({
      score,
      accuracy: Math.round((correctAnswers / questions.length) * 100),
      correctAnswers,
      questionsAnswered: questions.length,
      totalQuestions: questions.length
    });
  }, [score, correctAnswers, questions.length, onComplete]);
  
  // Handle restart
  const handleRestart = useCallback(() => {
    setGamePhase('intro');
    setCurrentSceneIndex(0);
    setCurrentQuestionInScene(0);
    setGlobalQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setCollectedPieces([]);
    setLastAnswerCorrect(null);
    setShowFeedback(false);
  }, []);

  return (
    <div className="relative w-full h-[650px] rounded-2xl overflow-hidden shadow-2xl">
      {/* Scene Background */}
      <div className="absolute inset-0">
        <SceneBackground />
      </div>
      
      {/* Top UI - Journey Map & Artifact */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <JourneyMap 
          world={world}
          scenes={scenes}
          currentSceneIndex={currentSceneIndex}
          collectedPieces={collectedPieces}
        />
        <ArtifactDisplay 
          world={world}
          collectedPieces={collectedPieces.length}
          totalScenes={scenes.length}
          isComplete={gamePhase === 'victory'}
        />
      </div>
      
      {/* Bottom UI - Dialogue & Questions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        {gamePhase === 'exploring' && currentScene && (
          <NPCDialogue 
            npc={npcId}
            message={getRandomDialogue('intro', npcData?.style || 'friendly')}
            onContinue={handleDialogueContinue}
          />
        )}
        
        {gamePhase === 'questioning' && currentQuestion && (
          <QuestionPanel 
            question={currentQuestion}
            onAnswer={handleAnswer}
            disabled={showFeedback}
          />
        )}
      </div>
      
      {/* Character in scene */}
      <div className="absolute bottom-[200px] left-8 z-10">
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-5xl"
        >
          🧑‍🎤
        </motion.div>
      </div>
      
      {/* NPC in scene */}
      {gamePhase !== 'victory' && gamePhase !== 'assembly' && (
        <div className="absolute bottom-[200px] right-8 z-10">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-5xl"
          >
            {npcData?.icon || '👤'}
          </motion.div>
        </div>
      )}
      
      {/* Score display */}
      <div className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-bold">{score}</span>
        </div>
      </div>
      
      {/* Feedback overlay */}
      <AnimatePresence>
        {showFeedback && (
          <FeedbackOverlay 
            isCorrect={lastAnswerCorrect}
            npc={npcId}
            onContinue={handleContinueFeedback}
            artifactPiece={lastAnswerCorrect && currentQuestionInScene === questionsPerScene - 1 && !isFinalScene 
              ? worldData?.artifact?.pieces?.[currentSceneIndex] 
              : null}
          />
        )}
      </AnimatePresence>
      
      {/* Assembly screen */}
      {gamePhase === 'assembly' && (
        <ArtifactAssemblyScreen 
          world={world}
          pieces={collectedPieces}
          onComplete={handleAssemblyComplete}
        />
      )}
      
      {/* Victory screen */}
      {gamePhase === 'victory' && (
        <VictoryScreen 
          world={world}
          score={score}
          totalQuestions={questions.length}
          correctAnswers={correctAnswers}
          onReplay={handleRestart}
          onExit={onExit}
        />
      )}
    </div>
  );
};

export default EnhancedAdventureRuntime;
