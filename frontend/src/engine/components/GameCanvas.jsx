/**
 * GameCanvas - React component wrapper for the game engine
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameWorld } from './GameWorld';

/**
 * Main game canvas component
 */
export const GameCanvas = ({
  spec,
  sessionId,
  playerId,
  playerName,
  paused = false,
  onEvent,
  onStateChange,
  onQuestionTrigger,
  onGameEnd,
  className = ''
}) => {
  const containerRef = useRef(null);
  const worldRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  // Initialize game world
  useEffect(() => {
    if (!containerRef.current || !spec) return;

    try {
      const world = new GameWorld(containerRef.current, spec, {
        sessionId,
        playerId,
        playerName,
        onEvent: (event) => {
          handleEvent(event);
          onEvent?.(event);
        },
        onStateChange: (change) => {
          onStateChange?.(change);
        },
        onQuestionTrigger: (pool) => {
          onQuestionTrigger?.(pool);
        }
      });

      worldRef.current = world;
      world.start();
      setIsReady(true);

      return () => {
        world.destroy();
        worldRef.current = null;
      };
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError(err.message);
    }
  }, [spec, sessionId, playerId, playerName]);

  // Handle pause state
  useEffect(() => {
    if (!worldRef.current) return;

    if (paused) {
      worldRef.current.pause();
    } else {
      worldRef.current.resume();
    }
  }, [paused]);

  // Handle game events internally
  const handleEvent = useCallback((event) => {
    switch (event.type) {
      case 'game_end':
        const stats = worldRef.current?.getPlayerStats();
        onGameEnd?.(stats);
        break;
      case 'entity_health_zero':
        // Could trigger game over if player
        break;
      default:
        break;
    }
  }, [onGameEnd]);

  // External API methods
  const getWorld = useCallback(() => worldRef.current, []);
  
  const handleAnswer = useCallback((result) => {
    worldRef.current?.handleAnswer(result);
  }, []);

  const getState = useCallback(() => {
    return worldRef.current?.getFullState() || {};
  }, []);

  const getStats = useCallback(() => {
    return worldRef.current?.getPlayerStats() || {};
  }, []);

  // Expose methods via ref
  React.useImperativeHandle(
    React.useRef(),
    () => ({
      getWorld,
      handleAnswer,
      getState,
      getStats,
      pause: () => worldRef.current?.pause(),
      resume: () => worldRef.current?.resume(),
      emit: (event) => worldRef.current?.emit(event)
    }),
    [getWorld, handleAnswer, getState, getStats]
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-red-400 p-4">
        <div className="text-center">
          <p className="font-bold mb-2">Failed to load game</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`game-canvas-container relative ${className}`}
      data-testid="game-canvas"
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        background: '#1a1a2e'
      }}
    >
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading game...</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * GameCanvas with question overlay and HUD
 */
export const GamePlayer = ({
  spec,
  sessionId,
  playerId,
  playerName,
  questions = [],
  leaderboardConfig = null,
  onSessionEvent,
  onGameComplete
}) => {
  const canvasRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameState, setGameState] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  // Question pool
  const [questionIndex, setQuestionIndex] = useState(0);
  const questionPool = useRef([...questions]);

  const handleQuestionTrigger = useCallback((pool) => {
    if (questionPool.current.length === 0) return;

    // Get next question
    const question = questionPool.current[questionIndex % questionPool.current.length];
    setCurrentQuestion(question);
    setQuestionStartTime(Date.now());
    setIsPaused(true);
  }, [questionIndex]);

  const handleAnswer = useCallback((answerId) => {
    if (!currentQuestion) return;

    const timeMs = Date.now() - questionStartTime;
    const isCorrect = currentQuestion.options.find(o => o.id === answerId)?.isCorrect || false;
    
    // Calculate speed bonus
    let speedBonus = 0;
    if (isCorrect && timeMs < 2000) {
      speedBonus = Math.floor((2000 - timeMs) / 100);
    }

    const result = {
      questionId: currentQuestion.id,
      answerId,
      isCorrect,
      timeMs,
      pointsEarned: isCorrect ? 10 : 0,
      speedBonus,
      feedback: isCorrect 
        ? 'Correct!' 
        : currentQuestion.aiFeedback?.[answerId] || 'Try again!'
    };

    // Send to game engine
    canvasRef.current?.handleAnswer?.(result);

    // Send to session if connected
    onSessionEvent?.({
      type: 'answer_submitted',
      data: {
        ...result,
        playerName
      }
    });

    setCurrentQuestion(null);
    setIsPaused(false);
    setQuestionIndex(i => i + 1);
  }, [currentQuestion, questionStartTime, playerName, onSessionEvent]);

  const handleStateChange = useCallback((change) => {
    setGameState(change.state);
  }, []);

  const handleGameEnd = useCallback((stats) => {
    onGameComplete?.(stats);
  }, [onGameComplete]);

  return (
    <div className="game-player relative w-full h-full" data-testid="game-player">
      {/* Main game canvas */}
      <GameCanvas
        ref={canvasRef}
        spec={spec}
        sessionId={sessionId}
        playerId={playerId}
        playerName={playerName}
        paused={isPaused}
        onStateChange={handleStateChange}
        onQuestionTrigger={handleQuestionTrigger}
        onGameEnd={handleGameEnd}
      />

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* Score */}
          <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
            <div className="text-xs text-slate-400 uppercase tracking-wide">Score</div>
            <div className="text-2xl font-bold font-mono">{gameState.score || 0}</div>
          </div>

          {/* Combo */}
          {(gameState.combo || 0) > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-4 py-2 text-white animate-pulse">
              <div className="text-xs uppercase tracking-wide">Combo</div>
              <div className="text-2xl font-bold">x{gameState.combo}</div>
            </div>
          )}

          {/* Leaderboard toggle */}
          {leaderboardConfig?.enabled && (
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="pointer-events-auto bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 text-white hover:bg-black/70 transition"
            >
              <span className="text-sm">Leaderboard</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Overlay */}
      {currentQuestion && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-scale-in">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              {currentQuestion.stem}
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className="p-4 text-left bg-slate-100 hover:bg-violet-100 hover:border-violet-300 border-2 border-transparent rounded-xl transition-all font-medium"
                  data-testid={`answer-${option.id}`}
                >
                  {option.text}
                </button>
              ))}
            </div>

            {currentQuestion.hints?.length > 0 && (
              <button className="mt-4 text-sm text-violet-600 hover:text-violet-700">
                Need a hint?
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mini Leaderboard */}
      {showLeaderboard && leaderboardConfig?.enabled && (
        <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white w-64 z-10">
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide">Leaderboard</h4>
          <div className="text-center text-slate-400 text-sm">
            Live leaderboard coming soon
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
