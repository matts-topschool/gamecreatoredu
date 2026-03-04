/**
 * Leaderboard - Displays top scores for a game with rankings.
 */
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown,
  Zap,
  Clock,
  Target,
  ChevronDown,
  Loader2,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import leaderboardService from '@/services/leaderboardService';

/**
 * Rank badge with medal icons for top 3
 */
const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30">
        <Crown className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-lg shadow-slate-400/30">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/30">
        <Medal className="w-4 h-4 text-white" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
      {rank}
    </div>
  );
};

/**
 * Single leaderboard entry row
 */
const LeaderboardEntry = ({ entry, rankBy }) => {
  const isTopThree = entry.rank <= 3;
  
  const getValue = () => {
    switch (rankBy) {
      case 'time':
        return `${entry.time_seconds}s`;
      case 'accuracy':
        return `${Math.round(entry.accuracy * 100)}%`;
      case 'combo':
        return `${entry.max_combo}x`;
      default:
        return entry.score.toLocaleString();
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg transition-colors",
        entry.is_current_player && "bg-violet-50 border border-violet-200",
        isTopThree && !entry.is_current_player && "bg-slate-50"
      )}
      data-testid={`leaderboard-entry-${entry.rank}`}
    >
      <RankBadge rank={entry.rank} />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          entry.is_current_player && "text-violet-700"
        )}>
          {entry.player_name}
          {entry.is_current_player && (
            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
          )}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {Math.round(entry.accuracy * 100)}%
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {entry.max_combo}x
          </span>
        </div>
      </div>
      
      <div className="text-right">
        <p className={cn(
          "font-bold text-lg",
          isTopThree ? "text-amber-600" : "text-slate-700"
        )}>
          {getValue()}
        </p>
      </div>
    </div>
  );
};

/**
 * Main Leaderboard Component
 */
const Leaderboard = ({ 
  gameId, 
  className,
  showTitle = true,
  limit = 10,
  compact = false
}) => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rankBy, setRankBy] = useState('score');

  useEffect(() => {
    loadLeaderboard();
  }, [gameId, rankBy]);

  const loadLeaderboard = async () => {
    if (!gameId) return;
    
    setLoading(true);
    try {
      const data = await leaderboardService.getGameLeaderboard(gameId, {
        type: rankBy,
        limit
      });
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8 text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  const entries = leaderboard?.entries || [];

  return (
    <Card className={className} data-testid="leaderboard">
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-amber-500" />
              Leaderboard
            </CardTitle>
            
            {!compact && (
              <Select value={rankBy} onValueChange={setRankBy}>
                <SelectTrigger className="w-32" data-testid="rank-by-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">By Score</SelectItem>
                  <SelectItem value="accuracy">By Accuracy</SelectItem>
                  <SelectItem value="time">By Time</SelectItem>
                  <SelectItem value="combo">By Combo</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          
          {leaderboard?.total_players > 0 && (
            <p className="text-sm text-muted-foreground">
              {leaderboard.total_players} player{leaderboard.total_players !== 1 ? 's' : ''} ranked
            </p>
          )}
        </CardHeader>
      )}
      
      <CardContent className={showTitle ? "pt-0" : ""}>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto text-slate-200 mb-3" />
            <p className="text-muted-foreground">No scores yet</p>
            <p className="text-sm text-muted-foreground">Be the first to play!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <LeaderboardEntry 
                key={entry.rank} 
                entry={entry} 
                rankBy={rankBy}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
