/**
 * GoogleCourses - Import courses from Google Classroom.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Download,
  Users,
  Check,
  Loader2,
  RefreshCw,
  School,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import api from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const GoogleCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(null);
  const [importedCourses, setImportedCourses] = useState(new Set());

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/integrations/google/courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      if (err.response?.status === 400) {
        toast.error('Google Classroom not connected. Please connect first.');
        navigate('/integrations');
      } else {
        toast.error('Failed to load courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (course) => {
    setImporting(course.external_id);
    try {
      const response = await api.post(`/integrations/google/import-class/${course.external_id}`);
      
      toast.success(`Imported "${course.name}" with ${response.data.students_imported} students!`);
      setImportedCourses(prev => new Set([...prev, course.external_id]));
      
      // Optionally navigate to the new class
      // navigate(`/classes/${response.data.class_id}`);
    } catch (err) {
      console.error('Failed to import course:', err);
      if (err.response?.data?.detail?.includes('already been imported')) {
        toast.error('This course has already been imported');
        setImportedCourses(prev => new Set([...prev, course.external_id]));
      } else {
        toast.error(err.response?.data?.detail || 'Failed to import course');
      }
    } finally {
      setImporting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your Google Classroom courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/integrations')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 48 48" className="w-8 h-8">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Google Classroom</h1>
                <p className="text-sm text-muted-foreground">Import your courses</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={loadCourses}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <School className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any courses in Google Classroom where you are a teacher.
              </p>
              <Button variant="outline" onClick={loadCourses}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Found {courses.length} course{courses.length !== 1 ? 's' : ''} where you are a teacher. 
                Click "Import" to add a course and its students to GameCraft.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const isImported = importedCourses.has(course.external_id);
                const isImporting = importing === course.external_id;
                
                return (
                  <Card 
                    key={course.external_id}
                    className={cn(
                      "transition-all",
                      isImported && "ring-2 ring-emerald-500"
                    )}
                    data-testid={`course-${course.external_id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{course.name}</CardTitle>
                          {course.section && (
                            <Badge variant="outline" className="mt-1">
                              {course.section}
                            </Badge>
                          )}
                        </div>
                        {isImported && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <Check className="w-3 h-3 mr-1" />
                            Imported
                          </Badge>
                        )}
                      </div>
                      {course.description && (
                        <CardDescription className="mt-2 line-clamp-2">
                          {course.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{course.student_count || 'View'} students</span>
                        </div>
                        
                        <Button
                          onClick={() => handleImport(course)}
                          disabled={isImported || isImporting}
                          className={cn(
                            isImported && "bg-emerald-600 hover:bg-emerald-600"
                          )}
                          data-testid={`import-${course.external_id}`}
                        >
                          {isImporting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : isImported ? (
                            <Check className="w-4 h-4 mr-2" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          {isImported ? 'Imported' : 'Import'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What happens when you import?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>A new class is created in GameCraft with the same name</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>All students from the Google Classroom course are added to the class</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>You can sync rosters at any time to add new students</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Game assignments can be pushed to Google Classroom</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Student game results can be synced as grades</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GoogleCourses;
