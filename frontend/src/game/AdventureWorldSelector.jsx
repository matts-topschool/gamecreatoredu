/**
 * AdventureWorldSelector - UI component for selecting adventure world themes
 */
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Compass, Lock, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ADVENTURE_WORLDS, getAllWorlds, getFreeWorlds } from './AdventureCatalog';

/**
 * WorldCard - Single world selection card
 */
const WorldCard = ({ world, isSelected, onSelect, disabled = false }) => {
  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={() => !disabled && onSelect(world.id)}
      className={cn(
        "relative cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden",
        isSelected 
          ? "border-amber-400 ring-2 ring-amber-400/30 shadow-lg" 
          : "border-slate-200 hover:border-amber-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Background gradient based on world colors */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${world.colors?.primary || '#1e3a5f'} 0%, ${world.colors?.secondary || '#2a4a6f'} 100%)`
        }}
      />
      
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* World icon */}
          <div className="text-4xl">
            {world.icon}
          </div>
          
          {/* World info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 truncate">{world.name}</h3>
              {isSelected && (
                <Check className="w-4 h-4 text-amber-600 flex-shrink-0" />
              )}
              {!world.free && (
                <Lock className="w-3 h-3 text-slate-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mt-1">
              {world.description}
            </p>
          </div>
        </div>
        
        {/* Artifact info */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span>Artifact:</span>
          <span className="font-medium text-amber-600">{world.artifact?.name}</span>
          <span className="text-lg">{world.artifact?.complete?.replace('✨', '')}</span>
        </div>
        
        {/* Scene count */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="w-3 h-3" />
          <span>{world.scenes?.length || 0} locations to explore</span>
        </div>
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
};

/**
 * AdventureWorldSelector - Main component
 */
const AdventureWorldSelector = ({
  selectedWorld = 'pirate_voyage',
  onWorldChange,
  sceneCount = 5,
  onSceneCountChange,
  questionsPerScene = 2,
  onQuestionsPerSceneChange,
  compact = false
}) => {
  const worlds = getAllWorlds();
  
  if (compact) {
    // Compact grid for inline selection
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Compass className="w-4 h-4 text-amber-500" />
          Choose Your Adventure World
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {worlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              isSelected={selectedWorld === world.id}
              onSelect={onWorldChange}
              disabled={!world.free}
            />
          ))}
        </div>
      </div>
    );
  }
  
  // Full selector with configuration options
  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-600" />
          Adventure World Configuration
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* World Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">
            Select World Theme
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {worlds.map((world) => (
              <WorldCard
                key={world.id}
                world={world}
                isSelected={selectedWorld === world.id}
                onSelect={onWorldChange}
                disabled={!world.free}
              />
            ))}
          </div>
        </div>
        
        {/* Journey Configuration */}
        <div className="grid grid-cols-2 gap-4">
          {/* Scene Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Journey Length
            </label>
            <select
              value={sceneCount}
              onChange={(e) => onSceneCountChange?.(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            >
              <option value={3}>Short (3 scenes)</option>
              <option value={5}>Standard (5 scenes)</option>
              <option value={7}>Epic (7 scenes)</option>
            </select>
            <p className="text-xs text-slate-500">
              More scenes = longer adventure
            </p>
          </div>
          
          {/* Questions Per Scene */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Questions Per Scene
            </label>
            <select
              value={questionsPerScene}
              onChange={(e) => onQuestionsPerSceneChange?.(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
            >
              <option value={1}>1 question (Quick)</option>
              <option value={2}>2 questions (Standard)</option>
              <option value={3}>3 questions (Challenging)</option>
            </select>
            <p className="text-xs text-slate-500">
              Answer correctly to collect artifact pieces
            </p>
          </div>
        </div>
        
        {/* Selected World Preview */}
        {selectedWorld && ADVENTURE_WORLDS[selectedWorld] && (
          <div className="p-4 rounded-xl bg-slate-900/90 text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{ADVENTURE_WORLDS[selectedWorld].icon}</span>
              <div>
                <h4 className="font-semibold">{ADVENTURE_WORLDS[selectedWorld].name}</h4>
                <p className="text-sm text-slate-300">{ADVENTURE_WORLDS[selectedWorld].description}</p>
              </div>
            </div>
            
            {/* Scene preview */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {ADVENTURE_WORLDS[selectedWorld].scenes?.slice(0, sceneCount).map((scene, i) => (
                <div 
                  key={scene.id}
                  className="flex-shrink-0 px-3 py-2 bg-white/10 rounded-lg text-center min-w-[80px]"
                >
                  <span className="text-2xl">{scene.icon}</span>
                  <p className="text-xs mt-1 text-slate-300 truncate">{scene.name}</p>
                </div>
              ))}
            </div>
            
            {/* Artifact preview */}
            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Collect:</span>
                <span className="font-medium text-amber-400">
                  {ADVENTURE_WORLDS[selectedWorld].artifact?.name}
                </span>
              </div>
              <span className="text-2xl">{ADVENTURE_WORLDS[selectedWorld].artifact?.complete}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdventureWorldSelector;
