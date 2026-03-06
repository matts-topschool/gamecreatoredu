/**
 * StudentLogin - Simple student login via class join code + name.
 * No password required for MVP - students just enter their name.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Gamepad2, Users, ArrowRight, Sparkles } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

// Student session storage
const STUDENT_SESSION_KEY = 'gamecraft_student_session';

export const getStudentSession = () => {
  try {
    const session = localStorage.getItem(STUDENT_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

export const setStudentSession = (session) => {
  localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
};

export const clearStudentSession = () => {
  localStorage.removeItem(STUDENT_SESSION_KEY);
};

const StudentLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [joinCode, setJoinCode] = useState(searchParams.get('code') || '');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const checkExistingSession = async () => {
      const session = getStudentSession();
      if (session?.token) {
        try {
          const response = await api.get(`/student/verify?token=${session.token}`);
          if (response.data.valid) {
            navigate('/student/dashboard');
            return;
          }
        } catch {
          clearStudentSession();
        }
      }
      setCheckingSession(false);
    };
    
    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!joinCode.trim()) {
      setError('Please enter your class join code');
      return;
    }
    
    if (!studentName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/student/login', {
        join_code: joinCode.trim().toUpperCase(),
        student_name: studentName.trim()
      });
      
      if (response.data.success) {
        // Store session
        setStudentSession({
          token: response.data.token,
          student: response.data.student,
          class_info: response.data.class_info
        });
        
        toast.success(`Welcome, ${response.data.student.display_name}!`);
        navigate('/student/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to login. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GameCraft EDU</h1>
          <p className="text-slate-600 mt-1">Student Portal</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Join Your Class
            </CardTitle>
            <CardDescription>
              Enter the code from your teacher and your name
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="joinCode">Class Join Code</Label>
                <Input
                  id="joinCode"
                  type="text"
                  placeholder="e.g., ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center text-2xl tracking-widest font-mono uppercase"
                  maxLength={10}
                  data-testid="join-code-input"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Ask your teacher for the class code
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentName">Your Name</Label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  data-testid="student-name-input"
                />
                <p className="text-xs text-muted-foreground">
                  Use the name your teacher has for you
                </p>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
                disabled={loading}
                data-testid="student-login-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Class
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Fun elements */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Ready to learn through play!
            <Sparkles className="w-4 h-4 text-amber-500" />
          </p>
        </div>

        {/* Teacher link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-500">
            Are you a teacher?{' '}
            <a href="/auth/login" className="text-violet-600 hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
