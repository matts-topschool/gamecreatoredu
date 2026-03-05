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
  AlertCircle,
  Upload,
  FileSpreadsheet,
  Globe,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  schoology: <Users className="w-8 h-8 text-teal-600" />,
  alma: <School className="w-8 h-8 text-indigo-600" />,
  arbor: <School className="w-8 h-8 text-emerald-600" />,
  sims: <GraduationCap className="w-8 h-8 text-blue-700" />,
  bromcom: <School className="w-8 h-8 text-orange-600" />,
  scholarpack: <BookOpen className="w-8 h-8 text-green-700" />,
  isams: <School className="w-8 h-8 text-slate-700" />,
  groupcall: <Link2 className="w-8 h-8 text-cyan-600" />,
  wonde: <Globe className="w-8 h-8 text-violet-600" />,
  ctf_import: <Upload className="w-8 h-8 text-amber-600" />,
  csv_import: <FileSpreadsheet className="w-8 h-8 text-green-600" />
};

const regionLabels = {
  global: { label: 'Global', color: 'bg-slate-100 text-slate-700' },
  us: { label: 'US', color: 'bg-blue-100 text-blue-700' },
  uk: { label: 'UK', color: 'bg-red-100 text-red-700' }
};

const Integrations = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

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
      setCategories(response.data.categories || {});
    } catch (err) {
      console.error('Failed to load providers:', err);
      toast.error('Failed to load integration status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerId) => {
    // File imports go to a different page
    if (providerId === 'ctf_import' || providerId === 'csv_import') {
      navigate('/integrations/import');
      return;
    }
    
    if (providerId !== 'google_classroom') {
      toast.info('This integration is coming soon!');
      return;
    }

    setConnecting(providerId);
    try {
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

  // Group providers by region
  const groupedProviders = {
    all: providers,
    global: providers.filter(p => p.region === 'global'),
    us: providers.filter(p => p.region === 'us' || p.region === 'global'),
    uk: providers.filter(p => p.region === 'uk'),
    file_import: providers.filter(p => p.category === 'file_import')
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const renderProviderCard = (provider) => {
    const isFileImport = provider.category === 'file_import';
    const isComingSoon = provider.coming_soon && !isFileImport;
    
    return (
      <Card 
        key={provider.id}
        className={cn(
          "transition-all hover:shadow-md",
          isComingSoon && "opacity-60",
          provider.connected && "ring-2 ring-emerald-500"
        )}
        data-testid={`provider-${provider.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {providerIcons[provider.id] || <Link2 className="w-8 h-8" />}
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {provider.name}
                  {provider.region && provider.region !== 'global' && (
                    <Badge variant="outline" className={cn("text-xs", regionLabels[provider.region]?.color)}>
                      <MapPin className="w-3 h-3 mr-1" />
                      {regionLabels[provider.region]?.label}
                    </Badge>
                  )}
                </CardTitle>
                {provider.connected && (
                  <Badge className="mt-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    <Check className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {isComingSoon && (
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
          <div className="flex flex-wrap gap-1.5 mb-4">
            {provider.features?.slice(0, 4).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature.replace(/_/g, ' ')}
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
                  isComingSoon ? "bg-slate-400" : isFileImport ? "bg-amber-600 hover:bg-amber-700" : "bg-violet-600 hover:bg-violet-700"
                )}
                disabled={isComingSoon || connecting === provider.id}
                onClick={() => handleConnect(provider.id)}
                data-testid={`connect-${provider.id}`}
              >
                {connecting === provider.id ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isFileImport ? (
                  <Upload className="w-4 h-4 mr-2" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                {isComingSoon ? 'Coming Soon' : isFileImport ? 'Import Students' : 'Connect'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Alert */}
        <Alert className="mb-6 border-violet-200 bg-violet-50">
          <School className="h-4 w-4 text-violet-600" />
          <AlertDescription className="text-violet-800">
            Connect your LMS/MIS to import students, sync rosters, and automatically push game results as grades. 
            <strong> UK schools:</strong> Import CTF files directly or connect via Wonde/Arbor.
          </AlertDescription>
        </Alert>

        {/* Tabs for regions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all" className="gap-2">
              <Globe className="w-4 h-4" />
              All ({providers.length})
            </TabsTrigger>
            <TabsTrigger value="global" className="gap-2">
              Global ({groupedProviders.global.length})
            </TabsTrigger>
            <TabsTrigger value="us" className="gap-2">
              <span className="text-blue-600">US</span> ({groupedProviders.us.length})
            </TabsTrigger>
            <TabsTrigger value="uk" className="gap-2">
              <span className="text-red-600">UK</span> ({groupedProviders.uk.length})
            </TabsTrigger>
            <TabsTrigger value="file_import" className="gap-2">
              <Upload className="w-4 h-4" />
              Import ({groupedProviders.file_import.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedProviders.all.map(renderProviderCard)}
            </div>
          </TabsContent>

          <TabsContent value="global" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedProviders.global.map(renderProviderCard)}
            </div>
          </TabsContent>

          <TabsContent value="us" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedProviders.us.map(renderProviderCard)}
            </div>
          </TabsContent>

          <TabsContent value="uk" className="mt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-red-600">🇬🇧</span> UK Schools
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedProviders.uk.map(renderProviderCard)}
            </div>
          </TabsContent>

          <TabsContent value="file_import" className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Direct File Import</h3>
            <p className="text-muted-foreground mb-4">
              Don't want to connect an integration? Import students directly from CTF or CSV files.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedProviders.file_import.map(renderProviderCard)}
            </div>
          </TabsContent>
        </Tabs>

        {/* Integration Benefits */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What can you do with integrations?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Import Rosters</h3>
                  <p className="text-sm text-muted-foreground">
                    Import student lists from your MIS
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
                    Keep rosters up to date automatically
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
                    Send game results to gradebook
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold">CTF Import</h3>
                  <p className="text-sm text-muted-foreground">
                    UK schools: Import CTF files directly
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
