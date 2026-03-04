/**
 * GameRuntime - Lightweight quiz game runtime component.
 * Renders playable games from GameSpec without heavy 2D engine dependencies.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Gamepad2, 
  Star, 
  Zap, 
  Heart,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

/**
 * Game Scenes - Different phases of the game
 */
const SCENES = {
  TITLE: 'title',
  GAMEPLAY: 'gameplay',
  QUESTION: 'question',
  FEEDBACK: 'feedback',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
};

/**
 * TitleScene - Start screen
 */
const TitleScene = ({ spec, onStart }) => {
  const meta = spec?.meta || {};
  const gameType = meta.game_type || 'quiz';
  
  const bgGradients = {
    quiz: 'from-violet-600 to-indigo-700',
    battle: 'from-red-600 to-orange-600',
    adventure: 'from-emerald-600 to-teal-600',
    platformer: 'from-blue-600 to-cyan-600',
    puzzle: 'from-amber-600 to-yellow-600',
    simulation: 'from-pink-600 to-rose-600',
  };

  return (
    <div 
      className={cn(
        "min-h-[500px] flex flex-col items-center justify-center p-8 rounded-2xl text-white",
        "bg-gradient-to-br",
        bgGradients[gameType] || bgGradients.quiz
      )}
      data-testid="title-scene"
    >
      <div className="text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <Gamepad2 className="w-12 h-12" />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold font-outfit mb-2">
            {meta.title || 'Educational Game'}
          </h1>
          <p className="text-white/80 max-w-md mx-auto">
            {meta.description}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {meta.educational?.grade_levels?.map(g => (
            <Badge key={g} className="bg-white/20 text-white border-0">
              Grade {g}
            </Badge>
          ))}
          {meta.educational?.subjects?.map(s => (
            <Badge key={s} className="bg-white/20 text-white border-0 capitalize">
              {s}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-white/70">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            {spec?.content?.questions?.length || 0} Questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            ~{meta.gameplay?.estimated_duration_minutes || 10} min
          </span>
        </div>

        <Button 
          onClick={onStart}
          size="lg"
          className="bg-white text-slate-900 hover:bg-white/90 text-lg px-8 py-6 h-auto"
          data-testid="start-game-btn"
        >
          Start Game
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

/**
 * QuestionScene - Question display and answer selection
 */
const QuestionScene = ({ 
  question, 
  questionIndex, 
  totalQuestions,
  state,
  showHints,
  onAnswer,
  onHint
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0) {
          onAnswer(null, 0); // Time's up, wrong answer
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
    if (selectedAnswer) return; // Already answered
    
    setSelectedAnswer(optionId);
    const startTime = Date.now();
    
    // Small delay for visual feedback
    setTimeout(() => {
      onAnswer(optionId, 30 - timeLeft);
    }, 300);
  };

  if (!question) return null;

  return (
    <div className="min-h-[500px] p-6" data-testid="question-scene">
      {/* Progress & Stats Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge className="bg-violet-100 text-violet-700 border-0">
            <Star className="w-3 h-3 mr-1" />
            {state.score}
          </Badge>
          {state.combo > 0 && (
            <Badge className="bg-orange-100 text-orange-700 border-0 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              {state.combo}x Combo
            </Badge>
          )}
        </div>
        
        <Badge 
          variant="outline"
          className={cn(
            "transition-colors",
            timeLeft <= 10 && "bg-red-100 text-red-700 border-red-200"
          )}
        >
          <Clock className="w-3 h-3 mr-1" />
          {timeLeft}s
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {questionIndex + 1} of {totalQuestions}</span>
          <span>{Math.round((questionIndex / totalQuestions) * 100)}%</span>
        </div>
        <Progress value={(questionIndex / totalQuestions) * 100} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-lg font-bold">
              {questionIndex + 1}
            </span>
            <div>
              <p className="text-xl font-medium text-slate-800">{question.stem}</p>
              {question.difficulty && (
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-4 h-4",
                        i < question.difficulty ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {question.options?.map((option, i) => (
          <button
            key={option.id}
            onClick={() => handleSelectAnswer(option.id)}
            disabled={selectedAnswer !== null}
            className={cn(
              "p-4 text-left rounded-xl border-2 transition-all",
              "hover:border-violet-300 hover:bg-violet-50",
              selectedAnswer === option.id && "border-violet-500 bg-violet-100",
              selectedAnswer !== null && selectedAnswer !== option.id && "opacity-50",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            )}
            data-testid={`answer-option-${option.id}`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="font-medium">{option.text}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Hint Button */}
      {showHints && question.hints?.length > 0 && (
        <div className="text-center">
          {!hintVisible ? (
            <Button 
              variant="ghost" 
              onClick={() => { setHintVisible(true); onHint?.(); }}
              className="text-violet-600"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Need a hint?
            </Button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <p className="text-sm text-amber-800">
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
 * FeedbackScene - Show result of answer
 */
const FeedbackScene = ({ 
  question, 
  selectedAnswer, 
  isCorrect, 
  pointsEarned,
  showExplanation,
  onContinue 
}) => {
  useEffect(() => {
    if (isCorrect) {
      // Celebrate correct answer
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [isCorrect]);

  const correctOption = question?.options?.find(o => o.is_correct);

  return (
    <div 
      className={cn(
        "min-h-[500px] flex flex-col items-center justify-center p-8 rounded-2xl",
        isCorrect ? "bg-emerald-50" : "bg-red-50"
      )}
      data-testid="feedback-scene"
    >
      <div className="text-center space-y-6 max-w-lg">
        {/* Icon */}
        <div className={cn(
          "w-24 h-24 mx-auto rounded-full flex items-center justify-center",
          isCorrect ? "bg-emerald-100" : "bg-red-100"
        )}>
          {isCorrect ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          ) : (
            <XCircle className="w-12 h-12 text-red-600" />
          )}
        </div>

        {/* Message */}
        <div>
          <h2 className={cn(
            "text-3xl font-bold font-outfit mb-2",
            isCorrect ? "text-emerald-700" : "text-red-700"
          )}>
            {isCorrect ? 'Correct!' : 'Not Quite!'}
          </h2>
          {isCorrect && pointsEarned > 0 && (
            <Badge className="bg-emerald-200 text-emerald-800 border-0 text-lg px-3 py-1">
              +{pointsEarned} points
            </Badge>
          )}
        </div>

        {/* Correct Answer (if wrong) */}
        {!isCorrect && correctOption && (
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <p className="text-sm text-slate-500 mb-1">The correct answer was:</p>
            <p className="font-semibold text-slate-800">{correctOption.text}</p>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && question?.explanation && (
          <div className="bg-white rounded-lg p-4 border text-left">
            <p className="text-sm text-slate-500 mb-1">Explanation:</p>
            <p className="text-slate-700">{question.explanation}</p>
          </div>
        )}

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          size="lg"
          className={cn(
            "text-white",
            isCorrect ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
          )}
          data-testid="continue-btn"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

/**
 * VictoryScene - Game complete screen
 */
const VictoryScene = ({ state, totalQuestions, onReplay, onExit }) => {
  const accuracy = totalQuestions > 0 
    ? Math.round((state.correctAnswers / totalQuestions) * 100) 
    : 0;

  useEffect(() => {
    // Big celebration!
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8b5cf6', '#ec4899', '#f59e0b']
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8b5cf6', '#ec4899', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const getMessage = () => {
    if (accuracy === 100) return "Perfect Score! You're a genius!";
    if (accuracy >= 80) return "Excellent work! Great job!";
    if (accuracy >= 60) return "Good effort! Keep practicing!";
    return "Nice try! Practice makes perfect!";
  };

  return (
    <div 
      className="min-h-[500px] flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white"
      data-testid="victory-scene"
    >
      <div className="text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-white/20 rounded-2xl flex items-center justify-center">
          <Trophy className="w-12 h-12" />
        </div>

        <div>
          <h1 className="text-4xl font-bold font-outfit mb-2">Game Complete!</h1>
          <p className="text-white/80">{getMessage()}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-3xl font-bold">{state.score}</p>
            <p className="text-xs text-white/70 uppercase">Score</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-3xl font-bold">{accuracy}%</p>
            <p className="text-xs text-white/70 uppercase">Accuracy</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-3xl font-bold">{state.maxCombo}x</p>
            <p className="text-xs text-white/70 uppercase">Best Combo</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button 
            onClick={onReplay}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
          <Button 
            onClick={onExit}
            className="bg-white text-slate-900 hover:bg-white/90"
            data-testid="exit-game-btn"
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
 * GameRuntime - Main game runtime component
 */
const GameRuntime = ({ 
  spec, 
  onComplete, 
  onExit,
  sessionId,
  playerId,
  playerName
}) => {
  // Game state
  const [scene, setScene] = useState(SCENES.TITLE);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  // Game stats
  const [state, setState] = useState({
    score: 0,
    combo: 0,
    maxCombo: 0,
    correctAnswers: 0,
    hintsUsed: 0,
    totalTime: 0
  });

  // Get questions (shuffle if enabled)
  const questions = useMemo(() => {
    const q = spec?.content?.questions || [];
    if (spec?.settings?.shuffle_questions) {
      return [...q].sort(() => Math.random() - 0.5);
    }
    return q;
  }, [spec]);

  const currentQuestion = questions[questionIndex];
  const settings = spec?.settings || {};

  // Start game
  const handleStart = () => {
    setScene(SCENES.QUESTION);
    setState({
      score: 0,
      combo: 0,
      maxCombo: 0,
      correctAnswers: 0,
      hintsUsed: 0,
      totalTime: 0
    });
    setQuestionIndex(0);
  };

  // Handle answer
  const handleAnswer = useCallback((answerId, responseTime) => {
    if (!currentQuestion) return;

    const isCorrect = currentQuestion.options?.find(o => o.id === answerId)?.is_correct || false;
    setSelectedAnswer(answerId);
    setLastAnswerCorrect(isCorrect);

    // Calculate points
    let points = 0;
    if (isCorrect) {
      const basePoints = 10;
      const comboBonus = Math.floor(state.combo * 2);
      const speedBonus = responseTime < 10 ? Math.floor((10 - responseTime)) : 0;
      points = basePoints + comboBonus + speedBonus;
    }
    setPointsEarned(points);

    // Update state
    setState(prev => {
      const newCombo = isCorrect ? prev.combo + 1 : 0;
      return {
        ...prev,
        score: prev.score + points,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0)
      };
    });

    setScene(SCENES.FEEDBACK);
  }, [currentQuestion, state.combo]);

  // Continue to next question
  const handleContinue = () => {
    if (questionIndex + 1 >= questions.length) {
      // Game complete
      setScene(SCENES.VICTORY);
      onComplete?.({
        ...state,
        questionsAnswered: questions.length
      });
    } else {
      setQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setScene(SCENES.QUESTION);
    }
  };

  // Replay game
  const handleReplay = () => {
    setScene(SCENES.TITLE);
  };

  // Handle hint
  const handleHint = () => {
    setState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1
    }));
  };

  // Render current scene
  const renderScene = () => {
    switch (scene) {
      case SCENES.TITLE:
        return <TitleScene spec={spec} onStart={handleStart} />;
      
      case SCENES.QUESTION:
        return (
          <QuestionScene
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={questions.length}
            state={state}
            showHints={settings.allow_hints}
            onAnswer={handleAnswer}
            onHint={handleHint}
          />
        );
      
      case SCENES.FEEDBACK:
        return (
          <FeedbackScene
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            isCorrect={lastAnswerCorrect}
            pointsEarned={pointsEarned}
            showExplanation={settings.show_explanation}
            onContinue={handleContinue}
          />
        );
      
      case SCENES.VICTORY:
        return (
          <VictoryScene
            state={state}
            totalQuestions={questions.length}
            onReplay={handleReplay}
            onExit={onExit}
          />
        );
      
      default:
        return <TitleScene spec={spec} onStart={handleStart} />;
    }
  };

  return (
    <div 
      className="game-runtime relative bg-slate-100 rounded-2xl overflow-hidden"
      data-testid="game-runtime"
    >
      {renderScene()}
    </div>
  );
};

export default GameRuntime;
