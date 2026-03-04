/**
 * Classes - Teacher's classroom management page.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Users, 
  Copy,
  MoreVertical,
  Trash2,
  Settings,
  BookOpen,
  Loader2,
  GraduationCap,
  Link2,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import classroomService from '@/services/classroomService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Create Class Dialog
 */
const CreateClassDialog = ({ open, onOpenChange, onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    grade_level: '',
    subject: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter a class name');
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: form.name,
        description: form.description || null,
        grade_level: form.grade_level ? parseInt(form.grade_level) : null,
        subject: form.subject || null
      };
      
      const newClass = await classroomService.createClass(data);
      toast.success('Class created!');
      onCreated(newClass);
      onOpenChange(false);
      setForm({ name: '', description: '', grade_level: '', subject: '' });
    } catch (err) {
      toast.error('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
          <DialogDescription>
            Create a class to organize your students and track their progress.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., 4th Grade Math - Period 2"
              data-testid="class-name-input"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <Select 
                value={form.grade_level} 
                onValueChange={(v) => setForm({ ...form, grade_level: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      Grade {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select 
                value={form.subject} 
                onValueChange={(v) => setForm({ ...form, subject: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="geography">Geography</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="create-class-btn">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Class Card Component
 */
const ClassCard = ({ classData, onDelete, onClick }) => {
  const [copied, setCopied] = useState(false);

  const copyJoinCode = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(classData.join_code);
    setCopied(true);
    toast.success('Join code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${classData.name}"? This cannot be undone.`)) {
      try {
        await classroomService.deleteClass(classData.id);
        toast.success('Class deleted');
        onDelete(classData.id);
      } catch (err) {
        toast.error('Failed to delete class');
      }
    }
  };

  const integrationStatus = classData.integration?.provider !== 'none';

  return (
    <Card 
      className="cursor-pointer hover:border-violet-300 transition-colors"
      onClick={() => onClick(classData.id)}
      data-testid={`class-card-${classData.id}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{classData.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                {classData.grade_level && (
                  <Badge variant="outline" className="text-xs">
                    Grade {classData.grade_level}
                  </Badge>
                )}
                {classData.subject && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {classData.subject}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(classData.id); }}>
                <Settings className="w-4 h-4 mr-2" />
                Manage Class
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyJoinCode}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Join Code
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {classData.student_count} students
            </span>
            {integrationStatus && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Link2 className="w-4 h-4" />
                Synced
              </span>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyJoinCode}
            className="gap-2"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {classData.join_code}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Main Classes Page
 */
const Classes = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await classroomService.listClasses();
      setClasses(data);
    } catch (err) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleClassCreated = (newClass) => {
    setClasses([newClass, ...classes]);
  };

  const handleClassDeleted = (classId) => {
    setClasses(classes.filter(c => c.id !== classId));
  };

  const handleClassClick = (classId) => {
    navigate(`/dashboard/classes/${classId}`);
  };

  return (
    <div className="space-y-6" data-testid="classes-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-outfit">My Classes</h1>
          <p className="text-muted-foreground">
            Manage your classrooms and track student progress
          </p>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)} data-testid="new-class-btn">
          <Plus className="w-4 h-4 mr-2" />
          New Class
        </Button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Create your first class to organize students and track their game progress.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onDelete={handleClassDeleted}
              onClick={handleClassClick}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateClassDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={handleClassCreated}
      />
    </div>
  );
};

export default Classes;
