/**
 * Play - Game play page for running games.
 * Renders the game runtime for a specific game.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Share2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GameRuntimeSelector from '@/components/game/GameRuntimeSelector';
import Leaderboard from '@/components/game/Leaderboard';
import useGameStore from '@/stores/gameStore';
import useAuthStore from '@/stores/authStore';
import leaderboardService from '@/services/leaderboardService';
import { toast } from 'sonner';

const Play = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentGame, fetchGame, isLoading } = useGameStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [gameComplete, setGameComplete] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [myRank, setMyRank] = useState(null);

  // Load game on mount
  useEffect(() => {
    if (gameId) {
      fetchGame(gameId);
      loadLeaderboard();
    }
  }, [gameId, fetchGame]);

  // Load leaderboard
  const loadLeaderboard = async () => {
    try {
      const data = await leaderboardService.getGameLeaderboard(gameId, { limit: 5 });
      setLeaderboard(data);
    } catch (err) {
      // Leaderboard not critical
    }
  };

  // Handle game completion
  const handleGameComplete = async (stats) => {
    setGameComplete(true);
    setFinalStats(stats);
    
    // Submit result to backend
    try {
      const result = {
        game_id: gameId,
        player_name: user?.display_name || 'Guest Player',
        score: stats.score || 0,
        accuracy: stats.correctAnswers / Math.max(stats.questionsAnswered || 1, 1),
        questions_total: stats.questionsAnswered || 0,
        questions_correct: stats.correctAnswers || 0,
        time_taken_seconds: Math.floor((stats.totalTime || 0) / 1000),
        max_combo: stats.maxCombo || 0,
        hints_used: stats.hintsUsed || 0,
        damage_dealt: stats.score || 0,  // For battle games
        enemy_defeated: stats.enemyDefeated || false
      };
      
      await leaderboardService.submitResult(result);
      
      // Reload leaderboard to show new entry
      await loadLeaderboard();
      
      // Get user's rank
      if (isAuthenticated) {
        const rankData = await leaderboardService.getMyRank(gameId);
        setMyRank(rankData);
      }
      
      toast.success('Score submitted to leaderboard!');
    } catch (err) {
      console.error('Failed to submit result:', err);
      // Don't show error to user - game experience shouldn't be affected
    }
  };

  // Handle exit
  const handleExit = () => {
    const from = location.state?.from || '/dashboard';
    navigate(from);
  };

  // Share game
  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentGame?.title || 'Play this game!',
          text: currentGame?.description || 'Check out this educational game!',
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

  // Not found
  if (!currentGame && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The game you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if game has a valid spec
  if (!currentGame?.spec || !currentGame?.spec?.content?.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Game Not Ready</h2>
            <p className="text-muted-foreground mb-6">
              This game doesn't have any questions yet. Please edit the game to add content.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/studio')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Studio
              </Button>
              <Button onClick={() => navigate(`/studio/${gameId}`)}>
                Edit Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="font-semibold text-foreground">{currentGame?.title}</h1>
              <p className="text-xs text-muted-foreground">
                {currentGame?.spec?.content?.questions?.length || 0} questions
              </p>
            </div>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Game Container */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <GameRuntimeSelector
              spec={currentGame?.spec}
              onComplete={handleGameComplete}
              onExit={handleExit}
              playerId={user?.id}
              playerName={user?.display_name || 'Player'}
              fallbackToQuiz={true}
              useEnhancedGraphics={true}
              theme={currentGame?.spec?.battle_visuals?.theme || 'fantasy_castle'}
              playerCharacter={currentGame?.spec?.battle_visuals?.playerCharacter || 'knight'}
              enemyType={currentGame?.spec?.battle_visuals?.enemyType || 'orc'}
            />
          </div>
          
          {/* Sidebar - Leaderboard */}
          <div className="space-y-4">
            <Leaderboard gameId={gameId} limit={10} />
            
            {/* My Rank */}
            {myRank?.has_played && (
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
