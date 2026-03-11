/**
 * PuzzleConfigEditor — Studio components for configuring Puzzle games.
 *
 * Exports:
 *   PuzzleConfigEditor  — Visuals tab: sub-type, color scheme, timer, points
 *   PuzzleRoundsEditor  — Questions tab: rounds, items, bins
 */
import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ─────────────────────────────────────────────
// Colour scheme swatches
// ─────────────────────────────────────────────
const COLOR_SCHEMES = [
  { id: 'nature',  label: 'Nature',  swatch: 'bg-emerald-600' },
  { id: 'ocean',   label: 'Ocean',   swatch: 'bg-blue-600' },
  { id: 'space',   label: 'Space',   swatch: 'bg-purple-700' },
  { id: 'science', label: 'Science', swatch: 'bg-amber-600' },
  { id: 'warm',    label: 'Warm',    swatch: 'bg-rose-600' },
  { id: 'cool',    label: 'Cool',    swatch: 'bg-sky-600' },
];

// ─────────────────────────────────────────────
// PuzzleConfigEditor (Visuals tab)
// ─────────────────────────────────────────────
export function PuzzleConfigEditor({ puzzleConfig = {}, onPuzzleConfigChange, puzzleVisuals = {}, onPuzzleVisualsChange }) {
  const subType     = puzzleConfig.sub_type || 'sort';
  const colorScheme = puzzleVisuals.color_scheme || 'nature';
  const timeLimit   = puzzleConfig.time_limit_seconds || '';
  const points      = puzzleConfig.points_per_correct_placement || 100;
  const partial     = puzzleConfig.partial_credit !== false;

  const updateConfig  = (key, val) => onPuzzleConfigChange?.({ ...puzzleConfig, [key]: val });
  const updateVisuals = (key, val) => onPuzzleVisualsChange?.({ ...puzzleVisuals, [key]: val });

  return (
    <div className="space-y-6">
      {/* Sub-type */}
      <Card>
        <CardHeader><CardTitle className="text-base">Puzzle Type</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: 'sort',  label: 'Sort',  desc: 'Drag items into named category bins (classify, group, organize)' },
            { id: 'match', label: 'Match', desc: 'Connect each answer to the correct prompt (vocabulary, cause & effect)' },
            { id: 'order', label: 'Order', desc: 'Arrange items in the correct sequence (timelines, steps of a process)' },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => updateConfig('sub_type', opt.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                subType === opt.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                subType === opt.id ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
              }`} />
              <div>
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Color scheme */}
      <Card>
        <CardHeader><CardTitle className="text-base">Color Scheme</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_SCHEMES.map(cs => (
              <div
                key={cs.id}
                onClick={() => updateVisuals('color_scheme', cs.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                  colorScheme === cs.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full ${cs.swatch} flex-shrink-0`} />
                <span className="text-xs font-medium">{cs.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gameplay options */}
      <Card>
        <CardHeader><CardTitle className="text-base">Gameplay</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm">Time Limit (seconds)</Label>
              <p className="text-xs text-muted-foreground mb-1">Leave empty for no timer</p>
              <Input
                type="number"
                placeholder="e.g. 60"
                value={timeLimit}
                onChange={e => updateConfig('time_limit_seconds', e.target.value ? parseInt(e.target.value) : null)}
                className="max-w-[120px]"
              />
            </div>
            <div className="flex-1">
              <Label className="text-sm">Points Per Correct</Label>
              <p className="text-xs text-muted-foreground mb-1">Per correctly placed item</p>
              <Input
                type="number"
                value={points}
                onChange={e => updateConfig('points_per_correct_placement', parseInt(e.target.value) || 100)}
                className="max-w-[120px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Partial Credit</Label>
              <p className="text-xs text-muted-foreground">Score points for each correct placement even if round isn't perfect</p>
            </div>
            <Switch
              checked={partial}
              onCheckedChange={val => updateConfig('partial_credit', val)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────
// ItemRow
// ─────────────────────────────────────────────
function ItemRow({ item, bins, subType, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
      <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />

      <Input
        value={item.icon || ''}
        onChange={e => onChange({ ...item, icon: e.target.value })}
        placeholder="🔬"
        className="w-14 text-center text-base px-1"
      />

      <Input
        value={item.label || ''}
        onChange={e => onChange({ ...item, label: e.target.value })}
        placeholder="Item label"
        className="flex-1 text-sm"
      />

      {subType === 'order' ? (
        <Input
          type="number"
          value={item.correct_position || 1}
          onChange={e => onChange({ ...item, correct_position: parseInt(e.target.value) || 1 })}
          className="w-16 text-sm"
          placeholder="#"
          title="Correct position (1 = first)"
        />
      ) : (
        <Select
          value={item.correct_bin || ''}
          onValueChange={val => onChange({ ...item, correct_bin: val })}
        >
          <SelectTrigger className="w-36 text-xs">
            <SelectValue placeholder="Correct bin" />
          </SelectTrigger>
          <SelectContent>
            {bins.map(b => (
              <SelectItem key={b.id} value={b.id} className="text-xs">
                {b.icon} {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// BinRow
// ─────────────────────────────────────────────
function BinRow({ bin, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
      <Input
        value={bin.icon || ''}
        onChange={e => onChange({ ...bin, icon: e.target.value })}
        placeholder="📦"
        className="w-14 text-center text-base px-1"
      />
      <Input
        value={bin.label || ''}
        onChange={e => onChange({ ...bin, label: e.target.value })}
        placeholder="Category name"
        className="flex-1 text-sm"
      />
      <Input
        value={bin.hint || ''}
        onChange={e => onChange({ ...bin, hint: e.target.value })}
        placeholder="Hint (optional)"
        className="flex-1 text-sm"
      />
      <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// RoundEditor
// ─────────────────────────────────────────────
function RoundEditor({ round, roundIndex, subType, onChange, onDelete }) {
  const [expanded, setExpanded] = useState(true);

  const updateField = (key, val) => onChange({ ...round, [key]: val });

  const addItem = () => {
    const newItem = {
      id: `item_${Date.now()}`,
      label: '',
      icon: '',
      correct_bin: round.bins?.[0]?.id || '',
      ...(subType === 'order' ? { correct_position: (round.items?.length || 0) + 1 } : {}),
      ...(subType === 'match' ? { role: 'answer' } : {}),
    };
    updateField('items', [...(round.items || []), newItem]);
  };

  const addBin = () => {
    const binId = `bin_${Date.now()}`;
    const newBin = {
      id: binId,
      label: '',
      icon: '',
      hint: '',
      ...(subType === 'match' ? { is_prompt: true } : {}),
      ...(subType === 'order' ? { ordered: true } : {}),
    };
    updateField('bins', [...(round.bins || []), newBin]);
  };

  const updateItem = (i, updated) => {
    const items = [...(round.items || [])];
    items[i] = updated;
    updateField('items', items);
  };

  const deleteItem = (i) => {
    updateField('items', (round.items || []).filter((_, idx) => idx !== i));
  };

  const updateBin = (i, updated) => {
    const bins = [...(round.bins || [])];
    bins[i] = updated;
    updateField('bins', bins);
  };

  const deleteBin = (i) => {
    updateField('bins', (round.bins || []).filter((_, idx) => idx !== i));
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Round {roundIndex + 1}</Badge>
          <span className="text-sm font-medium text-slate-600 truncate max-w-[200px]">
            {round.instruction || 'No instruction yet'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setExpanded(e => !e)} className="w-7 h-7">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          <div>
            <Label className="text-xs mb-1">Instruction</Label>
            <Input
              value={round.instruction || ''}
              onChange={e => updateField('instruction', e.target.value)}
              placeholder="e.g. Drag each animal into its vertebrate class"
            />
          </div>

          <div>
            <Label className="text-xs mb-1">Explanation (shown after round)</Label>
            <Textarea
              value={round.explanation || ''}
              onChange={e => updateField('explanation', e.target.value)}
              placeholder="Explain the concept this round teaches..."
              rows={2}
              className="text-sm"
            />
          </div>

          {/* Bins */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">
                {subType === 'match' ? 'Prompts (left side)' : subType === 'order' ? 'Sequence Bin' : 'Category Bins'}
              </Label>
              {(subType !== 'order' || (round.bins || []).length === 0) && (
                <Button variant="outline" size="sm" onClick={addBin} className="h-6 text-xs px-2">
                  <Plus className="w-3 h-3 mr-1" /> Add {subType === 'match' ? 'Prompt' : subType === 'order' ? 'Sequence' : 'Bin'}
                </Button>
              )}
            </div>
            <div className="space-y-1.5">
              {(round.bins || []).map((bin, i) => (
                <BinRow
                  key={bin.id || i}
                  bin={bin}
                  onChange={updated => updateBin(i, updated)}
                  onDelete={() => deleteBin(i)}
                />
              ))}
              {(round.bins || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No bins yet — add one above</p>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs">
                {subType === 'match' ? 'Answers (right side)' : 'Items to place'}
                <span className="text-muted-foreground ml-1">({(round.items || []).length})</span>
              </Label>
              <Button variant="outline" size="sm" onClick={addItem} className="h-6 text-xs px-2">
                <Plus className="w-3 h-3 mr-1" /> Add Item
              </Button>
            </div>
            {subType === 'order' && (
              <p className="text-xs text-muted-foreground mb-2">Set the position number for each item (1 = first in sequence)</p>
            )}
            <div className="space-y-1.5">
              {(round.items || []).map((item, i) => (
                <ItemRow
                  key={item.id || i}
                  item={item}
                  bins={round.bins || []}
                  subType={subType}
                  onChange={updated => updateItem(i, updated)}
                  onDelete={() => deleteItem(i)}
                />
              ))}
              {(round.items || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">No items yet — add one above</p>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────
// PuzzleRoundsEditor (Questions tab)
// ─────────────────────────────────────────────
export function PuzzleRoundsEditor({ puzzleConfig = {}, onChange }) {
  const subType   = puzzleConfig.sub_type || 'sort';
  const roundsData = puzzleConfig.rounds_data || [];

  const updateRounds = (newRounds) => {
    onChange({ ...puzzleConfig, rounds_data: newRounds, rounds: newRounds.length });
  };

  const addRound = () => {
    const defaultBins = subType === 'order'
      ? [{ id: 'sequence', label: 'Correct Order', icon: '🔢', ordered: true }]
      : [];

    const newRound = {
      id: `round_${Date.now()}`,
      instruction: '',
      explanation: '',
      items: [],
      bins: defaultBins,
    };
    updateRounds([...roundsData, newRound]);
  };

  const updateRound = (i, updated) => {
    const next = [...roundsData];
    next[i] = updated;
    updateRounds(next);
  };

  const deleteRound = (i) => {
    updateRounds(roundsData.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">Puzzle Rounds</p>
          <p className="text-xs text-muted-foreground capitalize">
            Type: {subType} · {roundsData.length} round{roundsData.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={addRound} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Round
        </Button>
      </div>

      {roundsData.length === 0 && (
        <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
          <p className="mb-2">No rounds yet</p>
          <p className="text-sm">Click "Add Round" to build your first puzzle round</p>
        </div>
      )}

      {roundsData.map((round, i) => (
        <RoundEditor
          key={round.id || i}
          round={round}
          roundIndex={i}
          subType={subType}
          onChange={updated => updateRound(i, updated)}
          onDelete={() => deleteRound(i)}
        />
      ))}
    </div>
  );
}

// Default export for convenience
export default PuzzleConfigEditor;
