/**
 * Teacher Dashboard - Overview page with Bento Grid layout.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Gamepad2, 
  PlayCircle, 
  Users, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Clock,
  Star,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useAuthStore from '@/stores/authStore';
import useGameStore from '@/stores/gameStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { games, fetchGames, isLoading } = useGameStore();
  const [stats, setStats] = useState({
    totalGames: 0,
    totalSessions: 0,
    totalStudents: 0,
    avgRating: 0
  });

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    if (games.length > 0) {
      setStats({
        totalGames: games.length,
        totalSessions: games.reduce((acc, g) => acc + (g.play_count || 0), 0),
        totalStudents: 0, // Would come from sessions
        avgRating: games.reduce((acc, g) => acc + (g.avg_rating || 0), 0) / games.length || 0
      });
    }
  }, [games]);

  const recentGames = games.slice(0, 4);

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-foreground">
            Welcome back, {user?.display_name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your games today.
          </p>
        </div>
        <Link to="/studio/new">
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2" data-testid="dashboard-create-btn">
            <Sparkles className="w-4 h-4" />
            Create New Game
          </Button>
        </Link>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Total Games</p>
                <p className="text-4xl font-bold font-outfit mt-1">{stats.totalGames}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Play Sessions</p>
                <p className="text-4xl font-bold font-outfit mt-1 text-foreground">{stats.totalSessions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Students Reached</p>
                <p className="text-4xl font-bold font-outfit mt-1 text-foreground">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Avg. Rating</p>
                <p className="text-4xl font-bold font-outfit mt-1 text-foreground">
                  {stats.avgRating.toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Games - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold font-outfit">Recent Games</CardTitle>
              <Link to="/dashboard/games">
                <Button variant="ghost" size="sm" className="text-violet-600 hover:text-violet-700">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : recentGames.length > 0 ? (
                <div className="space-y-3">
                  {recentGames.map((game) => (
                    <Link 
                      key={game.id} 
                      to={`/studio/${game.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-violet-200 hover:bg-slate-50 transition-all group"
                      data-testid={`game-card-${game.id}`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Gamepad2 className="w-6 h-6 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate group-hover:text-violet-600 transition-colors">
                          {game.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <PlayCircle className="w-3.5 h-3.5" />
                            {game.play_count} plays
                          </span>
                          <Badge variant={game.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                            {game.status}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">No games yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first game to get started
                  </p>
                  <Link to="/studio/new">
                    <Button className="bg-violet-600 hover:bg-violet-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Game
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold font-outfit">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/studio/new" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                  </div>
                  Create with AI
                </Button>
              </Link>
              <Link to="/dashboard/sessions" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <PlayCircle className="w-4 h-4 text-orange-600" />
                  </div>
                  Start Session
                </Button>
              </Link>
              <Link to="/marketplace" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                  </div>
                  Browse Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
            <CardContent className="p-6">
              <Badge className="bg-violet-500 text-white mb-3">
                {user?.subscription_tier?.toUpperCase() || 'FREE'}
              </Badge>
              <h3 className="font-semibold font-outfit text-lg mb-2">
                {user?.subscription_tier === 'free' 
                  ? 'Upgrade to Creator' 
                  : 'Your Plan'}
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                {user?.subscription_tier === 'free'
                  ? 'Unlock marketplace selling, advanced AI, and detailed analytics.'
                  : 'You have access to all creator features.'}
              </p>
              {user?.subscription_tier === 'free' && (
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100">
                  Upgrade Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
