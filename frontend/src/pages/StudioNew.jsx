/**
 * Studio New - AI-powered game creation page.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Loader2,
  Lightbulb,
  GraduationCap,
  BookOpen,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import useGameStore from '@/stores/gameStore';
import { toast } from 'sonner';

const examplePrompts = [
  {
    title: 'Math Quiz',
    prompt: 'Create a multiplication quiz for 3rd graders with a space theme. Include 10 questions that progress from easy to medium difficulty.',
    subjects: ['math'],
    grades: [3]
  },
  {
    title: 'Science Review',
    prompt: 'Make a review game about the water cycle for 5th grade science class. Include questions about evaporation, condensation, and precipitation.',
    subjects: ['science'],
    grades: [5]
  },
  {
    title: 'History Adventure',
    prompt: 'Design a quiz game about the American Revolution for middle school students. Focus on key events, important figures, and causes of the war.',
    subjects: ['history'],
    grades: [7, 8]
  }
];

const gradeOptions = [
  { value: 'k', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
  { value: '6', label: '6th Grade' },
  { value: '7', label: '7th Grade' },
  { value: '8', label: '8th Grade' },
  { value: '9', label: '9th Grade' },
  { value: '10', label: '10th Grade' },
  { value: '11', label: '11th Grade' },
  { value: '12', label: '12th Grade' },
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

const StudioNew = () => {
  const navigate = useNavigate();
  const { createGame, isLoading } = useGameStore();

  const [prompt, setPrompt] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [questionCount, setQuestionCount] = useState([10]);
  const [duration, setDuration] = useState([15]);

  const handleCreate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your game');
      return;
    }

    // Create a basic game with the prompt info
    // In Phase 2, this will call the AI compiler
    const gameData = {
      title: extractTitle(prompt),
      description: prompt.slice(0, 200),
      grade_levels: gradeLevel ? [parseInt(gradeLevel)] : [],
      subjects: subject ? [subject] : []
    };

    const game = await createGame(gameData);
    
    if (game) {
      toast.success('Game created! Customize it in the editor.');
      navigate(`/studio/${game.id}`);
    } else {
      toast.error('Failed to create game');
    }
  };

  const extractTitle = (text) => {
    // Extract a title from the prompt
    const words = text.split(' ').slice(0, 5);
    let title = words.join(' ');
    if (title.length > 50) {
      title = title.slice(0, 47) + '...';
    }
    return title || 'New Game';
  };

  const applyExample = (example) => {
    setPrompt(example.prompt);
    if (example.subjects[0]) setSubject(example.subjects[0]);
    if (example.grades[0]) setGradeLevel(example.grades[0].toString());
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="studio-new-page">
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
          Describe your educational game and let AI do the heavy lifting. 
          You can always customize it after.
        </p>
      </div>

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
                Be specific about the topic, grade level, and any special requirements.
              </p>
              <Textarea
                id="prompt"
                placeholder="Example: Create a multiplication quiz for 3rd graders with a space theme. Include 10 questions that progress from easy to medium difficulty."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px] resize-none"
                data-testid="game-prompt"
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {prompt.length} / 2000 characters
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
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
              </div>

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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>

              <div>
                <Label className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Estimated Duration
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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Button */}
          <Button
            onClick={handleCreate}
            disabled={isLoading || !prompt.trim()}
            className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-lg font-medium"
            data-testid="create-game-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating your game...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Create Game
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
                    {example.subjects[0]}
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

          <Card className="bg-slate-50 border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> The more specific your prompt, the better the results. 
                Include topic, grade level, number of questions, and any themes you want.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudioNew;
