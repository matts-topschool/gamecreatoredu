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
  AlertCircle,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Import
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
  const [localClasses, setLocalClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(null);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Google Classroom courses and local classes in parallel
      const [coursesRes, classesRes] = await Promise.all([
        api.get('/integrations/google/courses'),
        api.get('/classes')
      ]);
      
      setCourses(coursesRes.data.courses || []);
      setLocalClasses(classesRes.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      if (err.response?.status === 400) {
        toast.error('Google Classroom not connected. Please connect first.');
        navigate('/integrations');
      } else {
        toast.error('Failed to load Google Classroom courses');
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
      loadData(); // Refresh data
    } catch (err) {
      console.error('Failed to import course:', err);
      if (err.response?.data?.detail?.includes('already been imported')) {
        toast.error('This course has already been imported');
        loadData(); // Refresh to show current state
      } else {
        toast.error(err.response?.data?.detail || 'Failed to import course');
      }
    } finally {
      setImporting(null);
    }
  };

  const handleSyncRoster = async (classId) => {
    setSyncing(classId);
    try {
      const response = await api.post(`/integrations/google/sync-roster/${classId}`);
      toast.success(`Synced roster: ${response.data.added} added, ${response.data.removed} removed`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to sync roster');
    } finally {
      setSyncing(null);
    }
  };

  // Check if a course is already imported
  const getLocalClass = (courseExternalId) => {
    return localClasses.find(c => c.integration?.external_id === courseExternalId);
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

  // Calculate stats
  const importedCount = localClasses.filter(c => c.integration?.provider === 'google_classroom').length;
  const availableCount = courses.length - importedCount;

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
                <p className="text-sm text-muted-foreground">Import courses and sync rosters</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-violet-600">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Google Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-emerald-600">{importedCount}</p>
              <p className="text-sm text-muted-foreground">Imported</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">{availableCount}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </CardContent>
          </Card>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <School className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any courses in Google Classroom where you are a teacher.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={loadData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={() => window.open('https://classroom.google.com', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Google Classroom
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Found {courses.length} course{courses.length !== 1 ? 's' : ''} where you are a teacher. 
                Import courses to create classes in GameCraft and sync students automatically.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const localClass = getLocalClass(course.external_id);
                const isImported = !!localClass;
                const isImporting = importing === course.external_id;
                const isSyncing = syncing === localClass?.id;
                
                return (
                  <Card 
                    key={course.external_id}
                    className={cn(
                      "transition-all hover:shadow-md",
                      isImported && "ring-2 ring-emerald-500"
                    )}
                    data-testid={`course-${course.external_id}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className="truncate">{course.name}</span>
                            {isImported && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            )}
                          </CardTitle>
                          {course.section && (
                            <Badge variant="outline" className="mt-1">
                              {course.section}
                            </Badge>
                          )}
                        </div>
                        {course.metadata?.courseState && (
                          <Badge 
                            variant={course.metadata.courseState === 'ACTIVE' ? 'default' : 'secondary'}
                            className={course.metadata.courseState === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : ''}
                          >
                            {course.metadata.courseState}
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
                      {/* Imported class info */}
                      {isImported && localClass && (
                        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center gap-2 text-emerald-700 text-sm mb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">Imported to GameCraft</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-emerald-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {localClass.student_count || 0} students
                            </span>
                            {localClass.integration?.last_sync_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Synced {new Date(localClass.integration.last_sync_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {isImported ? (
                          <>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => navigate(`/dashboard/classes/${localClass.id}`)}
                            >
                              View Class
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleSyncRoster(localClass.id)}
                              disabled={isSyncing}
                              title="Sync roster from Google Classroom"
                            >
                              {isSyncing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="w-full bg-violet-600 hover:bg-violet-700"
                            onClick={() => handleImport(course)}
                            disabled={isImporting}
                            data-testid={`import-${course.external_id}`}
                          >
                            {isImporting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Importing...
                              </>
                            ) : (
                              <>
                                <Import className="w-4 h-4 mr-2" />
                                Import Course
                              </>
                            )}
                          </Button>
                        )}
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
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Create Class</h4>
                  <p className="text-sm text-muted-foreground">A new class is created in GameCraft linked to your Google Classroom course.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Import Students</h4>
                  <p className="text-sm text-muted-foreground">All students from the Google Classroom course are automatically imported.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Sync Grades</h4>
                  <p className="text-sm text-muted-foreground">When you assign games, grades are pushed back to Google Classroom.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default GoogleCourses;
