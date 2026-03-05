/**
 * GameThumbnail - Visual thumbnail for game cards showing theme and characters
 */
import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { 
  THEMES, 
  PLAYER_CHARACTERS, 
  ENEMIES,
  getThemeColors 
} from '@/game/AssetCatalog';

const GameThumbnail = ({ spec, className = '' }) => {
  const gameType = spec?.meta?.game_type || 'quiz';
  const battleVisuals = spec?.battle_visuals;
  
  // For non-battle games, show a simple gradient
  if (gameType !== 'battle' || !battleVisuals) {
    return (
      <div className={`aspect-video bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center ${className}`}>
        <Gamepad2 className="w-12 h-12 text-violet-300" />
      </div>
    );
  }
  
  // Get theme and character data
  const theme = THEMES[battleVisuals.theme] || THEMES.fantasy_castle;
  const player = PLAYER_CHARACTERS[battleVisuals.playerCharacter] || PLAYER_CHARACTERS.knight;
  const enemy = ENEMIES[battleVisuals.enemyType] || ENEMIES.orc;
  const colors = theme.colors;
  
  // Generate gradient based on theme
  const gradientMap = {
    fantasy: 'from-purple-900 via-indigo-800 to-purple-900',
    space: 'from-slate-900 via-blue-900 to-slate-900',
    ocean: 'from-blue-900 via-cyan-800 to-blue-900',
    prehistoric: 'from-green-900 via-lime-800 to-green-900',
    mythology: 'from-amber-800 via-yellow-700 to-amber-800',
    science: 'from-emerald-900 via-teal-800 to-emerald-900',
    nature: 'from-green-800 via-emerald-700 to-green-800',
    spooky: 'from-slate-900 via-purple-900 to-slate-900',
  };
  
  const gradient = gradientMap[theme.category] || gradientMap.fantasy;

  return (
    <div className={`aspect-video relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      
      {/* Glow effects */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full blur-xl"
          style={{ backgroundColor: colors.accent }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-20 h-20 rounded-full blur-xl"
          style={{ backgroundColor: colors.secondary }}
        />
      </div>
      
      {/* Characters */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Player character */}
        <div className="absolute left-4 bottom-4 flex flex-col items-center">
          <span className="text-4xl drop-shadow-lg filter">{player.icon}</span>
          <span className="text-[10px] text-white/80 mt-1 font-medium drop-shadow">{player.name.split(' ')[0]}</span>
        </div>
        
        {/* VS text */}
        <div className="text-xl font-bold text-white/60 drop-shadow-lg">VS</div>
        
        {/* Enemy character */}
        <div className="absolute right-4 bottom-4 flex flex-col items-center">
          <span className="text-4xl drop-shadow-lg filter transform -scale-x-100">{enemy.icon}</span>
          <span className="text-[10px] text-white/80 mt-1 font-medium drop-shadow">{enemy.name.split(' ')[0]}</span>
        </div>
      </div>
      
      {/* Theme name badge */}
      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 rounded text-[10px] text-white/90 backdrop-blur-sm">
        {theme.name}
      </div>
      
      {/* Game type badge */}
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-600/80 rounded text-[10px] text-white font-medium">
        BATTLE
      </div>
    </div>
  );
};

export default GameThumbnail;
