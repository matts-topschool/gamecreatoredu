/**
 * LivePreview - Real-time game preview component that renders a GameSpec.
 * Provides a visual representation of the game as teachers edit it.
 */
import React, { useMemo } from 'react';
import { 
  Gamepad2, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Trophy,
  Heart,
  Zap,
  Star
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * QuestionPreview - Renders a sample question from the game
 */
const QuestionPreview = ({ question, index }) => {
  if (!question) return null;

  return (
    <div className="p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold">
          {index + 1}
        </span>
        <p className="font-medium text-slate-800">{question.stem}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 ml-10">
        {question.options?.map((opt) => (
          <div
            key={opt.id}
            className={cn(
              "p-2 rounded-md text-sm border transition-colors",
              opt.is_correct 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-slate-50 border-slate-200 text-slate-700"
            )}
          >
            <span className="font-medium mr-2">{opt.id.toUpperCase()}.</span>
            {opt.text}
            {opt.is_correct && (
              <CheckCircle2 className="w-4 h-4 inline ml-2 text-emerald-600" />
            )}
          </div>
        ))}
      </div>

      {question.hints?.length > 0 && (
        <div className="mt-3 ml-10 flex items-center gap-2 text-xs text-amber-600">
          <HelpCircle className="w-4 h-4" />
          <span>Hint available</span>
        </div>
      )}
    </div>
  );
};

/**
 * EntityPreview - Renders player/enemy entities
 */
const EntityPreview = ({ entity, type }) => {
  if (!entity) return null;

  const bgColor = type === 'player' ? 'bg-blue-500' : 'bg-red-500';
  const size = entity.components?.sprite?.width || 64;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
      <div 
        className={cn("rounded-lg flex items-center justify-center", bgColor)}
        style={{ width: size / 2, height: size / 2 }}
      >
        <Gamepad2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-medium text-slate-800">{entity.name}</p>
        {entity.components?.health && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <Heart className="w-3 h-3" />
            <span>{entity.components.health.max} HP</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ScenePreview - Renders a game scene overview
 */
const ScenePreview = ({ scene }) => {
  if (!scene) return null;

  const typeIcons = {
    title: Star,
    gameplay: Gamepad2,
    question: HelpCircle,
    battle: Zap,
    victory: Trophy,
    result: Trophy,
  };

  const Icon = typeIcons[scene.type] || Gamepad2;

  return (
    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-md">
      <div className="w-8 h-8 rounded-md bg-violet-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-800 truncate">{scene.title || scene.id}</p>
        <p className="text-xs text-slate-500 capitalize">{scene.type}</p>
      </div>
    </div>
  );
};

/**
 * GamePreviewCanvas - Main game preview area
 */
const GamePreviewCanvas = ({ spec }) => {
  const gameType = spec?.meta?.game_type || 'quiz';
  const title = spec?.meta?.title || 'Untitled Game';
  const questions = spec?.content?.questions || [];

  // Background colors based on game type
  const bgGradients = {
    quiz: 'from-violet-900 to-indigo-900',
    battle: 'from-red-900 to-orange-900',
    adventure: 'from-emerald-900 to-teal-900',
    platformer: 'from-blue-900 to-cyan-900',
    puzzle: 'from-amber-900 to-yellow-900',
    simulation: 'from-pink-900 to-rose-900',
  };

  return (
    <div className={cn(
      "aspect-video rounded-lg overflow-hidden relative",
      "bg-gradient-to-br",
      bgGradients[gameType] || bgGradients.quiz
    )}>
      {/* HUD Mock */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Badge className="bg-white/20 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Score: 0
          </Badge>
          <Badge className="bg-white/20 text-white border-0">
            <Zap className="w-3 h-3 mr-1" />
            Combo: 0x
          </Badge>
        </div>
        <Badge className="bg-white/20 text-white border-0">
          1 / {questions.length}
        </Badge>
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-white text-center mb-2">{title}</h2>
        <p className="text-white/70 text-sm mb-4 capitalize">{gameType} Game</p>
        
        {questions.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md w-full">
            <p className="text-white text-center mb-3">{questions[0]?.stem}</p>
            <div className="grid grid-cols-2 gap-2">
              {questions[0]?.options?.slice(0, 4).map((opt, i) => (
                <Button 
                  key={i} 
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-sm"
                  size="sm"
                >
                  {opt.text}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
        <Button className="bg-white text-slate-900 hover:bg-white/90" size="lg">
          <Gamepad2 className="w-5 h-5 mr-2" />
          Preview Game
        </Button>
      </div>
    </div>
  );
};

/**
 * LivePreview - Main component
 */
const LivePreview = ({ spec, className }) => {
  // Memoize derived values
  const stats = useMemo(() => {
    if (!spec) return null;

    return {
      questionCount: spec.content?.questions?.length || 0,
      sceneCount: spec.scenes?.length || 0,
      ruleCount: spec.rules?.length || 0,
      variableCount: spec.state?.variables?.length || 0,
      gameType: spec.meta?.game_type || 'quiz',
      duration: spec.meta?.gameplay?.estimated_duration_minutes || 15,
      grades: spec.meta?.educational?.grade_levels || [],
      subjects: spec.meta?.educational?.subjects || [],
    };
  }, [spec]);

  if (!spec) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex items-center justify-center h-full p-6">
          <div className="text-center text-muted-foreground">
            <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No game spec to preview</p>
            <p className="text-sm">Generate or load a game to see the preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)} data-testid="live-preview">
      {/* Game Canvas */}
      <GamePreviewCanvas spec={spec} />

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 bg-slate-100 rounded-lg text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.questionCount}</p>
          <p className="text-xs text-slate-500">Questions</p>
        </div>
        <div className="p-3 bg-slate-100 rounded-lg text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.sceneCount}</p>
          <p className="text-xs text-slate-500">Scenes</p>
        </div>
        <div className="p-3 bg-slate-100 rounded-lg text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.ruleCount}</p>
          <p className="text-xs text-slate-500">Rules</p>
        </div>
        <div className="p-3 bg-slate-100 rounded-lg text-center">
          <p className="text-2xl font-bold text-slate-800">{stats.duration}m</p>
          <p className="text-xs text-slate-500">Duration</p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="capitalize">{stats.gameType}</Badge>
        {stats.grades.map((g) => (
          <Badge key={g} variant="secondary">Grade {g}</Badge>
        ))}
        {stats.subjects.map((s) => (
          <Badge key={s} variant="outline" className="capitalize">{s}</Badge>
        ))}
      </div>

      {/* Sample Questions */}
      {spec.content?.questions?.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Sample Questions
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {spec.content.questions.slice(0, 3).map((q, i) => (
              <QuestionPreview key={q.id || i} question={q} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Scenes */}
      {spec.scenes?.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Game Flow ({stats.sceneCount} scenes)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {spec.scenes.slice(0, 4).map((scene) => (
              <ScenePreview key={scene.id} scene={scene} />
            ))}
          </div>
        </div>
      )}

      {/* Entities */}
      {(spec.entities?.player || spec.entities?.enemies?.length > 0) && (
        <div className="space-y-2">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Characters
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {spec.entities.player && (
              <EntityPreview entity={spec.entities.player} type="player" />
            )}
            {spec.entities.enemies?.slice(0, 1).map((enemy) => (
              <EntityPreview key={enemy.id} entity={enemy} type="enemy" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePreview;
