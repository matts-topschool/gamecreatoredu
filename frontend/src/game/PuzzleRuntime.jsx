/**
 * PuzzleRuntime — Drag-and-drop educational puzzle game.
 *
 * Sub-types:
 *   "sort"  — drag items into named category bins
 *   "match" — connect answers to prompt cards
 *   "order" — arrange items in the correct sequence
 *
 * Props:
 *   spec           — GameSpec with puzzle_config and puzzle_visuals
 *   onComplete(result) — called with { score, accuracy, correctAnswers, questionsAnswered, totalTime, maxCombo, hintsUsed, enemyDefeated }
 *   onExit()       — called when user exits
 *   colorScheme    — override puzzle_visuals.color_scheme
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CheckCircle2, XCircle, Lightbulb, ChevronRight,
  RotateCcw, LogOut, Trophy, Clock, Target, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// ─────────────────────────────────────────────
// Colour schemes
// ─────────────────────────────────────────────
const COLOR_SCHEMES = {
  nature:  { bg: 'from-emerald-900 via-green-900 to-teal-900',   accent: 'emerald', bin: 'bg-emerald-800/50 border-emerald-600', binHover: 'bg-emerald-700/60 border-emerald-400' },
  ocean:   { bg: 'from-blue-900 via-cyan-900 to-slate-900',      accent: 'cyan',    bin: 'bg-blue-800/50 border-blue-600',    binHover: 'bg-blue-700/60 border-blue-400' },
  space:   { bg: 'from-slate-900 via-purple-900 to-indigo-900',  accent: 'purple',  bin: 'bg-slate-800/50 border-purple-600', binHover: 'bg-purple-700/60 border-purple-400' },
  science: { bg: 'from-orange-900 via-amber-900 to-yellow-900',  accent: 'amber',   bin: 'bg-orange-800/50 border-orange-600',binHover: 'bg-orange-700/60 border-orange-400' },
  warm:    { bg: 'from-rose-900 via-pink-900 to-fuchsia-900',    accent: 'pink',    bin: 'bg-rose-800/50 border-rose-600',    binHover: 'bg-rose-700/60 border-rose-400' },
  cool:    { bg: 'from-sky-900 via-indigo-900 to-violet-900',    accent: 'sky',     bin: 'bg-sky-800/50 border-sky-600',      binHover: 'bg-sky-700/60 border-sky-400' },
};

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────
// DraggableItem
// ─────────────────────────────────────────────
function DraggableItem({ item, isDragging, onDragStart, onDragEnd, status, compact }) {
  const statusClasses = {
    correct: 'border-emerald-400 bg-emerald-900/60 text-emerald-100',
    incorrect: 'border-red-400 bg-red-900/60 text-red-100',
    default: 'border-slate-500 bg-slate-700/70 text-slate-100 hover:border-slate-300 hover:bg-slate-600/70 cursor-grab active:cursor-grabbing',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: isDragging ? 0.95 : 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      draggable={status === 'default'}
      onDragStart={(e) => {
        e.dataTransfer.setData('itemId', item.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(item.id);
      }}
      onDragEnd={onDragEnd}
      className={`
        select-none border-2 rounded-xl transition-all duration-150
        ${compact ? 'px-3 py-2' : 'px-4 py-3'}
        ${statusClasses[status] || statusClasses.default}
      `}
    >
      <div className="flex items-center gap-2">
        {item.icon && <span className="text-xl leading-none">{item.icon}</span>}
        <span className={`font-medium ${compact ? 'text-sm' : 'text-base'}`}>{item.label}</span>
        {status === 'correct' && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-400 flex-shrink-0" />}
        {status === 'incorrect' && <XCircle className="w-4 h-4 ml-auto text-red-400 flex-shrink-0" />}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// DropBin
// ─────────────────────────────────────────────
function DropBin({ bin, items, allItems, onDrop, onReturnItem, isDragOver, scheme, showFeedback, correctItems, incorrectItems, subType }) {
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };

  const binItems = items.map(id => allItems.find(i => i.id === id)).filter(Boolean);

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('itemId'); if (id) onDrop(id, bin.id); }}
      onDragLeave={(e) => e.currentTarget === e.target && null}
      className={`
        relative border-2 rounded-2xl p-3 min-h-[120px] transition-all duration-200 flex flex-col gap-2
        ${isDragOver ? scheme.binHover : scheme.bin}
        ${isDragOver ? 'scale-[1.02] shadow-lg' : ''}
      `}
    >
      {/* Bin header */}
      <div className="flex items-center gap-2 pb-1 border-b border-white/10">
        {bin.icon && <span className="text-lg">{bin.icon}</span>}
        <span className="font-semibold text-white text-sm">{bin.label}</span>
        {bin.hint && (
          <span className="ml-auto text-xs text-slate-400 italic truncate max-w-[120px]">{bin.hint}</span>
        )}
      </div>

      {/* Dropped items */}
      <AnimatePresence>
        {binItems.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            isDragging={false}
            onDragStart={() => onReturnItem(item.id, bin.id)}
            onDragEnd={() => {}}
            status={
              !showFeedback ? 'default'
              : correctItems.has(item.id) ? 'correct'
              : incorrectItems.has(item.id) ? 'incorrect'
              : 'default'
            }
            compact
          />
        ))}
      </AnimatePresence>

      {/* Order positions */}
      {subType === 'order' && binItems.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Drop items here in order
        </div>
      )}
      {binItems.length === 0 && subType !== 'order' && (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
          Drop here
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PromptCard (match sub-type)
// ─────────────────────────────────────────────
function PromptCard({ bin, matchedItem, showFeedback, isCorrect }) {
  return (
    <div className={`
      border-2 rounded-2xl p-3 flex flex-col gap-2 transition-all
      ${showFeedback && matchedItem
        ? isCorrect ? 'border-emerald-400 bg-emerald-900/40' : 'border-red-400 bg-red-900/40'
        : 'border-slate-600 bg-slate-800/50'}
    `}>
      <div className="flex items-center gap-2">
        {bin.icon && <span className="text-lg">{bin.icon}</span>}
        <span className="font-medium text-white text-sm leading-snug">{bin.label}</span>
      </div>
      {matchedItem && (
        <div className="flex items-center gap-2 border border-white/20 rounded-xl px-3 py-2 bg-white/5">
          {matchedItem.icon && <span className="text-base">{matchedItem.icon}</span>}
          <span className="text-sm text-slate-200">{matchedItem.label}</span>
          {showFeedback && (isCorrect
            ? <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-400" />
            : <XCircle className="w-4 h-4 ml-auto text-red-400" />)}
        </div>
      )}
      {!matchedItem && (
        <div className="border-2 border-dashed border-slate-600 rounded-xl px-3 py-4 text-center text-slate-500 text-xs">
          Drop answer here
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PuzzleRuntime
// ─────────────────────────────────────────────
export default function PuzzleRuntime({ spec, onComplete, onExit, colorScheme: colorSchemeProp }) {
  const puzzleConfig  = spec?.puzzle_config || {};
  const puzzleVisuals = spec?.puzzle_visuals || {};
  const subType       = puzzleConfig.sub_type || 'sort';
  const rounds        = puzzleConfig.rounds_data || [];
  const timeLimit     = puzzleConfig.time_limit_seconds || null;
  const pointsPerCorrect = puzzleConfig.points_per_correct_placement || 100;

  const schemeKey = colorSchemeProp || puzzleVisuals.color_scheme || 'nature';
  const scheme    = COLOR_SCHEMES[schemeKey] || COLOR_SCHEMES.nature;

  // ── Game state ──
  const [gamePhase, setGamePhase]           = useState('intro');   // intro | playing | round_feedback | final_results
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [itemPool, setItemPool]             = useState([]);         // item ids not yet placed
  const [boardState, setBoardState]         = useState({});         // { binId: [itemId, ...] }
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [dragOverBinId, setDragOverBinId]   = useState(null);

  // ── Scoring ──
  const [roundResults, setRoundResults]     = useState([]);
  const [totalScore, setTotalScore]         = useState(0);
  const [totalCorrect, setTotalCorrect]     = useState(0);
  const [totalPlacements, setTotalPlacements] = useState(0);

  // ── Feedback ──
  const [showFeedback, setShowFeedback]     = useState(false);
  const [correctItems, setCorrectItems]     = useState(new Set());
  const [incorrectItems, setIncorrectItems] = useState(new Set());
  const [showHints, setShowHints]           = useState(false);
  const [hintsUsed, setHintsUsed]           = useState(0);

  // ── Timer ──
  const [timeLeft, setTimeLeft]             = useState(null);
  const timerRef    = useRef(null);
  const startTimeRef = useRef(Date.now());

  const currentRound = rounds[currentRoundIndex];

  // ── Init a round ──
  const initRound = useCallback((round) => {
    if (!round) return;
    const draggableItems = subType === 'match'
      ? round.items.filter(i => i.role === 'answer' || !i.is_prompt)
      : round.items;

    setItemPool(shuffleArray(draggableItems.map(i => i.id)));

    const emptyBoard = {};
    round.bins.forEach(b => { emptyBoard[b.id] = []; });
    // For match, prompt bins start with no matched item
    setBoardState(emptyBoard);

    setShowFeedback(false);
    setCorrectItems(new Set());
    setIncorrectItems(new Set());
    setShowHints(false);

    if (timeLimit) setTimeLeft(timeLimit);
  }, [subType, timeLimit]);

  // Start first round
  useEffect(() => {
    if (gamePhase === 'playing' && currentRound) {
      initRound(currentRound);
    }
  }, [gamePhase, currentRoundIndex]); // eslint-disable-line

  // Timer countdown
  useEffect(() => {
    if (gamePhase !== 'playing' || !timeLimit) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmitRound(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gamePhase, currentRoundIndex]); // eslint-disable-line

  // ── Drag handlers ──
  const handleDragStart = (itemId) => setDraggingItemId(itemId);
  const handleDragEnd   = () => { setDraggingItemId(null); setDragOverBinId(null); };

  const handleDropOnBin = (itemId, binId) => {
    clearInterval(timerRef.current);
    if (!itemId || showFeedback) return;

    // Remove from pool and all bins
    setItemPool(prev => prev.filter(id => id !== itemId));
    setBoardState(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(bid => { next[bid] = next[bid].filter(id => id !== itemId); });
      // For match, each bin holds at most 1 item — swap if occupied
      if (subType === 'match' && next[binId].length > 0) {
        const displaced = next[binId][0];
        setItemPool(p => [...p, displaced]);
        next[binId] = [];
      }
      next[binId] = [...next[binId], itemId];
      return next;
    });
    setDragOverBinId(null);

    // Restart timer if still running
    if (timeLimit && timeLeft > 0) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmitRound(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
  };

  const handleReturnItem = (itemId, fromBinId) => {
    if (showFeedback) return;
    setBoardState(prev => ({
      ...prev,
      [fromBinId]: prev[fromBinId].filter(id => id !== itemId)
    }));
    setItemPool(prev => [...prev, itemId]);
  };

  // ── Scoring ──
  const handleSubmitRound = useCallback(() => {
    clearInterval(timerRef.current);
    if (!currentRound) return;

    let correct = 0;
    const rightSet = new Set();
    const wrongSet  = new Set();

    currentRound.items.forEach(item => {
      let isCorrect = false;

      if (subType === 'sort' || subType === 'match') {
        // Find which bin this item is in
        const placedBin = Object.entries(boardState).find(([, ids]) => ids.includes(item.id))?.[0];
        isCorrect = placedBin === item.correct_bin;
      } else if (subType === 'order') {
        const seqBin = Object.entries(boardState).find(([binId]) => binId === 'sequence');
        const pos = seqBin ? seqBin[1].indexOf(item.id) : -1;
        isCorrect = pos === (item.correct_position - 1);
      }

      if (isCorrect) { correct++; rightSet.add(item.id); }
      else           { wrongSet.add(item.id); }
    });

    const roundPoints = correct * pointsPerCorrect;
    const result = { correct, total: currentRound.items.length, points: roundPoints };

    setCorrectItems(rightSet);
    setIncorrectItems(wrongSet);
    setShowFeedback(true);
    setRoundResults(prev => [...prev, result]);
    setTotalScore(s => s + roundPoints);
    setTotalCorrect(t => t + correct);
    setTotalPlacements(t => t + currentRound.items.length);
    setGamePhase('round_feedback');
  }, [currentRound, boardState, subType, pointsPerCorrect]);

  const handleNextRound = () => {
    if (currentRoundIndex < rounds.length - 1) {
      setCurrentRoundIndex(i => i + 1);
      setGamePhase('playing');
    } else {
      // Game complete
      const finalScore     = totalScore;
      const finalCorrect   = totalCorrect;
      const finalTotal     = totalPlacements;
      const accuracy       = finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0;
      const elapsed        = Date.now() - startTimeRef.current;

      setGamePhase('final_results');

      if (accuracy >= 70) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      onComplete?.({
        score: finalScore,
        accuracy,
        correctAnswers: finalCorrect,
        questionsAnswered: finalTotal,
        totalTime: elapsed,
        maxCombo: 0,
        hintsUsed,
        enemyDefeated: false
      });
    }
  };

  const handleHint = () => {
    setShowHints(true);
    setHintsUsed(h => h + 1);
  };

  const handleRestart = () => {
    setGamePhase('intro');
    setCurrentRoundIndex(0);
    setRoundResults([]);
    setTotalScore(0);
    setTotalCorrect(0);
    setTotalPlacements(0);
    setHintsUsed(0);
    startTimeRef.current = Date.now();
  };

  // All items in the round (for lookup)
  const allItems = currentRound?.items || [];
  const promptBins  = (currentRound?.bins || []).filter(b => b.is_prompt);
  const dropBins    = (currentRound?.bins || []).filter(b => !b.is_prompt);

  const allPlaced = itemPool.length === 0;
  const progressPct = rounds.length > 0 ? ((currentRoundIndex) / rounds.length) * 100 : 0;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gradient-to-br ${scheme.bg} text-white flex flex-col`}>

      {/* ── HUD ── */}
      {gamePhase !== 'intro' && gamePhase !== 'final_results' && (
        <div className="flex items-center gap-4 px-6 py-3 bg-black/20 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">Round {currentRoundIndex + 1}/{rounds.length}</span>
          </div>
          <Progress value={progressPct} className="h-1.5 flex-1 max-w-xs" />
          <div className="flex items-center gap-2 text-sm font-medium ml-auto">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>{totalScore.toLocaleString()} pts</span>
          </div>
          {timeLimit && timeLeft !== null && (
            <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={onExit} className="text-slate-400 hover:text-white ml-2">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ── INTRO ── */}
      <AnimatePresence>
        {gamePhase === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="text-6xl mb-6">🧩</div>
            <h1 className="text-4xl font-bold font-outfit mb-3">
              {spec?.meta?.title || 'Puzzle Challenge'}
            </h1>
            <p className="text-slate-300 text-lg mb-4 max-w-md">
              {spec?.meta?.description}
            </p>
            <div className="flex gap-3 mb-8 flex-wrap justify-center">
              <Badge variant="outline" className="border-white/30 text-white">
                {rounds.length} {rounds.length === 1 ? 'round' : 'rounds'}
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white capitalize">
                {subType}
              </Badge>
              {timeLimit && (
                <Badge variant="outline" className="border-white/30 text-white">
                  {timeLimit}s per round
                </Badge>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8"
                onClick={() => setGamePhase('playing')}
              >
                Start Game
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
              {onExit && (
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onExit}>
                  Exit
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PLAYING ── */}
      {(gamePhase === 'playing' || gamePhase === 'round_feedback') && currentRound && (
        <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 overflow-auto">

          {/* Round instruction */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Round {currentRoundIndex + 1}</p>
              <h2 className="text-xl font-semibold text-white">{currentRound.instruction}</h2>
            </div>
            {puzzleConfig.allow_hints !== false && !showFeedback && (
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 flex-shrink-0" onClick={handleHint}>
                <Lightbulb className="w-4 h-4 mr-1" />
                Hint
              </Button>
            )}
          </div>

          {/* ── SORT / ORDER layout ── */}
          {(subType === 'sort' || subType === 'order') && (
            <div className="flex flex-col gap-4">
              {/* Item pool */}
              <div
                className="flex flex-wrap gap-2 p-4 bg-black/20 rounded-2xl min-h-[80px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('itemId'); if (id) { setBoardState(prev => { const next = { ...prev }; Object.keys(next).forEach(b => { next[b] = next[b].filter(i => i !== id); }); return next; }); setItemPool(prev => prev.includes(id) ? prev : [...prev, id]); } }}
              >
                {itemPool.length === 0 && !showFeedback && (
                  <p className="text-slate-500 text-sm self-center mx-auto">All items placed — check your answers!</p>
                )}
                <AnimatePresence>
                  {itemPool.map(itemId => {
                    const item = allItems.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <DraggableItem
                        key={itemId} item={item}
                        isDragging={draggingItemId === itemId}
                        onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                        status="default"
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Bins */}
              <div className={`grid gap-3 ${subType === 'order' ? 'grid-cols-1 max-w-lg mx-auto w-full' : 'grid-cols-2 md:grid-cols-3'}`}>
                {(subType === 'order' ? currentRound.bins.filter(b => b.id === 'sequence') : dropBins).map(bin => (
                  <DropBin
                    key={bin.id} bin={bin}
                    items={boardState[bin.id] || []}
                    allItems={allItems}
                    onDrop={handleDropOnBin}
                    onReturnItem={handleReturnItem}
                    isDragOver={dragOverBinId === bin.id}
                    scheme={scheme}
                    showFeedback={showFeedback}
                    correctItems={correctItems}
                    incorrectItems={incorrectItems}
                    subType={subType}
                  />
                ))}
                {subType === 'sort' && dropBins.length === 0 && currentRound.bins.map(bin => (
                  <DropBin
                    key={bin.id} bin={bin}
                    items={boardState[bin.id] || []}
                    allItems={allItems}
                    onDrop={handleDropOnBin}
                    onReturnItem={handleReturnItem}
                    isDragOver={dragOverBinId === bin.id}
                    scheme={scheme}
                    showFeedback={showFeedback}
                    correctItems={correctItems}
                    incorrectItems={incorrectItems}
                    subType={subType}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── MATCH layout ── */}
          {subType === 'match' && (
            <div className="flex gap-4">
              {/* Prompt column */}
              <div className="flex-1 flex flex-col gap-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Prompts</p>
                {(promptBins.length > 0 ? promptBins : currentRound.bins).map(bin => {
                  const matchedItemId = (boardState[bin.id] || [])[0];
                  const matchedItem   = allItems.find(i => i.id === matchedItemId);
                  const isCorrect     = matchedItem && matchedItem.correct_bin === bin.id;
                  return (
                    <div
                      key={bin.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('itemId'); if (id) handleDropOnBin(id, bin.id); }}
                    >
                      <PromptCard
                        bin={bin} matchedItem={matchedItem}
                        showFeedback={showFeedback} isCorrect={isCorrect}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Answer pool column */}
              <div className="w-48 flex flex-col gap-3">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Answers</p>
                <div
                  className="flex flex-col gap-2 p-3 bg-black/20 rounded-2xl min-h-[120px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('itemId'); if (id) { setBoardState(prev => { const next = { ...prev }; Object.keys(next).forEach(b => { next[b] = next[b].filter(i => i !== id); }); return next; }); setItemPool(prev => prev.includes(id) ? prev : [...prev, id]); } }}
                >
                  <AnimatePresence>
                    {itemPool.map(itemId => {
                      const item = allItems.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                        <DraggableItem
                          key={itemId} item={item}
                          isDragging={draggingItemId === itemId}
                          onDragStart={handleDragStart} onDragEnd={handleDragEnd}
                          status="default" compact
                        />
                      );
                    })}
                  </AnimatePresence>
                  {itemPool.length === 0 && (
                    <p className="text-slate-500 text-xs text-center mt-4">All matched!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hints overlay */}
          {showHints && !showFeedback && (
            <div className="bg-amber-900/40 border border-amber-500/40 rounded-xl p-4">
              <p className="text-amber-300 font-medium text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Hints
              </p>
              <ul className="space-y-1">
                {currentRound.bins.filter(b => b.hint).map(bin => (
                  <li key={bin.id} className="text-amber-200 text-sm">
                    <span className="font-semibold">{bin.label}:</span> {bin.hint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit / feedback */}
          {gamePhase === 'playing' && (
            <Button
              size="lg"
              disabled={!allPlaced}
              className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold disabled:opacity-40"
              onClick={handleSubmitRound}
            >
              {allPlaced ? 'Check Answers' : `Place all items to continue (${itemPool.length} remaining)`}
            </Button>
          )}

          {/* Round feedback */}
          <AnimatePresence>
            {gamePhase === 'round_feedback' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-black/30 border border-white/10 rounded-2xl p-5 space-y-3"
              >
                {(() => {
                  const last = roundResults[roundResults.length - 1];
                  const pct  = last ? Math.round((last.correct / last.total) * 100) : 0;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-white">
                            {pct >= 80 ? '🎉 Excellent!' : pct >= 50 ? '👍 Good effort!' : '📖 Keep learning!'}
                          </p>
                          <p className="text-slate-300 text-sm">
                            {last?.correct}/{last?.total} correct · +{last?.points} pts
                          </p>
                        </div>
                        <div className="text-3xl font-bold text-white">{pct}%</div>
                      </div>
                      {currentRound.explanation && (
                        <div className="bg-white/5 rounded-xl p-3 text-slate-300 text-sm border border-white/10">
                          <span className="font-semibold text-white">💡 </span>
                          {currentRound.explanation}
                        </div>
                      )}
                      <Button
                        size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold"
                        onClick={handleNextRound}
                      >
                        {currentRoundIndex < rounds.length - 1 ? (
                          <><ChevronRight className="w-5 h-5 mr-1" /> Next Round</>
                        ) : (
                          <><Trophy className="w-5 h-5 mr-1" /> See Results</>
                        )}
                      </Button>
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── FINAL RESULTS ── */}
      <AnimatePresence>
        {gamePhase === 'final_results' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold font-outfit mb-1">Puzzle Complete!</h2>
            <p className="text-slate-300 mb-6">
              {spec?.meta?.title}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm">
              <div className="bg-white/10 rounded-2xl p-4">
                <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <p className="text-2xl font-bold">{totalScore.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Points</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {totalPlacements > 0 ? Math.round((totalCorrect / totalPlacements) * 100) : 0}%
                </p>
                <p className="text-xs text-slate-400">Accuracy</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <Layers className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold">{rounds.length}</p>
                <p className="text-xs text-slate-400">Rounds</p>
              </div>
            </div>

            {/* Round breakdown */}
            <div className="w-full max-w-sm space-y-2 mb-8">
              {roundResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-2 text-sm">
                  <span className="text-slate-300">Round {i + 1}</span>
                  <span className="font-medium">{r.correct}/{r.total} correct</span>
                  <span className="text-yellow-400 font-bold">+{r.points} pts</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                size="lg" variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={handleRestart}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              {onExit && (
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" onClick={onExit}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Exit
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
