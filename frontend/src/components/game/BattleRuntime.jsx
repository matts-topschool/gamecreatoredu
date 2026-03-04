/**
 * BattleRuntime - Battle-style game runtime where players defeat monsters by answering questions.
 * Features: Enemy health bar, damage animations, combo system, battle feedback.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Swords, 
  Shield,
  Star, 
  Zap, 
  Heart,
  Trophy,
  Clock,
  Flame,
  Skull,
  ArrowRight,
  RotateCcw,
  Home,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

const SCENES = {
  TITLE: 'title',
  BATTLE: 'battle',
  ATTACK: 'attack',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
};

/**
 * Enemy character component with health bar
 */
const EnemyCharacter = ({ enemy, currentHealth, maxHealth, isHurt, isDefeated }) => {
  const healthPercent = (currentHealth / maxHealth) * 100;
  
  return (
    <div className={cn(
      "relative transition-all duration-300",
      isHurt && "animate-shake",
      isDefeated && "opacity-50 grayscale"
    )}>
      {/* Enemy Sprite */}
      <div className={cn(
        "w-32 h-32 mx-auto rounded-2xl flex items-center justify-center text-6xl",
        "bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/30",
        isHurt && "bg-gradient-to-br from-red-600 to-red-800"
      )}>
        {isDefeated ? "💀" : "👹"}
      </div>
      
      {/* Enemy Name */}
      <h3 className="text-center text-white font-bold mt-3 text-lg">
        {enemy?.name || "Monster"}
      </h3>
      
      {/* Health Bar */}
      <div className="mt-2 px-4">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>HP</span>
          <span>{Math.max(0, currentHealth)} / {maxHealth}</span>
        </div>
        <div className="h-4 bg-black/30 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              healthPercent > 50 ? "bg-gradient-to-r from-green-400 to-green-500" :
              healthPercent > 25 ? "bg-gradient-to-r from-yellow-400 to-orange-500" :
              "bg-gradient-to-r from-red-500 to-red-600"
            )}
            style={{ width: `${healthPercent}%` }}
          />
        </div>
      </div>
      
      {/* Taunt Message */}
      {!isDefeated && enemy?.taunt_messages && (
        <p className="text-center text-white/60 text-sm mt-2 italic">
          "{enemy.taunt_messages[Math.floor(Math.random() * enemy.taunt_messages.length)]}"
        </p>
      )}
    </div>
  );
};

/**
 * Damage popup animation
 */
const DamagePopup = ({ damage, isCombo, position }) => {
  return (
    <div 
      className={cn(
        "absolute animate-float-up text-2xl font-bold",
        isCombo ? "text-yellow-300" : "text-white"
      )}
      style={{ left: position.x, top: position.y }}
    >
      -{damage}
      {isCombo && <Zap className="inline w-5 h-5 ml-1" />}
    </div>
  );
};

/**
 * Title Scene - Battle intro
 */
const TitleScene = ({ spec, enemy, onStart }) => {
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl text-white">
      <div className="text-center space-y-6">
        {/* Enemy Preview */}
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center text-5xl shadow-lg shadow-red-500/30">
          👹
        </div>
        
        <div>
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 mb-3">
            <Swords className="w-3 h-3 mr-1" />
            Monster Battle
          </Badge>
          <h1 className="text-4xl font-bold font-outfit mb-2">
            {spec?.meta?.title || 'Battle Mode'}
          </h1>
          <p className="text-white/70 max-w-md mx-auto">
            Defeat <span className="text-red-400 font-semibold">{enemy?.name || "the Monster"}</span> by 
            answering questions correctly!
          </p>
        </div>

        <div className="bg-black/30 rounded-lg p-4 max-w-sm mx-auto">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Battle Rules
          </h4>
          <ul className="text-sm text-white/70 space-y-1 text-left">
            <li>• Correct answers deal damage</li>
            <li>• Faster answers = bonus damage</li>
            <li>• Build combos for multiplied damage</li>
            <li>• Defeat the monster to win!</li>
          </ul>
        </div>

        <Button 
          onClick={onStart}
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-6 h-auto"
          data-testid="start-battle-btn"
        >
          <Swords className="w-5 h-5 mr-2" />
          Begin Battle
        </Button>
      </div>
    </div>
  );
};

/**
 * Battle Scene - Main gameplay
 */
const BattleScene = ({ 
  spec,
  enemy,
  enemyHealth,
  maxEnemyHealth,
  question, 
  questionIndex, 
  totalQuestions,
  state,
  onAnswer,
  onHint
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hintVisible, setHintVisible] = useState(false);
  const [isEnemyHurt, setIsEnemyHurt] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0) {
          onAnswer(null, 0);
          return 30;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [question?.id, onAnswer]);

  // Reset on new question
  useEffect(() => {
    setSelectedAnswer(null);
    setHintVisible(false);
    setTimeLeft(30);
  }, [question?.id]);

  const handleSelectAnswer = (optionId) => {
    if (selectedAnswer) return;
    setSelectedAnswer(optionId);
    
    const isCorrect = question.options?.find(o => o.id === optionId)?.is_correct;
    if (isCorrect) {
      setIsEnemyHurt(true);
      setTimeout(() => setIsEnemyHurt(false), 500);
    }
    
    setTimeout(() => {
      onAnswer(optionId, 30 - timeLeft);
    }, 300);
  };

  if (!question) return null;

  const settings = spec?.settings || {};

  return (
    <div className="min-h-[500px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6" data-testid="battle-scene">
      {/* HUD */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <Star className="w-3 h-3 mr-1" />
            {state.score}
          </Badge>
          {state.combo > 0 && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              {state.combo}x Combo!
            </Badge>
          )}
        </div>
        
        <Badge 
          className={cn(
            "border-0",
            timeLeft <= 10 ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white/70"
          )}
        >
          <Clock className="w-3 h-3 mr-1" />
          {timeLeft}s
        </Badge>
      </div>

      {/* Enemy */}
      <div className="mb-6">
        <EnemyCharacter 
          enemy={enemy}
          currentHealth={enemyHealth}
          maxHealth={maxEnemyHealth}
          isHurt={isEnemyHurt}
          isDefeated={enemyHealth <= 0}
        />
      </div>

      {/* Question */}
      <div className="bg-black/30 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white/50">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <p className="text-white text-lg font-medium">{question.stem}</p>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {question.options?.map((option, i) => (
          <button
            key={option.id}
            onClick={() => handleSelectAnswer(option.id)}
            disabled={selectedAnswer !== null}
            className={cn(
              "p-4 text-left rounded-xl border-2 transition-all text-white",
              "bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40",
              selectedAnswer === option.id && "border-yellow-400 bg-yellow-400/20",
              selectedAnswer !== null && selectedAnswer !== option.id && "opacity-50"
            )}
            data-testid={`battle-option-${option.id}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-medium">{option.text}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Hint */}
      {settings.allow_hints && question.hints?.length > 0 && (
        <div className="text-center">
          {!hintVisible ? (
            <Button 
              variant="ghost" 
              onClick={() => { setHintVisible(true); onHint?.(); }}
              className="text-yellow-400 hover:text-yellow-300"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Use Hint
            </Button>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-left">
              <p className="text-sm text-yellow-200">
                <strong>Hint:</strong> {question.hints[0]}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Attack Result Scene - Shows damage dealt
 */
const AttackScene = ({ 
  question,
  selectedAnswer, 
  isCorrect, 
  damage,
  combo,
  enemyHealth,
  maxEnemyHealth,
  showExplanation,
  onContinue 
}) => {
  useEffect(() => {
    if (isCorrect && damage > 0) {
      // Attack effect
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.4 },
        colors: ['#ef4444', '#f97316', '#eab308']
      });
    }
  }, [isCorrect, damage]);

  const correctOption = question?.options?.find(o => o.is_correct);

  return (
    <div 
      className={cn(
        "min-h-[500px] flex flex-col items-center justify-center p-8 rounded-2xl",
        isCorrect 
          ? "bg-gradient-to-br from-emerald-900 to-green-900" 
          : "bg-gradient-to-br from-red-900 to-rose-900"
      )}
      data-testid="attack-scene"
    >
      <div className="text-center space-y-6 max-w-lg">
        {/* Result Icon */}
        <div className={cn(
          "w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl",
          isCorrect ? "bg-emerald-500/30" : "bg-red-500/30"
        )}>
          {isCorrect ? "⚔️" : "🛡️"}
        </div>

        {/* Message */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isCorrect ? (
              combo > 1 ? `${combo}x Combo Attack!` : 'Direct Hit!'
            ) : (
              'Attack Missed!'
            )}
          </h2>
          
          {isCorrect && damage > 0 && (
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-red-500 text-white border-0 text-xl px-4 py-2">
                <Flame className="w-5 h-5 mr-2" />
                -{damage} Damage
              </Badge>
            </div>
          )}
        </div>

        {/* Enemy Status */}
        <div className="bg-black/30 rounded-lg p-4">
          <p className="text-white/70 text-sm mb-2">Enemy Health</p>
          <div className="flex items-center gap-3">
            <Progress 
              value={(enemyHealth / maxEnemyHealth) * 100} 
              className="flex-1 h-4"
            />
            <span className="text-white font-bold">
              {Math.max(0, enemyHealth)} / {maxEnemyHealth}
            </span>
          </div>
        </div>

        {/* Wrong Answer Info */}
        {!isCorrect && correctOption && (
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <p className="text-white/70 text-sm mb-1">Correct answer:</p>
            <p className="text-white font-semibold">{correctOption.text}</p>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && question?.explanation && (
          <div className="bg-black/30 rounded-lg p-4 text-left">
            <p className="text-white/70 text-sm mb-1">Explanation:</p>
            <p className="text-white">{question.explanation}</p>
          </div>
        )}

        {/* Continue */}
        <Button 
          onClick={onContinue}
          size="lg"
          className={cn(
            "text-white",
            isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
          )}
          data-testid="battle-continue-btn"
        >
          Continue Battle
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

/**
 * Victory Scene - Monster defeated
 */
const VictoryScene = ({ enemy, state, totalQuestions, onReplay, onExit }) => {
  const accuracy = totalQuestions > 0 
    ? Math.round((state.correctAnswers / totalQuestions) * 100) 
    : 0;

  useEffect(() => {
    // Epic celebration
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#eab308', '#ef4444']
      });
      confetti({
        particleCount: 10,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#eab308', '#ef4444']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div 
      className="min-h-[500px] flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-yellow-600 via-orange-600 to-red-600 text-white"
      data-testid="battle-victory-scene"
    >
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🏆</div>

        <div>
          <h1 className="text-4xl font-bold font-outfit mb-2">VICTORY!</h1>
          <p className="text-white/80">
            You defeated <span className="font-bold">{enemy?.name || "the Monster"}</span>!
          </p>
          {enemy?.defeat_message && (
            <p className="text-white/60 italic mt-2">"{enemy.defeat_message}"</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-3xl font-bold">{state.score}</p>
            <p className="text-xs text-white/70 uppercase">Total Damage</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-3xl font-bold">{accuracy}%</p>
            <p className="text-xs text-white/70 uppercase">Accuracy</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4">
            <p className="text-3xl font-bold">{state.maxCombo}x</p>
            <p className="text-xs text-white/70 uppercase">Max Combo</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button 
            onClick={onReplay}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Battle Again
          </Button>
          <Button 
            onClick={onExit}
            className="bg-white text-slate-900 hover:bg-white/90"
            data-testid="battle-exit-btn"
          >
            <Home className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * BattleRuntime - Main component
 */
const BattleRuntime = ({ 
  spec, 
  onComplete, 
  onExit,
  playerId,
  playerName
}) => {
  const [scene, setScene] = useState(SCENES.TITLE);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [lastDamage, setLastDamage] = useState(0);
  
  // Enemy state
  const enemy = spec?.entities?.enemy || { name: "Knowledge Monster", health: { max: 100 } };
  const maxEnemyHealth = enemy?.health?.max || 100;
  const [enemyHealth, setEnemyHealth] = useState(maxEnemyHealth);
  
  // Battle config
  const battleConfig = spec?.battle_config || {
    damage_per_correct: 10,
    bonus_damage_per_combo: 5,
    speed_bonus_threshold_seconds: 5,
    speed_bonus_damage: 5
  };
  
  // Player stats
  const [state, setState] = useState({
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctAnswers: 0,
    hintsUsed: 0
  });

  // Questions
  const questions = useMemo(() => {
    const q = spec?.content?.questions || [];
    if (spec?.settings?.shuffle_questions) {
      return [...q].sort(() => Math.random() - 0.5);
    }
    return q;
  }, [spec]);

  const currentQuestion = questions[questionIndex];
  const settings = spec?.settings || {};

  const handleStart = () => {
    setScene(SCENES.BATTLE);
    setEnemyHealth(maxEnemyHealth);
    setState({
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctAnswers: 0,
      hintsUsed: 0
    });
    setQuestionIndex(0);
  };

  const handleAnswer = useCallback((answerId, responseTime) => {
    if (!currentQuestion) return;

    const isCorrect = currentQuestion.options?.find(o => o.id === answerId)?.is_correct || false;
    setSelectedAnswer(answerId);
    setLastAnswerCorrect(isCorrect);

    let damage = 0;
    if (isCorrect) {
      // Calculate damage
      damage = battleConfig.damage_per_correct;
      damage += state.combo * battleConfig.bonus_damage_per_combo;
      if (responseTime < battleConfig.speed_bonus_threshold_seconds) {
        damage += battleConfig.speed_bonus_damage;
      }
      
      setEnemyHealth(h => Math.max(0, h - damage));
    }
    setLastDamage(damage);

    // Update state
    setState(prev => {
      const newCombo = isCorrect ? prev.combo + 1 : 0;
      return {
        ...prev,
        score: prev.score + damage,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0)
      };
    });

    setScene(SCENES.ATTACK);
  }, [currentQuestion, state.combo, battleConfig]);

  const handleContinue = () => {
    // Check if enemy is defeated
    if (enemyHealth <= 0) {
      setScene(SCENES.VICTORY);
      onComplete?.({
        ...state,
        questionsAnswered: questionIndex + 1,
        enemyDefeated: true
      });
      return;
    }

    // Check if out of questions
    if (questionIndex + 1 >= questions.length) {
      // Ran out of questions but enemy still alive - partial victory
      setScene(SCENES.VICTORY);
      onComplete?.({
        ...state,
        questionsAnswered: questions.length,
        enemyDefeated: enemyHealth <= 0
      });
      return;
    }

    // Next question
    setQuestionIndex(i => i + 1);
    setSelectedAnswer(null);
    setScene(SCENES.BATTLE);
  };

  const handleReplay = () => {
    setScene(SCENES.TITLE);
  };

  const handleHint = () => {
    setState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
  };

  // Render scene
  const renderScene = () => {
    switch (scene) {
      case SCENES.TITLE:
        return <TitleScene spec={spec} enemy={enemy} onStart={handleStart} />;
      
      case SCENES.BATTLE:
        return (
          <BattleScene
            spec={spec}
            enemy={enemy}
            enemyHealth={enemyHealth}
            maxEnemyHealth={maxEnemyHealth}
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={questions.length}
            state={state}
            onAnswer={handleAnswer}
            onHint={handleHint}
          />
        );
      
      case SCENES.ATTACK:
        return (
          <AttackScene
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            isCorrect={lastAnswerCorrect}
            damage={lastDamage}
            combo={state.combo}
            enemyHealth={enemyHealth}
            maxEnemyHealth={maxEnemyHealth}
            showExplanation={settings.show_explanation}
            onContinue={handleContinue}
          />
        );
      
      case SCENES.VICTORY:
        return (
          <VictoryScene
            enemy={enemy}
            state={state}
            totalQuestions={questions.length}
            onReplay={handleReplay}
            onExit={onExit}
          />
        );
      
      default:
        return <TitleScene spec={spec} enemy={enemy} onStart={handleStart} />;
    }
  };

  return (
    <div className="battle-runtime" data-testid="battle-runtime">
      {renderScene()}
    </div>
  );
};

export default BattleRuntime;
