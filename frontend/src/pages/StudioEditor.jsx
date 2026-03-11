/**
 * StudioEditor - Visual editor for customizing AI-generated games.
 * Provides a comprehensive interface for editing GameSpec JSON.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft,
  Settings,
  Loader2,
  Eye,
  Code,
  HelpCircle,
  Sparkles,
  Trash2,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Check,
  RefreshCw,
  Play,
  Gamepad2,
  BookOpen,
  Zap,
  Trophy,
  Globe,
  School
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import useGameStore from '@/stores/gameStore';
import LivePreview from '@/components/studio/LivePreview';
import PublishDialog from '@/components/studio/PublishDialog';
import AssignToClassDialog from '@/components/game/AssignToClassDialog';
import ThemeSelector from '@/game/ThemeSelector';
import AdventureWorldSelector from '@/game/AdventureWorldSelector';
import { PuzzleConfigEditor, PuzzleRoundsEditor } from '@/components/studio/PuzzleConfigEditor';
import api from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * QuestionEditor - Edit a single question
 */
const QuestionEditor = ({ question, index, onChange, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFieldChange = (field, value) => {
    onChange({ ...question, [field]: value });
  };

  const handleOptionChange = (optIndex, field, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
    
    // If setting correct, unset others
    if (field === 'is_correct' && value) {
      newOptions.forEach((opt, i) => {
        if (i !== optIndex) opt.is_correct = false;
      });
    }
    
    handleFieldChange('options', newOptions);
  };

  return (
    <Card className="border-slate-200">
      <div 
        className="p-4 cursor-pointer flex items-start gap-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="w-5 h-5 text-slate-400 cursor-grab flex-shrink-0 mt-0.5" />
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 truncate">{question.stem || 'New Question'}</p>
          <p className="text-xs text-slate-500 mt-1">
            {question.options?.filter(o => o.is_correct).length || 0} correct answer(s) • 
            Difficulty {question.difficulty || 1}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </div>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <div>
            <Label>Question Text</Label>
            <Textarea
              value={question.stem || ''}
              onChange={(e) => handleFieldChange('stem', e.target.value)}
              placeholder="Enter the question..."
              className="mt-1"
              data-testid={`question-${index}-stem`}
            />
          </div>

          <div>
            <Label className="mb-2 block">Answer Options</Label>
            <div className="space-y-2">
              {question.options?.map((opt, i) => (
                <div key={opt.id || i} className="flex items-center gap-2">
                  <Switch
                    checked={opt.is_correct}
                    onCheckedChange={(checked) => handleOptionChange(i, 'is_correct', checked)}
                    data-testid={`question-${index}-option-${i}-correct`}
                  />
                  <span className="w-6 text-sm font-medium text-slate-500">{opt.id?.toUpperCase() || String.fromCharCode(65 + i)}.</span>
                  <Input
                    value={opt.text || ''}
                    onChange={(e) => handleOptionChange(i, 'text', e.target.value)}
                    placeholder="Answer option..."
                    className={cn(
                      "flex-1",
                      opt.is_correct && "border-emerald-300 bg-emerald-50"
                    )}
                    data-testid={`question-${index}-option-${i}-text`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Difficulty (1-5)</Label>
              <Select 
                value={String(question.difficulty || 2)} 
                onValueChange={(v) => handleFieldChange('difficulty', parseInt(v))}
              >
                <SelectTrigger className="mt-1" data-testid={`question-${index}-difficulty`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} - {['Easy', 'Simple', 'Medium', 'Hard', 'Expert'][d-1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Explanation</Label>
              <Input
                value={question.explanation || ''}
                onChange={(e) => handleFieldChange('explanation', e.target.value)}
                placeholder="Why this is correct..."
                className="mt-1"
                data-testid={`question-${index}-explanation`}
              />
            </div>
          </div>

          <div>
            <Label>Hints (one per line)</Label>
            <Textarea
              value={(question.hints || []).join('\n')}
              onChange={(e) => handleFieldChange('hints', e.target.value.split('\n').filter(h => h.trim()))}
              placeholder="Add hints to help students..."
              className="mt-1"
              rows={2}
              data-testid={`question-${index}-hints`}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * MetaEditor - Edit game metadata
 */
const MetaEditor = ({ meta, onChange }) => {
  const handleChange = (path, value) => {
    const newMeta = { ...meta };
    const keys = path.split('.');
    let obj = newMeta;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newMeta);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Game Title</Label>
        <Input
          value={meta?.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter game title..."
          className="mt-1"
          data-testid="meta-title"
        />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          value={meta?.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your game..."
          className="mt-1"
          rows={3}
          data-testid="meta-description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Game Type</Label>
          <Select 
            value={meta?.game_type || 'quiz'} 
            onValueChange={(v) => handleChange('game_type', v)}
          >
            <SelectTrigger className="mt-1" data-testid="meta-game-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="battle">Monster Battle</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
              <SelectItem value="platformer">Platformer</SelectItem>
              <SelectItem value="puzzle">Puzzle</SelectItem>
              <SelectItem value="simulation">Simulation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            value={meta?.gameplay?.estimated_duration_minutes || 15}
            onChange={(e) => handleChange('gameplay.estimated_duration_minutes', parseInt(e.target.value))}
            className="mt-1"
            data-testid="meta-duration"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Grade Levels</Label>
          <Input
            value={(meta?.educational?.grade_levels || []).join(', ')}
            onChange={(e) => handleChange('educational.grade_levels', e.target.value.split(',').map(g => parseInt(g.trim())).filter(g => !isNaN(g)))}
            placeholder="e.g., 4, 5, 6"
            className="mt-1"
            data-testid="meta-grades"
          />
        </div>

        <div>
          <Label>Subjects</Label>
          <Input
            value={(meta?.educational?.subjects || []).join(', ')}
            onChange={(e) => handleChange('educational.subjects', e.target.value.split(',').map(s => s.trim().toLowerCase()).filter(s => s))}
            placeholder="e.g., math, science"
            className="mt-1"
            data-testid="meta-subjects"
          />
        </div>
      </div>

      <div>
        <Label>Learning Objectives (one per line)</Label>
        <Textarea
          value={(meta?.educational?.learning_objectives || []).join('\n')}
          onChange={(e) => handleChange('educational.learning_objectives', e.target.value.split('\n').filter(o => o.trim()))}
          placeholder="What will students learn?"
          className="mt-1"
          rows={3}
          data-testid="meta-objectives"
        />
      </div>
    </div>
  );
};

/**
 * SettingsEditor - Edit game settings
 */
const SettingsEditor = ({ settings, onChange }) => {
  const handleChange = (path, value) => {
    const newSettings = { ...settings };
    const keys = path.split('.');
    let obj = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newSettings);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium">Allow Hints</p>
            <p className="text-sm text-muted-foreground">Students can request hints</p>
          </div>
          <Switch
            checked={settings?.allow_hints !== false}
            onCheckedChange={(v) => handleChange('allow_hints', v)}
            data-testid="settings-hints"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium">Shuffle Questions</p>
            <p className="text-sm text-muted-foreground">Randomize question order</p>
          </div>
          <Switch
            checked={settings?.shuffle_questions !== false}
            onCheckedChange={(v) => handleChange('shuffle_questions', v)}
            data-testid="settings-shuffle"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium">Show Explanations</p>
            <p className="text-sm text-muted-foreground">Show answer explanations</p>
          </div>
          <Switch
            checked={settings?.show_explanation !== false}
            onCheckedChange={(v) => handleChange('show_explanation', v)}
            data-testid="settings-explanations"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium">Enable Leaderboard</p>
            <p className="text-sm text-muted-foreground">Track top scores</p>
          </div>
          <Switch
            checked={settings?.leaderboard?.enabled !== false}
            onCheckedChange={(v) => handleChange('leaderboard.enabled', v)}
            data-testid="settings-leaderboard"
          />
        </div>
      </div>

      {settings?.leaderboard?.enabled !== false && (
        <div>
          <Label>Leaderboard Type</Label>
          <Select 
            value={settings?.leaderboard?.type || 'score'} 
            onValueChange={(v) => handleChange('leaderboard.type', v)}
          >
            <SelectTrigger className="mt-1" data-testid="settings-leaderboard-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Highest Score</SelectItem>
              <SelectItem value="time">Fastest Time</SelectItem>
              <SelectItem value="accuracy">Best Accuracy</SelectItem>
              <SelectItem value="combo">Highest Combo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

/**
 * Main StudioEditor Component
 */
const StudioEditor = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { 
    currentGame, 
    currentSpec, 
    isLoading, 
    isDirty,
    fetchGame, 
    saveSpec,
    updateSpecLocally,
    deleteGame
  } = useGameStore();

  const [activeTab, setActiveTab] = useState('questions');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Load game on mount
  useEffect(() => {
    if (gameId) {
      fetchGame(gameId);
    }
  }, [gameId, fetchGame]);

  // Handle spec updates
  const updateSpec = useCallback((path, value) => {
    if (!currentSpec) return;
    
    const newSpec = { ...currentSpec };
    const keys = path.split('.');
    let obj = newSpec;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    updateSpecLocally(newSpec);
  }, [currentSpec, updateSpecLocally]);

  // Save game
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveSpec();
      if (result) {
        toast.success('Game saved!');
      } else {
        toast.error('Failed to save game');
      }
    } catch (error) {
      toast.error('Failed to save game');
    } finally {
      setIsSaving(false);
    }
  };

  // Refine with AI
  const handleRefine = async () => {
    if (!refinePrompt.trim()) {
      toast.error('Please describe your changes');
      return;
    }

    setIsRefining(true);
    try {
      const response = await api.post('/ai/refine', {
        current_spec: currentSpec,
        refinement_prompt: refinePrompt
      });

      if (response.data.success) {
        updateSpecLocally(response.data.spec);
        setRefinePrompt('');
        toast.success('Game updated with AI!');
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to refine game';
      toast.error(message);
    } finally {
      setIsRefining(false);
    }
  };

  // Delete game
  const handleDelete = async () => {
    const success = await deleteGame(gameId);
    if (success) {
      toast.success('Game deleted');
      navigate('/studio');
    } else {
      toast.error('Failed to delete game');
    }
  };

  // Add new question
  const addQuestion = () => {
    const questions = currentSpec?.content?.questions || [];
    const newQuestion = {
      id: `q${questions.length + 1}`,
      type: 'multiple_choice',
      stem: '',
      options: [
        { id: 'a', text: '', is_correct: false },
        { id: 'b', text: '', is_correct: false },
        { id: 'c', text: '', is_correct: false },
        { id: 'd', text: '', is_correct: false },
      ],
      explanation: '',
      difficulty: 2,
      hints: []
    };
    updateSpec('content.questions', [...questions, newQuestion]);
  };

  // Update question
  const updateQuestion = (index, question) => {
    const questions = [...(currentSpec?.content?.questions || [])];
    questions[index] = question;
    updateSpec('content.questions', questions);
  };

  // Delete question
  const deleteQuestion = (index) => {
    const questions = [...(currentSpec?.content?.questions || [])];
    questions.splice(index, 1);
    updateSpec('content.questions', questions);
  };

  // Loading state
  if (isLoading && !currentGame) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // Not found
  if (!currentGame && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
        <p className="text-muted-foreground mb-4">The game you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/studio')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Studio
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="studio-editor-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/studio')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-outfit">{currentSpec?.meta?.title || 'Untitled Game'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {currentSpec?.meta?.game_type || 'quiz'}
              </Badge>
              {isDirty && (
                <Badge variant="secondary" className="text-amber-600 bg-amber-50">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate(`/play/${gameId}`)}
            data-testid="preview-game-btn"
          >
            <Play className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowAssignDialog(true)}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            data-testid="assign-game-btn"
          >
            <School className="w-4 h-4 mr-2" />
            Assign
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowPublishDialog(true)}
            className="text-violet-600 border-violet-200 hover:bg-violet-50"
            data-testid="publish-game-btn"
          >
            <Globe className="w-4 h-4 mr-2" />
            Publish
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Game?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your game.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button 
            onClick={handleSave} 
            disabled={isSaving || !isDirty}
            className="bg-violet-600 hover:bg-violet-700"
            data-testid="save-game-btn"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Game
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="questions" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="visuals" className="gap-2">
                <Gamepad2 className="w-4 h-4" />
                Visuals
              </TabsTrigger>
              <TabsTrigger value="meta" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Info
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2">
                <Code className="w-4 h-4" />
                JSON
              </TabsTrigger>
            </TabsList>

            {/* Questions Tab */}
            <TabsContent value="questions" className="mt-4">
              {currentSpec?.meta?.game_type === 'puzzle' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Puzzle Rounds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PuzzleRoundsEditor
                      puzzleConfig={currentSpec?.puzzle_config || {}}
                      onChange={(cfg) => updateSpec('puzzle_config', cfg)}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-lg">
                      Questions ({currentSpec?.content?.questions?.length || 0})
                    </CardTitle>
                    <Button onClick={addQuestion} size="sm" data-testid="add-question-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {currentSpec?.content?.questions?.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No questions yet</p>
                        <p className="text-sm">Click "Add Question" to create your first question</p>
                      </div>
                    )}
                    {currentSpec?.content?.questions?.map((q, i) => (
                      <QuestionEditor
                        key={q.id || i}
                        question={q}
                        index={i}
                        onChange={(updated) => updateQuestion(i, updated)}
                        onDelete={() => deleteQuestion(i)}
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Visuals Tab - Battle & Adventure Game Customization */}
            <TabsContent value="visuals" className="mt-4">
              {currentSpec?.meta?.game_type === 'battle' ? (
                <ThemeSelector
                  selectedTheme={currentSpec?.battle_visuals?.theme || 'fantasy_castle'}
                  selectedCharacter={currentSpec?.battle_visuals?.playerCharacter || 'knight'}
                  selectedEnemy={currentSpec?.battle_visuals?.enemyType || 'orc'}
                  onThemeChange={(theme) => updateSpec('battle_visuals.theme', theme)}
                  onCharacterChange={(char) => updateSpec('battle_visuals.playerCharacter', char)}
                  onEnemyChange={(enemy) => updateSpec('battle_visuals.enemyType', enemy)}
                  battleRounds={currentSpec?.battle_config?.rounds || 10}
                  onBattleRoundsChange={(rounds) => updateSpec('battle_config.rounds', rounds)}
                  timerPerRound={currentSpec?.battle_config?.timer_per_round || 30}
                  onTimerPerRoundChange={(timer) => updateSpec('battle_config.timer_per_round', timer)}
                  damagePerCorrect={currentSpec?.battle_config?.damage_per_correct || 25}
                  onDamagePerCorrectChange={(damage) => updateSpec('battle_config.damage_per_correct', damage)}
                  gameType="battle"
                />
              ) : currentSpec?.meta?.game_type === 'adventure' ? (
                <AdventureWorldSelector
                  selectedWorld={currentSpec?.adventure_visuals?.world || 'pirate_voyage'}
                  onWorldChange={(world) => updateSpec('adventure_visuals.world', world)}
                  sceneCount={currentSpec?.adventure_config?.scene_count || 5}
                  onSceneCountChange={(count) => updateSpec('adventure_config.scene_count', count)}
                  questionsPerScene={currentSpec?.adventure_config?.questions_per_scene || 2}
                  onQuestionsPerSceneChange={(count) => updateSpec('adventure_config.questions_per_scene', count)}
                />
              ) : currentSpec?.meta?.game_type === 'puzzle' ? (
                <PuzzleConfigEditor
                  puzzleConfig={currentSpec?.puzzle_config || {}}
                  onPuzzleConfigChange={(cfg) => updateSpec('puzzle_config', cfg)}
                  puzzleVisuals={currentSpec?.puzzle_visuals || {}}
                  onPuzzleVisualsChange={(vis) => updateSpec('puzzle_visuals', vis)}
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold mb-2">Visual Customization</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Visual customization is available for <strong>Monster Battle</strong> and <strong>Adventure</strong> games. 
                      Change the game type in the Info tab to unlock visual customization options like
                      arena themes, characters, or adventure worlds.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Meta Tab */}
            <TabsContent value="meta" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Game Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetaEditor
                    meta={currentSpec?.meta}
                    onChange={(meta) => updateSpec('meta', meta)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Game Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <SettingsEditor
                    settings={currentSpec?.settings}
                    onChange={(settings) => updateSpec('settings', settings)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* JSON Tab */}
            <TabsContent value="json" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Raw GameSpec JSON</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto max-h-[500px] bg-slate-900 text-slate-100 p-4 rounded-lg">
                    {JSON.stringify(currentSpec, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* AI Refinement */}
          <Card className="border-violet-200 bg-violet-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                Refine with AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Textarea
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  placeholder="Describe changes you want to make... e.g., 'Make questions harder' or 'Add more questions about fractions'"
                  className="flex-1 bg-white"
                  rows={2}
                  data-testid="refine-prompt"
                />
                <Button
                  onClick={handleRefine}
                  disabled={isRefining || !refinePrompt.trim()}
                  className="bg-violet-600 hover:bg-violet-700 self-end"
                  data-testid="refine-btn"
                >
                  {isRefining ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LivePreview spec={currentSpec} />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Publish Dialog */}
      <PublishDialog 
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        game={currentGame}
        onPublished={(result) => {
          toast.success('Game published to marketplace!');
          // Optionally refresh game data
          fetchGame(gameId);
        }}
      />
      
      {/* Assign to Class Dialog */}
      <AssignToClassDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        game={currentGame}
        onAssigned={(assignment) => {
          // Could track assignment in game state if needed
        }}
      />
    </div>
  );
};

export default StudioEditor;
