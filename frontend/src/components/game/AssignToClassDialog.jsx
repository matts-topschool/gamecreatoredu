/**
 * AssignToClassDialog - Dialog for assigning a game to a class
 * Creates an assignment and optionally pushes to Google Classroom
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Users,
  Calendar,
  CheckCircle2,
  School,
  Send,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AssignToClassDialog = ({ 
  open, 
  onOpenChange, 
  game,
  onAssigned
}) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  
  // Form state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [pointsPossible, setPointsPossible] = useState(100);
  const [syncToLms, setSyncToLms] = useState(true);

  useEffect(() => {
    if (open) {
      loadClasses();
      // Set default title from game
      if (game) {
        setTitle(game.title || 'Game Assignment');
        setInstructions(`Play "${game.title}" and answer all questions correctly!`);
      }
    }
  }, [open, game]);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/classes');
      setClasses(response.data || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const hasGoogleClassroom = selectedClass?.integration?.provider === 'google_classroom';

  const handleAssign = async () => {
    if (!selectedClassId) {
      toast.error('Please select a class');
      return;
    }

    setAssigning(true);
    try {
      const response = await api.post('/integrations/assignments', {
        game_id: game.id,
        class_id: selectedClassId,
        title: title || game.title,
        instructions: instructions || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        points_possible: pointsPossible,
        sync_to_lms: syncToLms,
        create_lms_assignment: syncToLms && hasGoogleClassroom
      });

      const successMsg = response.data.external_assignment_id 
        ? `Assignment created and pushed to Google Classroom!`
        : `Assignment created for ${selectedClass.name}!`;
      
      toast.success(successMsg);
      onOpenChange(false);
      onAssigned?.(response.data);
      
      // Reset form
      setSelectedClassId('');
      setTitle('');
      setInstructions('');
      setDueDate('');
    } catch (err) {
      console.error('Failed to create assignment:', err);
      toast.error(err.response?.data?.detail || 'Failed to create assignment');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="w-5 h-5 text-violet-600" />
            Assign to Class
          </DialogTitle>
          <DialogDescription>
            Create an assignment for students to play this game.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-600" />
            <p className="text-sm text-muted-foreground">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <h4 className="font-medium mb-1">No Classes Found</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create a class first or import from Google Classroom.
            </p>
            <Button variant="outline" size="sm" onClick={() => {
              onOpenChange(false);
              window.location.href = '/integrations';
            }}>
              Go to Integrations
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Class Selection */}
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger data-testid="class-select">
                  <SelectValue placeholder="Choose a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <span>{cls.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {cls.student_count || 0} students
                        </Badge>
                        {cls.integration?.provider === 'google_classroom' && (
                          <svg viewBox="0 0 48 48" className="w-4 h-4">
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                          </svg>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Google Classroom integration notice */}
            {selectedClassId && hasGoogleClassroom && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Google Classroom Connected</p>
                  <p className="text-xs text-blue-600">
                    This assignment will be pushed to Google Classroom and grades will sync automatically.
                  </p>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label>Assignment Title</Label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Math Quiz Week 3"
                data-testid="assignment-title"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label>Instructions (optional)</Label>
              <Textarea 
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Add instructions for students..."
                rows={2}
              />
            </div>

            {/* Due date and points */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date (optional)
                </Label>
                <Input 
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input 
                  type="number"
                  min={0}
                  max={1000}
                  value={pointsPossible}
                  onChange={(e) => setPointsPossible(parseInt(e.target.value) || 100)}
                />
              </div>
            </div>

            {/* Sync to LMS toggle */}
            {hasGoogleClassroom && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <Label className="text-base">Push to Google Classroom</Label>
                  <p className="text-xs text-muted-foreground">
                    Create assignment in Google Classroom
                  </p>
                </div>
                <Switch 
                  checked={syncToLms}
                  onCheckedChange={setSyncToLms}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={assigning || loading || classes.length === 0 || !selectedClassId}
            className="bg-violet-600 hover:bg-violet-700"
            data-testid="create-assignment-btn"
          >
            {assigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {syncToLms && hasGoogleClassroom ? 'Assign & Push to GC' : 'Create Assignment'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignToClassDialog;
