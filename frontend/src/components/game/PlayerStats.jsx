/**
 * PlayerStats - Displays a player's overall stats and achievements.
 */
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Zap, 
  Clock,
  Gamepad2,
  TrendingUp,
  Star,
  Calendar,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import leaderboardService from '@/services/leaderboardService';

/**
 * Stat card component
 */
const StatCard = ({ icon: Icon, label, value, subValue, color = "violet" }) => {
  const colors = {
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600"
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </div>
  );
};

/**
 * Recent game entry
 */
const RecentGame = ({ game }) => {
  const playedAt = new Date(game.played_at);
  const timeAgo = getTimeAgo(playedAt);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
        <Gamepad2 className="w-5 h-5 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{game.game_title}</p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-amber-600">{game.score}</p>
        <p className="text-xs text-muted-foreground">
          {Math.round(game.accuracy * 100)}% accuracy
        </p>
      </div>
    </div>
  );
};

/**
 * Helper to format time ago
 */
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Main PlayerStats Component
 */
const PlayerStats = ({ className }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await leaderboardService.getPlayerStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to load stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12 text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total_games_played === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Gamepad2 className="w-12 h-12 mx-auto text-slate-200 mb-3" />
          <p className="text-muted-foreground">No games played yet</p>
          <p className="text-sm text-muted-foreground">Play some games to see your stats!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="player-stats">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Your Stats
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {stats.unique_games} game{stats.unique_games !== 1 ? 's' : ''} played
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Gamepad2}
            label="Total Games"
            value={stats.total_games_played}
            color="violet"
          />
          <StatCard
            icon={Star}
            label="Total Score"
            value={stats.total_score.toLocaleString()}
            color="amber"
          />
          <StatCard
            icon={Target}
            label="Avg Accuracy"
            value={`${Math.round(stats.avg_accuracy * 100)}%`}
            color="emerald"
          />
          <StatCard
            icon={Clock}
            label="Play Time"
            value={`${stats.total_play_time_minutes}m`}
            color="blue"
          />
        </div>

        {/* Best Achievements */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
          <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Personal Bests
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.highest_score}</p>
              <p className="text-xs text-amber-700">Best Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {Math.round(stats.highest_accuracy * 100)}%
              </p>
              <p className="text-xs text-amber-700">Best Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.highest_combo}x</p>
              <p className="text-xs text-amber-700">Best Combo</p>
            </div>
          </div>
        </div>

        {/* Recent Games */}
        {stats.recent_games?.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent Activity
            </h4>
            <div className="space-y-1">
              {stats.recent_games.map((game, i) => (
                <RecentGame key={i} game={game} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
