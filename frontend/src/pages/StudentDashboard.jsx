/**
 * StudentDashboard - Student's view of their assignments and progress.
 * Shows pending assignments, completed games, and class leaderboard.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gamepad2,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Star,
  Target,
  LogOut,
  Loader2,
  Zap,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import api from '@/services/api';
import { toast } from 'sonner';
import { getStudentSession, clearStudentSession } from './StudentLogin';
import { cn } from '@/lib/utils';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const studentSession = getStudentSession();
    if (!studentSession?.token) {
      navigate('/student');
      return;
    }
    setSession(studentSession);
    loadDashboard(studentSession.token);
    loadLeaderboard(studentSession.token, studentSession.class_info.id);
  }, [navigate]);

  const loadDashboard = async (token) => {
    try {
      const response = await api.get(`/student/dashboard?token=${token}`);
      setDashboard(response.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      if (err.response?.status === 401) {
        clearStudentSession();
        navigate('/student');
      }
      toast.error('Failed to load your assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (token, classId) => {
    try {
      const response = await api.get(`/student/leaderboard/${classId}?token=${token}`);
      setLeaderboard(response.data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    }
  };

  const handleLogout = () => {
    clearStudentSession();
    toast.success('See you next time!');
    navigate('/student');
  };

  const handlePlayGame = (assignment) => {
    navigate(`/play/${assignment.game_id}?assignment=${assignment.id}&student=true`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Session Expired</h2>
            <p className="text-muted-foreground mb-4">Please login again to continue.</p>
            <Button onClick={() => navigate('/student')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { student, class_info, assignments, stats } = dashboard;
  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const completedAssignments = assignments.filter(a => a.status === 'completed');
  const overdueAssignments = assignments.filter(a => a.status === 'overdue');

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900">{class_info.name}</h1>
                <p className="text-sm text-slate-500">Welcome, {student.display_name}!</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">To Do</span>
              </div>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">Completed</span>
              </div>
              <p className="text-3xl font-bold">{stats.completed}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">Total Score</span>
              </div>
              <p className="text-3xl font-bold">{stats.total_score.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 opacity-80" />
                <span className="text-sm opacity-80">Avg Accuracy</span>
              </div>
              <p className="text-3xl font-bold">{stats.average_accuracy}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Assignments */}
          <div className="md:col-span-2">
            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="w-4 h-4" />
                  To Do ({pendingAssignments.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Done ({completedAssignments.length})
                </TabsTrigger>
                {overdueAssignments.length > 0 && (
                  <TabsTrigger value="overdue" className="gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Overdue ({overdueAssignments.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="pending" className="space-y-3">
                {pendingAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="font-semibold text-lg mb-1">All caught up!</h3>
                      <p className="text-muted-foreground">No pending assignments right now.</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingAssignments.map(assignment => (
                    <AssignmentCard 
                      key={assignment.id} 
                      assignment={assignment} 
                      onPlay={handlePlayGame}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3">
                {completedAssignments.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h3 className="font-semibold text-lg mb-1">No completed games yet</h3>
                      <p className="text-muted-foreground">Play some games to see them here!</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedAssignments.map(assignment => (
                    <AssignmentCard 
                      key={assignment.id} 
                      assignment={assignment} 
                      onPlay={handlePlayGame}
                      showResults
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="overdue" className="space-y-3">
                {overdueAssignments.map(assignment => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment} 
                    onPlay={handlePlayGame}
                    isOverdue
                  />
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Leaderboard */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Class Leaderboard
                </CardTitle>
                <CardDescription>Top students in {class_info.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard ? (
                  <div className="space-y-2">
                    {leaderboard.leaderboard.map((entry, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg transition-colors",
                          entry.is_me && "bg-violet-50 border border-violet-200",
                          index === 0 && "bg-amber-50",
                          index === 1 && "bg-slate-50",
                          index === 2 && "bg-orange-50"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          index === 0 && "bg-amber-500 text-white",
                          index === 1 && "bg-slate-400 text-white",
                          index === 2 && "bg-orange-400 text-white",
                          index > 2 && "bg-slate-200 text-slate-600"
                        )}>
                          {entry.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-medium text-sm truncate",
                            entry.is_me && "text-violet-700"
                          )}>
                            {entry.student_name}
                            {entry.is_me && <span className="text-xs ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.games_played} games
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{entry.total_score.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{entry.avg_accuracy}%</p>
                        </div>
                      </div>
                    ))}
                    
                    {leaderboard.my_rank && leaderboard.my_rank > 10 && (
                      <div className="pt-2 mt-2 border-t text-center">
                        <p className="text-sm text-muted-foreground">
                          Your rank: <span className="font-bold">#{leaderboard.my_rank}</span> of {leaderboard.total_students}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Leaderboard loading...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// Assignment Card Component
const AssignmentCard = ({ assignment, onPlay, showResults = false, isOverdue = false }) => {
  const gameTypeIcons = {
    quiz: <Zap className="w-4 h-4" />,
    battle: <Award className="w-4 h-4" />,
    adventure: <Star className="w-4 h-4" />,
    platformer: <Gamepad2 className="w-4 h-4" />,
    puzzle: <Target className="w-4 h-4" />,
  };

  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isDueSoon = dueDate && !isPast(dueDate) && (dueDate.getTime() - Date.now()) < 24 * 60 * 60 * 1000;

  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      isOverdue && "border-red-200 bg-red-50/50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Game type icon */}
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            assignment.game_type === 'quiz' && "bg-violet-100 text-violet-600",
            assignment.game_type === 'battle' && "bg-red-100 text-red-600",
            assignment.game_type === 'adventure' && "bg-emerald-100 text-emerald-600",
            !['quiz', 'battle', 'adventure'].includes(assignment.game_type) && "bg-slate-100 text-slate-600"
          )}>
            {gameTypeIcons[assignment.game_type] || <Gamepad2 className="w-5 h-5" />}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground">{assignment.game_title}</p>
              </div>
              <Badge variant="outline" className="capitalize">
                {assignment.game_type}
              </Badge>
            </div>
            
            {assignment.instructions && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {assignment.instructions}
              </p>
            )}
            
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
              {dueDate && (
                <span className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-red-600",
                  isDueSoon && !isOverdue && "text-amber-600"
                )}>
                  <Calendar className="w-3.5 h-3.5" />
                  {isOverdue ? 'Overdue: ' : isDueSoon ? 'Due soon: ' : 'Due: '}
                  {format(dueDate, 'MMM d, h:mm a')}
                </span>
              )}
              
              <span className="text-muted-foreground">
                {assignment.points_possible} pts
              </span>
              
              {assignment.my_attempts > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {assignment.my_attempts} attempt{assignment.my_attempts !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {/* Results for completed */}
            {showResults && assignment.my_best_score !== null && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Best Score</p>
                    <p className="text-xl font-bold text-slate-900">{assignment.my_best_score.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-xl font-bold text-emerald-600">{assignment.my_best_accuracy}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Play button */}
          <Button
            onClick={() => onPlay(assignment)}
            className={cn(
              "flex-shrink-0",
              assignment.status === 'completed' && "bg-emerald-600 hover:bg-emerald-700"
            )}
            data-testid={`play-assignment-${assignment.id}`}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {assignment.status === 'completed' ? 'Play Again' : 'Play'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDashboard;
