/**
 * Integrations Page - Connect to LMS/SIS providers.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft,
  Link2,
  Check,
  X,
  Loader2,
  ExternalLink,
  RefreshCw,
  School,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
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

// Provider icons/logos
const providerIcons = {
  google_classroom: (
    <svg viewBox="0 0 48 48" className="w-8 h-8">
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  ),
  canvas: <BookOpen className="w-8 h-8 text-red-600" />,
  clever: <School className="w-8 h-8 text-blue-500" />,
  classlink: <Link2 className="w-8 h-8 text-green-600" />,
  powerschool: <GraduationCap className="w-8 h-8 text-purple-600" />,
  schoology: <Users className="w-8 h-8 text-teal-600" />
};

const Integrations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);

  useEffect(() => {
    loadProviders();
    
    // Check for callback status
    const integrationStatus = searchParams.get('integration');
    if (integrationStatus === 'connected') {
      toast.success('Integration connected successfully!');
      // Remove query param
      navigate('/integrations', { replace: true });
    }
  }, [searchParams, navigate]);

  const loadProviders = async () => {
    try {
      const response = await api.get('/integrations/status');
      setProviders(response.data.providers || []);
    } catch (err) {
      console.error('Failed to load providers:', err);
      toast.error('Failed to load integration status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerId) => {
    if (providerId !== 'google_classroom') {
      toast.info('This integration is coming soon!');
      return;
    }

    setConnecting(providerId);
    try {
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      const redirectUri = window.location.origin + '/integrations';
      
      const response = await api.post('/integrations/oauth/init', {
        provider: providerId,
        redirect_uri: redirectUri
      });
      
      // Redirect to OAuth flow
      window.location.href = response.data.auth_url;
    } catch (err) {
      console.error('Failed to initiate OAuth:', err);
      toast.error(err.response?.data?.detail || 'Failed to start connection');
      setConnecting(null);
    }
  };

  const handleDisconnect = async (providerId) => {
    try {
      await api.delete(`/integrations/disconnect/${providerId}`);
      toast.success('Integration disconnected');
      loadProviders();
    } catch (err) {
      toast.error('Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">LMS/SIS Integrations</h1>
              <p className="text-sm text-muted-foreground">Connect your learning management systems</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Info Alert */}
        <Alert className="mb-6 border-violet-200 bg-violet-50">
          <School className="h-4 w-4 text-violet-600" />
          <AlertDescription className="text-violet-800">
            Connect your LMS to import students, sync rosters, and automatically push game results as grades to your gradebook.
          </AlertDescription>
        </Alert>

        {/* Provider Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Card 
              key={provider.id}
              className={cn(
                "transition-all",
                provider.coming_soon && "opacity-60",
                provider.connected && "ring-2 ring-emerald-500"
              )}
              data-testid={`provider-${provider.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {providerIcons[provider.id] || <Link2 className="w-8 h-8" />}
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      {provider.connected && (
                        <Badge className="mt-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          <Check className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                      {provider.coming_soon && (
                        <Badge variant="secondary" className="mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {provider.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.features?.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>

                {/* Connected Info */}
                {provider.connected && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm">
                    <p className="text-muted-foreground">Connected as:</p>
                    <p className="font-medium">{provider.email}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {provider.connected ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/integrations/${provider.id}/courses`)}
                        data-testid={`view-courses-${provider.id}`}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Courses
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDisconnect(provider.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      className={cn(
                        "w-full",
                        provider.coming_soon ? "bg-slate-400" : "bg-violet-600 hover:bg-violet-700"
                      )}
                      disabled={provider.coming_soon || connecting === provider.id}
                      onClick={() => handleConnect(provider.id)}
                      data-testid={`connect-${provider.id}`}
                    >
                      {connecting === provider.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Link2 className="w-4 h-4 mr-2" />
                      )}
                      {provider.coming_soon ? 'Coming Soon' : 'Connect'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Integration Benefits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What can you do with integrations?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Import Rosters</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically import your student lists from Google Classroom
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Sync Students</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep your class roster up to date with automatic syncing
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Push Grades</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically send game results as grades to your LMS gradebook
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Integrations;
