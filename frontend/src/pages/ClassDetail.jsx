/**
 * ClassDetail - View and manage a single class with students.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Users, 
  Copy,
  Plus,
  Trash2,
  Mail,
  Target,
  Trophy,
  Calendar,
  Loader2,
  GraduationCap,
  Link2,
  Settings,
  CheckCircle,
  UserPlus,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import classroomService from '@/services/classroomService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Add Student Dialog
 */
const AddStudentDialog = ({ open, onOpenChange, classId, onAdded }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    student_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.display_name.trim()) {
      toast.error('Please enter student name');
      return;
    }

    setLoading(true);
    try {
      const student = await classroomService.addStudent(
        classId,
        form.display_name,
        form.email || null,
        form.student_id || null
      );
      toast.success('Student added!');
      onAdded(student);
      onOpenChange(false);
      setForm({ display_name: '', email: '', student_id: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>
            Manually add a student to this class.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Student Name *</Label>
            <Input
              id="name"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="e.g., John Smith"
              data-testid="student-name-input"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="student@school.edu"
            />
          </div>
          
          <div>
            <Label htmlFor="studentId">Student ID (optional)</Label>
            <Input
              id="studentId"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              placeholder="School ID number"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="add-student-btn">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Student Row Component
 */
const StudentRow = ({ student, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    if (!window.confirm(`Remove ${student.display_name} from class?`)) return;
    
    setRemoving(true);
    try {
      await onRemove(student.id);
    } finally {
      setRemoving(false);
    }
  };

  const lastActive = student.last_activity 
    ? new Date(student.last_activity).toLocaleDateString()
    : 'Never';

  return (
    <TableRow data-testid={`student-row-${student.id}`}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
            <span className="text-sm font-medium text-violet-600">
              {student.display_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium">{student.display_name}</p>
            {student.email && (
              <p className="text-xs text-muted-foreground">{student.email}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-semibold">{student.games_played}</span>
      </TableCell>
      <TableCell className="text-center">
        <span className="font-semibold text-amber-600">
          {student.total_score.toLocaleString()}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className={cn(
          "font-semibold",
          student.avg_accuracy >= 0.8 ? "text-emerald-600" :
          student.avg_accuracy >= 0.6 ? "text-amber-600" : "text-red-600"
        )}>
          {Math.round(student.avg_accuracy * 100)}%
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {lastActive}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleRemove} className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

/**
 * Main ClassDetail Page
 */
const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadClass();
  }, [classId]);

  const loadClass = async () => {
    setLoading(true);
    try {
      const data = await classroomService.getClass(classId);
      setClassData(data);
    } catch (err) {
      toast.error('Failed to load class');
      navigate('/dashboard/classes');
    } finally {
      setLoading(false);
    }
  };

  const copyJoinCode = async () => {
    await navigator.clipboard.writeText(classData.join_code);
    setCopied(true);
    toast.success('Join code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStudentAdded = (student) => {
    setClassData({
      ...classData,
      students: [...classData.students, student],
      student_count: classData.student_count + 1
    });
  };

  const handleStudentRemoved = async (studentId) => {
    try {
      await classroomService.removeStudent(classId, studentId);
      setClassData({
        ...classData,
        students: classData.students.filter(s => s.id !== studentId),
        student_count: classData.student_count - 1
      });
      toast.success('Student removed');
    } catch (err) {
      toast.error('Failed to remove student');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!classData) {
    return null;
  }

  // Calculate class stats
  const totalGames = classData.students.reduce((sum, s) => sum + s.games_played, 0);
  const avgAccuracy = classData.students.length > 0
    ? classData.students.reduce((sum, s) => sum + s.avg_accuracy, 0) / classData.students.length
    : 0;

  return (
    <div className="space-y-6" data-testid="class-detail-page">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/classes')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-outfit">{classData.name}</h1>
            {classData.grade_level && (
              <Badge variant="outline">Grade {classData.grade_level}</Badge>
            )}
            {classData.subject && (
              <Badge variant="secondary" className="capitalize">{classData.subject}</Badge>
            )}
          </div>
          {classData.description && (
            <p className="text-muted-foreground mt-1">{classData.description}</p>
          )}
        </div>
        
        <Button variant="outline" onClick={copyJoinCode} className="gap-2">
          {copied ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          Join Code: {classData.join_code}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classData.student_count}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGames}</p>
                <p className="text-xs text-muted-foreground">Games Played</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(avgAccuracy * 100)}%</p>
                <p className="text-xs text-muted-foreground">Avg Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">
                  {classData.integration?.provider === 'none' ? 'None' : classData.integration?.provider}
                </p>
                <p className="text-xs text-muted-foreground">Integration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students" className="gap-2">
            <Users className="w-4 h-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Students ({classData.students.length})</CardTitle>
              <Button onClick={() => setAddDialogOpen(true)} data-testid="add-student-dialog-btn">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </CardHeader>
            <CardContent>
              {classData.students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                  <p className="text-muted-foreground">No students yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share the join code <strong>{classData.join_code}</strong> with your students
                  </p>
                  <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student Manually
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-center">Games</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Accuracy</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classData.students.map((student) => (
                      <StudentRow
                        key={student.id}
                        student={student}
                        onRemove={handleStudentRemoved}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium mb-2">Leaderboard Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    {classData.settings?.leaderboard_public 
                      ? 'Public - Anyone can see' 
                      : 'Class Only - Only students in this class'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium mb-2">Anonymous Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    {classData.settings?.leaderboard_anonymous 
                      ? 'Enabled - Shows "Student 1, Student 2"' 
                      : 'Disabled - Shows real names'}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  LMS Integration
                </h4>
                {classData.integration?.provider === 'none' ? (
                  <div>
                    <p className="text-sm text-blue-700 mb-3">
                      Connect to Google Classroom, Canvas, or Clever to automatically sync your roster.
                    </p>
                    <Button variant="outline" disabled>
                      Connect LMS (Coming Soon)
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">
                    Connected to <strong className="capitalize">{classData.integration.provider}</strong>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Student Dialog */}
      <AddStudentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        classId={classId}
        onAdded={handleStudentAdded}
      />
    </div>
  );
};

export default ClassDetail;
