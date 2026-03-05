/**
 * Theme Selector Component - Allows users to choose game themes, characters, enemies AND battle settings
 */
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  User, 
  Skull, 
  Lock, 
  Check,
  Sparkles,
  Crown,
  Settings,
  Swords,
  Timer,
  Heart,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  THEMES,
  PLAYER_CHARACTERS,
  ENEMIES,
  getThemesByCategory,
  getCharactersForTheme,
  getEnemiesForTheme,
  getFreeThemes,
  getFreeCharacters,
  getFreeEnemies,
  CATALOG_STATS
} from './AssetCatalog';

// Category display names and icons
const CATEGORIES = {
  fantasy: { name: 'Fantasy', icon: '🏰', color: 'bg-purple-500' },
  space: { name: 'Space', icon: '🚀', color: 'bg-blue-500' },
  ocean: { name: 'Ocean', icon: '🌊', color: 'bg-cyan-500' },
  prehistoric: { name: 'Prehistoric', icon: '🦖', color: 'bg-green-500' },
  mythology: { name: 'Mythology', icon: '⚡', color: 'bg-yellow-500' },
  science: { name: 'Science', icon: '🔬', color: 'bg-emerald-500' },
  nature: { name: 'Nature', icon: '🌲', color: 'bg-lime-500' },
  spooky: { name: 'Spooky', icon: '👻', color: 'bg-violet-500' },
};

// ==================== THEME CARD ====================

const ThemeCard = ({ theme, isSelected, onSelect, isPremium }) => {
  const isLocked = !theme.free && isPremium !== true;
  
  return (
    <motion.button
      onClick={() => !isLocked && onSelect(theme.id)}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.03 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={`
        relative p-4 rounded-xl text-left transition-all w-full
        ${isSelected 
          ? 'ring-2 ring-yellow-400 bg-slate-800' 
          : isLocked 
            ? 'bg-slate-900/50 opacity-60 cursor-not-allowed' 
            : 'bg-slate-800/50 hover:bg-slate-800'
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-black" />
        </div>
      )}
      
      {/* Locked indicator */}
      {isLocked && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
          <Lock className="w-3 h-3 text-slate-400" />
        </div>
      )}
      
      {/* Premium badge */}
      {!theme.free && (
        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-600 to-amber-500 text-xs">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      )}
      
      {/* Color preview */}
      <div className="flex gap-2 mb-3 mt-4">
        <div 
          className="w-8 h-8 rounded-full border-2 border-white/20" 
          style={{ backgroundColor: theme.colors.primary }}
        />
        <div 
          className="w-8 h-8 rounded-full border-2 border-white/20" 
          style={{ backgroundColor: theme.colors.secondary }}
        />
        <div 
          className="w-8 h-8 rounded-full border-2 border-white/20" 
          style={{ backgroundColor: theme.colors.accent }}
        />
      </div>
      
      <h4 className="font-semibold text-white">{theme.name}</h4>
      <p className="text-xs text-slate-400 mt-1">{theme.description}</p>
    </motion.button>
  );
};

// ==================== CHARACTER CARD ====================

const CharacterCard = ({ character, isSelected, onSelect, isLocked }) => {
  return (
    <motion.button
      onClick={() => !isLocked && onSelect(character.id)}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      className={`
        relative p-4 rounded-xl text-center transition-all
        ${isSelected 
          ? 'ring-2 ring-blue-400 bg-slate-800' 
          : isLocked 
            ? 'bg-slate-900/50 opacity-60 cursor-not-allowed' 
            : 'bg-slate-800/50 hover:bg-slate-800'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-black" />
        </div>
      )}
      
      {isLocked && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
          <Lock className="w-3 h-3 text-slate-400" />
        </div>
      )}
      
      <div className="text-4xl mb-2">{character.icon}</div>
      <p className="text-sm font-medium text-white">{character.name}</p>
      <p className="text-xs text-slate-400 mt-1">{character.category}</p>
    </motion.button>
  );
};

// ==================== ENEMY CARD ====================

const EnemyCard = ({ enemy, isSelected, onSelect, isLocked }) => {
  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
  };
  
  return (
    <motion.button
      onClick={() => !isLocked && onSelect(enemy.id)}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      className={`
        relative p-4 rounded-xl text-center transition-all
        ${isSelected 
          ? 'ring-2 ring-red-400 bg-slate-800' 
          : isLocked 
            ? 'bg-slate-900/50 opacity-60 cursor-not-allowed' 
            : 'bg-slate-800/50 hover:bg-slate-800'
        }
      `}
    >
      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-black" />
        </div>
      )}
      
      {isLocked && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center">
          <Lock className="w-3 h-3 text-slate-400" />
        </div>
      )}
      
      <div className="text-4xl mb-2">{enemy.icon}</div>
      <p className="text-sm font-medium text-white">{enemy.name}</p>
      <div className="flex items-center justify-center gap-2 mt-1">
        <span className={`text-xs ${difficultyColors[enemy.difficulty]}`}>
          {enemy.difficulty}
        </span>
        <span className="text-xs text-slate-500">•</span>
        <span className="text-xs text-slate-400">{enemy.health} HP</span>
      </div>
    </motion.button>
  );
};

// ==================== MAIN THEME SELECTOR ====================

const ThemeSelector = ({ 
  selectedTheme, 
  selectedCharacter, 
  selectedEnemy,
  onThemeChange,
  onCharacterChange,
  onEnemyChange,
  // Battle configuration props
  battleRounds = 10,
  onBattleRoundsChange,
  timerPerRound = 30,
  onTimerPerRoundChange,
  damagePerCorrect = 25,
  onDamagePerCorrectChange,
  playerHealth = 100,
  onPlayerHealthChange,
  isPremiumUser = false,
  gameType = 'battle'
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('settings');
  
  // Get filtered themes based on category
  const filteredThemes = useMemo(() => {
    if (activeCategory === 'all') {
      return Object.values(THEMES);
    }
    return getThemesByCategory(activeCategory);
  }, [activeCategory]);
  
  // Get the selected theme's category for character/enemy filtering
  const selectedThemeData = THEMES[selectedTheme];
  const themeCategory = selectedThemeData?.category || 'fantasy';
  
  // Filter characters and enemies based on theme compatibility
  const compatibleCharacters = useMemo(() => {
    return Object.values(PLAYER_CHARACTERS).filter(c => 
      c.compatibleThemes.includes(themeCategory)
    );
  }, [themeCategory]);
  
  const compatibleEnemies = useMemo(() => {
    return Object.values(ENEMIES).filter(e => 
      e.compatibleThemes.includes(themeCategory)
    );
  }, [themeCategory]);

  // Calculate estimated duration
  const estimatedDuration = Math.ceil((battleRounds * timerPerRound) / 60);

  return (
    <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-white">Battle Configuration</h3>
        </div>
        <div className="text-xs text-slate-400">
          {CATALOG_STATS.freeThemes} themes • {CATALOG_STATS.freeCharacters} heroes • {CATALOG_STATS.freeEnemies} enemies
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 mb-4">
          <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-600">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="theme" className="data-[state=active]:bg-violet-600">
            <Palette className="w-4 h-4 mr-2" />
            Arena
          </TabsTrigger>
          <TabsTrigger value="character" className="data-[state=active]:bg-blue-600">
            <User className="w-4 h-4 mr-2" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="enemy" className="data-[state=active]:bg-red-600">
            <Skull className="w-4 h-4 mr-2" />
            Enemy
          </TabsTrigger>
        </TabsList>

        {/* Battle Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 space-y-5">
              {/* Battle Rounds */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <Swords className="w-4 h-4 text-orange-400" />
                    Battle Rounds
                  </label>
                  <span className="text-sm font-mono text-amber-400">{battleRounds} rounds</span>
                </div>
                <div className="flex gap-2">
                  {[5, 10, 15, 20, 25].map(val => (
                    <button
                      key={val}
                      onClick={() => onBattleRoundsChange?.(val)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                        ${battleRounds === val 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Each round = 1 question to answer</p>
              </div>

              {/* Timer Per Round */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-cyan-400" />
                    Time Per Round
                  </label>
                  <span className="text-sm font-mono text-cyan-400">{timerPerRound}s</span>
                </div>
                <div className="flex gap-2">
                  {[15, 30, 45, 60, 90].map(val => (
                    <button
                      key={val}
                      onClick={() => onTimerPerRoundChange?.(val)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                        ${timerPerRound === val 
                          ? 'bg-cyan-500 text-white' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                      {val}s
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Faster = more challenging</p>
              </div>

              {/* Damage Per Correct */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Damage Per Hit
                  </label>
                  <span className="text-sm font-mono text-yellow-400">{damagePerCorrect} DMG</span>
                </div>
                <div className="flex gap-2">
                  {[10, 20, 25, 33, 50].map(val => (
                    <button
                      key={val}
                      onClick={() => onDamagePerCorrectChange?.(val)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                        ${damagePerCorrect === val 
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500">Damage dealt to enemy on correct answer</p>
              </div>

              {/* Summary Box */}
              <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Total Questions</p>
                    <p className="text-xl font-bold text-white">{battleRounds}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Est. Duration</p>
                    <p className="text-xl font-bold text-white">~{estimatedDuration} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Hits to Win</p>
                    <p className="text-xl font-bold text-white">{Math.ceil(100 / damagePerCorrect)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Theme Selection */}
        <TabsContent value="theme" className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('all')}
              className="text-xs"
            >
              All
            </Button>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Button
                key={key}
                size="sm"
                variant={activeCategory === key ? 'default' : 'outline'}
                onClick={() => setActiveCategory(key)}
                className="text-xs"
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
          
          {/* Theme grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {filteredThemes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={selectedTheme === theme.id}
                onSelect={onThemeChange}
                isPremium={isPremiumUser}
              />
            ))}
          </div>
        </TabsContent>
        
        {/* Character Selection */}
        <TabsContent value="character" className="space-y-4">
          <p className="text-sm text-slate-400">
            Heroes compatible with <span className="text-yellow-400">{selectedThemeData?.name || 'selected theme'}</span>
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {compatibleCharacters.map(char => (
              <CharacterCard
                key={char.id}
                character={char}
                isSelected={selectedCharacter === char.id}
                onSelect={onCharacterChange}
                isLocked={!char.free && !isPremiumUser}
              />
            ))}
          </div>
          
          {compatibleCharacters.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              No heroes available for this theme category
            </p>
          )}
        </TabsContent>
        
        {/* Enemy Selection */}
        <TabsContent value="enemy" className="space-y-4">
          <p className="text-sm text-slate-400">
            Enemies from <span className="text-red-400">{CATEGORIES[themeCategory]?.name || 'selected'}</span> realm
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {compatibleEnemies.map(enemy => (
              <EnemyCard
                key={enemy.id}
                enemy={enemy}
                isSelected={selectedEnemy === enemy.id}
                onSelect={onEnemyChange}
                isLocked={!enemy.free && !isPremiumUser}
              />
            ))}
          </div>
          
          {compatibleEnemies.length === 0 && (
            <p className="text-center text-slate-500 py-8">
              No enemies available for this theme category
            </p>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Current selection summary */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{PLAYER_CHARACTERS[selectedCharacter]?.icon || '⚔️'}</span>
            <span className="text-sm text-slate-300">
              {PLAYER_CHARACTERS[selectedCharacter]?.name || 'Select hero'}
            </span>
          </div>
          <span className="text-slate-600">vs</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{ENEMIES[selectedEnemy]?.icon || '👹'}</span>
            <span className="text-sm text-slate-300">
              {ENEMIES[selectedEnemy]?.name || 'Select enemy'}
            </span>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {selectedThemeData?.name || 'Select arena'}
        </Badge>
      </div>
    </div>
  );
};

export default ThemeSelector;
