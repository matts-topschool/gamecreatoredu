/**
 * Studio New - AI-powered game creation page with live preview.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Lightbulb,
  GraduationCap,
  BookOpen,
  Clock,
  Wand2,
  Eye,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  Gamepad2,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import useGameStore from '@/stores/gameStore';
import api from '@/services/api';
import { toast } from 'sonner';
import ThemeSelector from '@/game/ThemeSelector';
import AdventureWorldSelector from '@/game/AdventureWorldSelector';
import GameRuntimeSelector from '@/components/game/GameRuntimeSelector';

const examplePrompts = [
  {
    title: 'Monster Battle',
    prompt: 'Create a monster battle game where students defeat a Fraction Fiend by answering fraction questions. Correct answers deal damage, and faster answers deal more damage. Include a combo system for consecutive correct answers.',
    subjects: ['math'],
    grades: [4, 5],
    type: 'battle'
  },
  {
    title: 'Science Quest',
    prompt: 'Make a space exploration game about the solar system for 5th graders. Students answer questions about planets to fuel their spaceship and visit each planet. Include facts about each planet when they arrive.',
    subjects: ['science'],
    grades: [5],
    type: 'adventure'
  },
  {
    title: 'Word Wizard',
    prompt: 'Design a vocabulary building game where students are wizards casting spells. Each correct vocabulary definition makes their spell stronger. Wrong answers cause the spell to fizzle. Great for middle school English.',
    subjects: ['english'],
    grades: [6, 7, 8],
    type: 'battle'
  },
  {
    title: 'History Detective',
    prompt: 'Create a mystery detective game about the American Revolution. Students solve clues about historical events, figures, and causes. Each solved clue reveals part of the mystery.',
    subjects: ['history'],
    grades: [7, 8],
    type: 'adventure'
  }
];

const gradeOptions = [
  { value: 'k', label: 'Kindergarten', num: 0 },
  { value: '1', label: '1st Grade', num: 1 },
  { value: '2', label: '2nd Grade', num: 2 },
  { value: '3', label: '3rd Grade', num: 3 },
  { value: '4', label: '4th Grade', num: 4 },
  { value: '5', label: '5th Grade', num: 5 },
  { value: '6', label: '6th Grade', num: 6 },
  { value: '7', label: '7th Grade', num: 7 },
  { value: '8', label: '8th Grade', num: 8 },
  { value: '9', label: '9th Grade', num: 9 },
  { value: '10', label: '10th Grade', num: 10 },
  { value: '11', label: '11th Grade', num: 11 },
  { value: '12', label: '12th Grade', num: 12 },
];

const subjectOptions = [
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English/Language Arts' },
  { value: 'history', label: 'History/Social Studies' },
  { value: 'geography', label: 'Geography' },
  { value: 'art', label: 'Art' },
  { value: 'music', label: 'Music' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
];

const gameTypeOptions = [
  { value: 'quiz', label: 'Quiz Game' },
  { value: 'battle', label: 'Monster Battle' },
  { value: 'adventure', label: 'Adventure/Story' },
  { value: 'platformer', label: 'Platformer' },
  { value: 'puzzle', label: 'Puzzle' },
  { value: 'simulation', label: 'Simulation' },
];

const StudioNew = () => {
  const navigate = useNavigate();
  const { createGame } = useGameStore();

  // Form state
  const [prompt, setPrompt] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [gameType, setGameType] = useState('');
  const [questionCount, setQuestionCount] = useState([10]);
  const [duration, setDuration] = useState([15]);

  // AI compilation state
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledSpec, setCompiledSpec] = useState(null);
  const [compilationError, setCompilationError] = useState(null);
  const [activeTab, setActiveTab] = useState('prompt');

  // Battle customization state
  const [selectedTheme, setSelectedTheme] = useState('fantasy_castle');
  const [selectedCharacter, setSelectedCharacter] = useState('knight');
  const [selectedEnemy, setSelectedEnemy] = useState('orc');
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Adventure customization state
  const [selectedWorld, setSelectedWorld] = useState('pirate_voyage');
  const [adventureSceneCount, setAdventureSceneCount] = useState(5);
  const [adventureQuestionsPerScene, setAdventureQuestionsPerScene] = useState(2);

  // Poll for compilation status
  const pollForCompletion = async (taskId, maxAttempts = 60) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await api.get(`/ai/compile/status/${taskId}`);
        const data = response.data;
        
        if (data.status === 'completed' && data.spec) {
          return { success: true, spec: data.spec };
        } else if (data.status === 'failed') {
          return { success: false, error: data.error || 'Compilation failed' };
        }
        
        // Still processing, wait and retry
        await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
      } catch (error) {
        console.error('Poll error:', error);
        // On 404 or other errors, wait and retry a couple times
        if (attempt > 5) {
          return { success: false, error: 'Failed to check compilation status' };
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    return { success: false, error: 'Compilation timed out. Please try again.' };
  };

  // Compile game using AI with async polling
  const handleCompile = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your game');
      return;
    }

    setIsCompiling(true);
    setCompilationError(null);
    setCompiledSpec(null);

    try {
      const gradeNum = gradeLevel ? parseInt(gradeLevel) : null;
      
      // Start the compilation task
      const startResponse = await api.post('/ai/compile/start', {
        prompt: prompt,
        grade_levels: gradeNum ? [gradeNum] : null,
        subjects: subject ? [subject] : null,
        game_type: gameType || null,
        question_count: questionCount[0],
        duration_minutes: duration[0]
      });

      const taskId = startResponse.data.task_id;
      
      if (!taskId) {
        throw new Error('Failed to start compilation');
      }

      toast.info('AI is generating your game. This may take 30-90 seconds...');
      
      // Poll for completion
      const result = await pollForCompletion(taskId);
      
      if (result.success && result.spec) {
        setCompiledSpec(result.spec);
        setActiveTab('preview');
        toast.success('Game compiled successfully!');
      } else {
        throw new Error(result.error || 'Compilation failed');
      }
    } catch (error) {
      console.error('Compilation error:', error);
      let message = 'Failed to compile game';
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message = 'Request timed out. Please try again.';
      } else if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.message) {
        message = error.message;
      }
      
      setCompilationError(message);
      toast.error(message);
    } finally {
      setIsCompiling(false);
    }
  };

  // Save compiled game
  const handleSave = async () => {
    if (!compiledSpec) {
      toast.error('No game to save');
      return;
    }

    try {
      const gradeNum = gradeLevel ? parseInt(gradeLevel) : null;
      const specGameType = compiledSpec.meta?.game_type || gameType;
      
      // Add battle visuals to spec if it's a battle game
      const specWithVisuals = {
        ...compiledSpec,
        battle_visuals: (specGameType === 'battle') ? {
          theme: selectedTheme,
          playerCharacter: selectedCharacter,
          enemyType: selectedEnemy
        } : undefined,
        adventure_visuals: (specGameType === 'adventure') ? {
          world: selectedWorld,
          scene_count: adventureSceneCount,
          questions_per_scene: adventureQuestionsPerScene
        } : undefined,
        adventure_config: (specGameType === 'adventure') ? {
          scene_count: adventureSceneCount,
          questions_per_scene: adventureQuestionsPerScene
        } : undefined
      };
      
      const game = await createGame({
        title: compiledSpec.meta?.title || 'AI Generated Game',
        description: compiledSpec.meta?.description || prompt.slice(0, 200),
        grade_levels: gradeNum ? [gradeNum] : compiledSpec.meta?.educational?.grade_levels || [],
        subjects: subject ? [subject] : compiledSpec.meta?.educational?.subjects || [],
        spec: specWithVisuals
      });

      if (game) {
        toast.success('Game saved!');
        navigate(`/studio/${game.id}`);
      }
    } catch (error) {
      toast.error('Failed to save game');
    }
  };

  // Apply example prompt
  const applyExample = (example) => {
    setPrompt(example.prompt);
    if (example.subjects[0]) setSubject(example.subjects[0]);
    if (example.grades[0]) setGradeLevel(example.grades[0].toString());
    if (example.type) setGameType(example.type);
  };

  return (
    <div className="max-w-6xl mx-auto" data-testid="studio-new-page">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          AI-Powered Creation
        </div>
        <h1 className="text-3xl font-bold font-outfit text-foreground">
          Create a New Game
        </h1>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Describe your educational game and watch AI bring it to life. 
          Preview instantly and customize before saving.
        </p>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="prompt" className="gap-2">
            <Wand2 className="w-4 h-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!compiledSpec} className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="spec" disabled={!compiledSpec} className="gap-2">
            <Gamepad2 className="w-4 h-4" />
            Details
          </TabsTrigger>
        </TabsList>

        {/* Prompt Tab */}
        <TabsContent value="prompt">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Input */}
              <Card>
                <CardContent className="p-6">
                  <Label htmlFor="prompt" className="text-base font-medium">
                    Describe Your Game
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">
                    Be creative! Describe the game mechanics, theme, and learning goals.
                  </p>
                  <Textarea
                    id="prompt"
                    placeholder="Example: Create a monster battle game where students defeat a Fraction Fiend by answering fraction questions. Correct answers deal damage, and faster answers deal more damage..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[150px] resize-none"
                    data-testid="game-prompt"
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-right">
                    {prompt.length} / 5000 characters
                  </p>
                </CardContent>
              </Card>

              {/* Options */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-4 h-4" />
                        Grade Level
                      </Label>
                      <Select value={gradeLevel} onValueChange={setGradeLevel}>
                        <SelectTrigger data-testid="grade-select">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeOptions.map((grade) => (
                            <SelectItem key={grade.value} value={grade.value}>
                              {grade.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4" />
                        Subject
                      </Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger data-testid="subject-select">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjectOptions.map((sub) => (
                            <SelectItem key={sub.value} value={sub.value}>
                              {sub.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Gamepad2 className="w-4 h-4" />
                        Game Type
                      </Label>
                      <Select value={gameType} onValueChange={setGameType}>
                        <SelectTrigger data-testid="type-select">
                          <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent>
                          {gameTypeOptions.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center justify-between mb-3">
                        <span>Number of Questions</span>
                        <span className="font-mono text-sm text-muted-foreground">{questionCount[0]}</span>
                      </Label>
                      <Slider
                        value={questionCount}
                        onValueChange={setQuestionCount}
                        min={5}
                        max={30}
                        step={5}
                        className="py-2"
                        data-testid="question-slider"
                      />
                    </div>

                    <div>
                      <Label className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Duration
                        </span>
                        <span className="font-mono text-sm text-muted-foreground">{duration[0]} min</span>
                      </Label>
                      <Slider
                        value={duration}
                        onValueChange={setDuration}
                        min={5}
                        max={60}
                        step={5}
                        className="py-2"
                        data-testid="duration-slider"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {compilationError && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Compilation Error</p>
                      <p className="text-sm text-red-700 mt-1">{compilationError}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleCompile}
                disabled={isCompiling || !prompt.trim()}
                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-lg font-medium"
                data-testid="compile-btn"
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI is creating your game (30-60 sec)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Game
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Examples Sidebar */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lightbulb className="w-4 h-4" />
                Example Prompts
              </div>
              
              {examplePrompts.map((example, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:border-violet-200 hover:shadow-sm transition-all"
                  onClick={() => applyExample(example)}
                  data-testid={`example-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground">{example.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {example.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {example.prompt}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 text-violet-600 p-0 h-auto">
                      Use this prompt →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          {compiledSpec && (
            <div className="space-y-6">
              {/* Preview Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-outfit">
                    {compiledSpec.meta?.title || 'Generated Game'}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {compiledSpec.meta?.description}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLivePreview(!showLivePreview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showLivePreview ? 'Hide Preview' : 'Live Preview'}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('prompt')}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Game
                  </Button>
                </div>
              </div>

              {/* Theme Selector for Battle Games */}
              {(compiledSpec.meta?.game_type === 'battle' || gameType === 'battle') && (
                <ThemeSelector
                  selectedTheme={selectedTheme}
                  selectedCharacter={selectedCharacter}
                  selectedEnemy={selectedEnemy}
                  onThemeChange={setSelectedTheme}
                  onCharacterChange={setSelectedCharacter}
                  onEnemyChange={setSelectedEnemy}
                  gameType="battle"
                />
              )}

              {/* World Selector for Adventure Games */}
              {(compiledSpec.meta?.game_type === 'adventure' || gameType === 'adventure') && (
                <AdventureWorldSelector
                  selectedWorld={selectedWorld}
                  onWorldChange={setSelectedWorld}
                  sceneCount={adventureSceneCount}
                  onSceneCountChange={setAdventureSceneCount}
                  questionsPerScene={adventureQuestionsPerScene}
                  onQuestionsPerSceneChange={setAdventureQuestionsPerScene}
                />
              )}

              {/* Live Game Preview */}
              {showLivePreview ? (
                <div className="rounded-2xl overflow-hidden border border-slate-700">
                  <GameRuntimeSelector
                    spec={compiledSpec}
                    onComplete={(result) => {
                      toast.success(`Preview complete! Score: ${result.score}`);
                      setShowLivePreview(false);
                    }}
                    onExit={() => setShowLivePreview(false)}
                    useEnhancedGraphics={true}
                    theme={selectedTheme}
                    playerCharacter={selectedCharacter}
                    enemyType={selectedEnemy}
                    adventureWorld={selectedWorld}
                  />
                </div>
              ) : (
                /* Game Preview Card */
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Game Canvas Placeholder */}
                  <Card 
                    className="aspect-video bg-slate-900 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-violet-500 transition-all"
                    onClick={() => setShowLivePreview(true)}
                  >
                    <div className="text-center text-white">
                      <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-violet-400" />
                      <p className="text-lg font-medium">Click to Play Preview</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Test your game before saving
                      </p>
                    </div>
                  </Card>

                  {/* Game Stats */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Game Overview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <Badge>{compiledSpec.meta?.game_type || 'quiz'}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Questions</span>
                          <span className="font-medium">{compiledSpec.content?.questions?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Grades</span>
                          <span className="font-medium">
                            {compiledSpec.meta?.educational?.grade_levels?.join(', ') || 'All'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration</span>
                          <span className="font-medium">
                            ~{compiledSpec.meta?.gameplay?.estimated_duration_minutes || 15} min
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Leaderboard</span>
                          <span className="font-medium">
                            {compiledSpec.settings?.leaderboard?.enabled ? (
                              <Check className="w-4 h-4 text-green-600 inline" />
                            ) : 'Disabled'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sample Questions */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Sample Questions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {compiledSpec.content?.questions?.slice(0, 5).map((q, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-sm font-medium">{q.stem}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {q.options?.map((opt) => (
                                  <Badge 
                                    key={opt.id} 
                                    variant={opt.is_correct ? 'default' : 'outline'}
                                    className="text-xs"
                                  >
                                    {opt.text}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Spec Tab */}
        <TabsContent value="spec">
          {compiledSpec && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Game Specification</h2>
                <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Game
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <pre className="text-xs overflow-auto max-h-[600px] bg-slate-900 text-slate-100 p-4 rounded-lg">
                    {JSON.stringify(compiledSpec, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudioNew;
