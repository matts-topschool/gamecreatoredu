/**
 * Play - Game play page for running games.
 * Renders the game runtime for a specific game.
 * Supports both teacher and student modes.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Share2, Trophy, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GameRuntimeSelector from '@/components/game/GameRuntimeSelector';
import Leaderboard from '@/components/game/Leaderboard';
import useGameStore from '@/stores/gameStore';
import useAuthStore from '@/stores/authStore';
import leaderboardService from '@/services/leaderboardService';
import api from '@/services/api';
import { toast } from 'sonner';

// Get student session for assignment submissions
const getStudentSession = () => {
  try {
    const session = localStorage.getItem('gamecraft_student_session');
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

const Play = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { currentGame, fetchGame, isLoading: storeLoading } = useGameStore();
  const { user, isAuthenticated } = useAuthStore();
  
  // Local state for student mode
  const [studentGame, setStudentGame] = useState(null);
  const [studentAssignment, setStudentAssignment] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState(null);
  
  const [gameComplete, setGameComplete] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [myRank, setMyRank] = useState(null);
  
  // Assignment context
  const assignmentId = searchParams.get('assignment');
  const isStudentMode = searchParams.get('student') === 'true';
  const studentSession = getStudentSession();

  // Determine if we're in student mode
  const effectiveStudentMode = isStudentMode && studentSession?.token;

  // Load game based on mode
  useEffect(() => {
    if (!gameId) return;
    
    if (effectiveStudentMode) {
      // Student mode - use student API
      loadStudentGame();
    } else {
      // Teacher/normal mode - use store
      fetchGame(gameId);
    }
    loadLeaderboard();
  }, [gameId, effectiveStudentMode]);

  // Load game for student
  const loadStudentGame = async () => {
    setStudentLoading(true);
    setStudentError(null);
    
    try {
      const response = await api.get(`/student/game/${gameId}?token=${studentSession.token}`);
      setStudentGame(response.data.game);
      setStudentAssignment(response.data.assignment);
    } catch (err) {
      console.error('Failed to load game for student:', err);
      setStudentError(err.response?.data?.detail || 'Failed to load game');
    } finally {
      setStudentLoading(false);
    }
  };

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const data = await leaderboardService.getGameLeaderboard(gameId, { limit: 5 });
      setLeaderboard(data);
    } catch (err) {
      // Leaderboard not critical
    }
  };

  // Get the active game (either from store or student state)
  const activeGame = effectiveStudentMode ? studentGame : currentGame;
  const isLoading = effectiveStudentMode ? studentLoading : storeLoading;

  // Handle game completion
  const handleGameComplete = async (stats) => {
    setGameComplete(true);
    setFinalStats(stats);
    
    const score = stats.score || 0;
    const questionsAnswered = stats.questionsAnswered || stats.totalQuestions || 1;
    const correctAnswers = stats.correctAnswers || 0;
    
    // Use pre-calculated accuracy if available, otherwise calculate
    const accuracy = stats.accuracy !== undefined 
      ? stats.accuracy 
      : Math.round((correctAnswers / Math.max(questionsAnswered, 1)) * 100);
    
    // If this is a student assignment, submit to assignment endpoint
    if (effectiveStudentMode && studentAssignment) {
      try {
        const response = await api.post(
          `/student/assignment/${studentAssignment.id}/complete?token=${studentSession.token}`,
          {
            score: score,
            accuracy: accuracy,
            time_seconds: Math.floor((stats.totalTime || 0) / 1000),
            max_combo: stats.maxCombo || 0,
            questions_answered: questionsAnswered,
            questions_correct: correctAnswers
          }
        );
        
        toast.success(response.data.message || 'Great job! Your result has been recorded.');
      } catch (err) {
        console.error('Failed to submit assignment result:', err);
        toast.error('Failed to save your result. Please try again.');
      }
    }
    
    // Also submit to general leaderboard
    try {
      const playerName = effectiveStudentMode 
        ? studentSession?.student?.display_name 
        : (user?.display_name || 'Guest Player');
      
      const result = {
        game_id: gameId,
        player_name: playerName,
        score: score,
        accuracy: accuracy / 100,
        questions_total: questionsAnswered,
        questions_correct: correctAnswers,
        time_taken_seconds: Math.floor((stats.totalTime || 0) / 1000),
        max_combo: stats.maxCombo || 0,
        hints_used: stats.hintsUsed || 0,
        damage_dealt: score,
        enemy_defeated: stats.enemyDefeated || false
      };
      
      await leaderboardService.submitResult(result);
      
      // Reload leaderboard to show new entry
      await loadLeaderboard();
      
      // Get user's rank (only for teachers)
      if (isAuthenticated && !effectiveStudentMode) {
        const rankData = await leaderboardService.getMyRank(gameId);
        setMyRank(rankData);
      }
      
      if (!effectiveStudentMode) {
        toast.success('Score submitted to leaderboard!');
      }
    } catch (err) {
      console.error('Failed to submit result:', err);
    }
  };

  // Handle exit - go to appropriate dashboard
  const handleExit = () => {
    if (effectiveStudentMode) {
      navigate('/student/dashboard');
    } else {
      const from = location.state?.from || '/dashboard';
      navigate(from);
    }
  };

  // Share game
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: activeGame?.title || 'Play this game!',
          text: activeGame?.description || 'Check out this educational game!',
          url
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  // Error state for students
  if (effectiveStudentMode && studentError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Cannot Access Game</h2>
            <p className="text-muted-foreground mb-6">{studentError}</p>
            <Button onClick={() => navigate('/student/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Assignments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not found
  if (!activeGame && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The game you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={handleExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {effectiveStudentMode ? 'Back to Assignments' : 'Back to Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if game has a valid spec
  if (!activeGame?.spec || !activeGame?.spec?.content?.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Game Not Ready</h2>
            <p className="text-muted-foreground mb-6">
              {effectiveStudentMode 
                ? "This game isn't ready yet. Please contact your teacher."
                : "This game doesn't have any questions yet. Please edit the game to add content."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleExit}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {effectiveStudentMode ? 'Back to Assignments' : 'Back to Studio'}
              </Button>
              {!effectiveStudentMode && (
                <Button onClick={() => navigate(`/studio/${gameId}`)}>
                  Edit Game
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const playerName = effectiveStudentMode 
    ? studentSession?.student?.display_name 
    : (user?.display_name || 'Player');
  
  const playerId = effectiveStudentMode
    ? studentSession?.student?.id
    : user?.id;

  return (
    <div className="min-h-screen bg-slate-100" data-testid="play-page">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleExit}
              data-testid="exit-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-foreground">{activeGame?.title}</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {activeGame?.spec?.content?.questions?.length || 0} questions
                </p>
                {effectiveStudentMode && studentAssignment && (
                  <Badge variant="secondary" className="text-xs">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {studentAssignment.points_possible} pts
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {!effectiveStudentMode && (
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Game Container */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <GameRuntimeSelector
              spec={activeGame?.spec}
              onComplete={handleGameComplete}
              onExit={handleExit}
              playerId={playerId}
              playerName={playerName}
              fallbackToQuiz={true}
              useEnhancedGraphics={true}
              theme={activeGame?.spec?.battle_visuals?.theme || 'fantasy_castle'}
              playerCharacter={activeGame?.spec?.battle_visuals?.playerCharacter || 'knight'}
              enemyType={activeGame?.spec?.battle_visuals?.enemyType || 'orc'}
              adventureWorld={activeGame?.spec?.adventure_visuals?.world || 'pirate_voyage'}
            />
          </div>
          
          {/* Sidebar - Leaderboard */}
          <div className="space-y-4">
            <Leaderboard gameId={gameId} limit={10} />
            
            {/* My Rank - only for teachers */}
            {!effectiveStudentMode && myRank?.has_played && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your Rank</p>
                      <p className="font-bold text-lg">
                        #{myRank.rank} of {myRank.total_players}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Play;
