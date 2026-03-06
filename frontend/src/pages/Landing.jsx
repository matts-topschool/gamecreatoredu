/**
 * Landing page - Marketing homepage.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Gamepad2, 
  Users, 
  BarChart3, 
  Store, 
  PlayCircle,
  ArrowRight,
  Check,
  Zap,
  Brain,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/common/Navbar';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Creation',
    description: 'Describe your game in plain English. Our AI transforms your ideas into fully playable educational games in minutes.',
    color: 'violet'
  },
  {
    icon: Gamepad2,
    title: 'Engaging Game Types',
    description: 'Quiz games, board games, story adventures, and more. Keep students engaged with varied, interactive formats.',
    color: 'orange'
  },
  {
    icon: Users,
    title: 'Live Classroom Sessions',
    description: 'Run real-time multiplayer sessions. Students join with a code and compete on live leaderboards.',
    color: 'teal'
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Track student progress, identify gaps, and see standards mastery at a glance. Export to your gradebook.',
    color: 'violet'
  },
  {
    icon: Store,
    title: 'Teacher Marketplace',
    description: 'Share your creations or discover games from other educators. Build a following and earn from your content.',
    color: 'orange'
  },
  {
    icon: Globe,
    title: 'Works Everywhere',
    description: 'No apps to install. Students play on any device with a browser. Supports multiple languages.',
    color: 'teal'
  }
];

const steps = [
  {
    step: '01',
    title: 'Describe Your Game',
    description: 'Tell our AI what you want: "Create a multiplication quiz for 3rd graders with space theme"'
  },
  {
    step: '02',
    title: 'Customize & Preview',
    description: 'Refine the generated game with our visual editor. Add your own questions and adjust difficulty.'
  },
  {
    step: '03',
    title: 'Play with Students',
    description: 'Share a join code with your class. Watch them engage in real-time on the leaderboard.'
  }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-orange-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noiseFilter%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.65%22%20numOctaves%3D%223%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23noiseFilter%29%22%20opacity%3D%220.03%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI-Powered Game Creation for Education
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold font-outfit tracking-tight text-slate-900 mb-6">
              Create Educational Games
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                in Minutes, Not Hours
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transform your teaching with AI-generated interactive games. Describe what you want, 
              and watch as engaging educational experiences come to life.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-8 h-14 text-lg shadow-lg shadow-violet-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  data-testid="hero-cta"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/play/demo">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-8 h-14 text-lg border-2"
                  data-testid="hero-demo"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Try Demo Game
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              No credit card required. Free forever for basic use.
            </p>

            {/* Student Quick Access */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <Link to="/student" className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl hover:from-cyan-100 hover:to-blue-100 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 group-hover:text-cyan-700 transition-colors">Are you a student?</p>
                  <p className="text-sm text-slate-600">Join your class with a code</p>
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative">
            <div className="relative mx-auto max-w-5xl">
              <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl overflow-hidden border border-slate-700">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                      <Gamepad2 className="w-10 h-10 text-violet-400" />
                    </div>
                    <p className="text-slate-400 text-lg">Game Studio Preview</p>
                    <p className="text-slate-500 text-sm mt-2">Sign up to start creating</p>
                  </div>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -left-8 top-1/4 p-4 bg-white rounded-xl shadow-lg hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Game Created!</p>
                    <p className="text-xs text-slate-500">Math Quest is ready</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-8 top-1/3 p-4 bg-white rounded-xl shadow-lg hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">24 Students</p>
                    <p className="text-xs text-slate-500">Playing now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-outfit text-slate-900 mb-4">
              Create Games in 3 Simple Steps
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              No coding required. No complex tools to learn. Just describe and play.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-bold font-outfit text-slate-100 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-12 pl-4">
                  <h3 className="text-xl font-semibold font-outfit text-slate-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-slate-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-outfit text-slate-900 mb-4">
              Everything You Need to Transform Learning
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed by educators, for educators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorClasses = {
                violet: 'bg-violet-100 text-violet-600',
                orange: 'bg-orange-100 text-orange-600',
                teal: 'bg-teal-100 text-teal-600'
              };
              
              return (
                <Card 
                  key={index} 
                  className="border-slate-200 hover:border-violet-200 hover:shadow-lg transition-all duration-300 group"
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold font-outfit text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-violet-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            Powered by Advanced AI
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white mb-6">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
            Join thousands of educators creating engaging, effective learning experiences.
          </p>
          
          <Link to="/auth/signup">
            <Button 
              size="lg" 
              className="bg-white text-violet-700 hover:bg-slate-100 rounded-full px-8 h-14 text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              data-testid="cta-signup"
            >
              Create Your First Game Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold font-outfit text-white">
                GameCraft <span className="text-violet-400">EDU</span>
              </span>
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            
            <p className="text-sm">
              © 2024 GameCraft EDU. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
