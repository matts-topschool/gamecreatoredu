/**
 * GameThumbnail - Renders a mini preview of the actual game scene
 */
import React from 'react';
import { Gamepad2, BookOpen } from 'lucide-react';
import { 
  THEMES, 
  PLAYER_CHARACTERS, 
  ENEMIES,
  getThemeColors 
} from '@/game/AssetCatalog';

// Mini Scene Backgrounds (simplified versions of the full scenes)
const MiniDragonLairScene = () => (
  <>
    {/* Lava glow */}
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-orange-600/80 via-red-600/50 to-transparent" />
    {/* Stalactites */}
    <div className="absolute top-0 left-[20%] w-1 h-4 bg-stone-700 rounded-b-full" />
    <div className="absolute top-0 left-[40%] w-1.5 h-6 bg-stone-600 rounded-b-full" />
    <div className="absolute top-0 right-[30%] w-1 h-5 bg-stone-700 rounded-b-full" />
    {/* Fire glow */}
    <div className="absolute bottom-0 left-1/4 w-8 h-8 bg-orange-500/40 rounded-full blur-lg" />
  </>
);

const MiniHauntedScene = () => (
  <>
    {/* Moon */}
    <div className="absolute top-2 right-4 w-4 h-4 bg-slate-200 rounded-full shadow-lg shadow-slate-200/30" />
    {/* Bats */}
    <div className="absolute top-4 left-[25%] text-[8px] opacity-60">🦇</div>
    <div className="absolute top-3 right-[35%] text-[6px] opacity-50">🦇</div>
    {/* Dead tree */}
    <div className="absolute bottom-0 left-2 w-1 h-8 bg-slate-950 rounded-t-sm" />
    <div className="absolute bottom-6 left-0 w-3 h-0.5 bg-slate-950 rounded transform -rotate-45" />
    {/* Fog */}
    <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-400/30 to-transparent" />
  </>
);

const MiniSpaceScene = () => (
  <>
    {/* Stars */}
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute w-0.5 h-0.5 bg-white rounded-full"
        style={{
          top: `${10 + Math.random() * 60}%`,
          left: `${Math.random() * 100}%`,
          opacity: 0.3 + Math.random() * 0.7
        }}
      />
    ))}
    {/* Planet */}
    <div className="absolute top-3 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 opacity-70" />
    {/* Nebula */}
    <div className="absolute top-1/4 left-1/4 w-12 h-12 bg-purple-500/20 rounded-full blur-xl" />
  </>
);

const MiniOceanScene = () => (
  <>
    {/* Light rays */}
    <div className="absolute top-0 left-[25%] w-2 h-12 bg-gradient-to-b from-cyan-300/30 to-transparent transform -rotate-6" />
    <div className="absolute top-0 right-[30%] w-1.5 h-10 bg-gradient-to-b from-cyan-300/20 to-transparent transform rotate-6" />
    {/* Bubbles */}
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full border border-white/30 bg-white/10"
        style={{
          width: `${3 + Math.random() * 4}px`,
          height: `${3 + Math.random() * 4}px`,
          bottom: `${20 + Math.random() * 40}%`,
          left: `${Math.random() * 100}%`,
        }}
      />
    ))}
    {/* Seaweed */}
    <div className="absolute bottom-0 left-2 w-0.5 h-6 bg-gradient-to-t from-green-700 to-green-500 rounded-t-full" />
    <div className="absolute bottom-0 right-3 w-0.5 h-5 bg-gradient-to-t from-green-800 to-green-600 rounded-t-full" />
  </>
);

const MiniJungleScene = () => (
  <>
    {/* Volcano */}
    <div className="absolute top-2 right-3 w-8 h-6 bg-gradient-to-t from-stone-600 to-stone-500" 
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    <div className="absolute top-2 right-[26px] w-2 h-2 bg-orange-500/50 rounded-full blur-sm" />
    {/* Plants */}
    <div className="absolute bottom-0 left-1 text-sm opacity-80">🌿</div>
    <div className="absolute bottom-0 right-2 text-sm opacity-70">🌴</div>
    {/* Ground */}
    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-amber-800 to-amber-700/50" />
  </>
);

const MiniOlympusScene = () => (
  <>
    {/* Clouds */}
    <div className="absolute top-1 left-[15%] w-8 h-2 bg-white/60 rounded-full blur-[2px]" />
    <div className="absolute top-2 right-[20%] w-6 h-1.5 bg-white/50 rounded-full blur-[2px]" />
    {/* Pillars */}
    <div className="absolute bottom-0 left-2 w-1.5 h-8 bg-gradient-to-b from-amber-100 to-amber-200" />
    <div className="absolute bottom-0 right-2 w-1.5 h-7 bg-gradient-to-b from-amber-100 to-amber-200" />
    {/* Lightning */}
    <div className="absolute top-5 left-1/2 -translate-x-1/2 text-sm">⚡</div>
  </>
);

const MiniLabScene = () => (
  <>
    {/* Grid */}
    <div className="absolute inset-0 opacity-20">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="absolute left-0 right-0 h-px bg-green-400" style={{ top: `${i * 20}%` }} />
      ))}
    </div>
    {/* Particles */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-green-400/60 rounded-full"
        style={{
          top: `${20 + Math.random() * 50}%`,
          left: `${Math.random() * 100}%`,
        }}
      />
    ))}
    {/* Beakers */}
    <div className="absolute bottom-0 left-2 text-sm">🧪</div>
    <div className="absolute bottom-0 right-3 text-sm">🔬</div>
  </>
);

const MiniDesertScene = () => (
  <>
    {/* Sun */}
    <div className="absolute top-2 right-3 w-5 h-5 bg-yellow-400 rounded-full blur-[1px] shadow-lg shadow-yellow-400/50" />
    {/* Pyramids */}
    <div className="absolute bottom-2 left-[25%] w-6 h-5 bg-gradient-to-t from-amber-600 to-amber-500"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    <div className="absolute bottom-2 left-[40%] w-4 h-3.5 bg-gradient-to-t from-amber-700 to-amber-600"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    {/* Sand */}
    <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-400 to-amber-300/50 rounded-t-full" />
  </>
);

const MiniArcticScene = () => (
  <>
    {/* Aurora */}
    <div className="absolute top-0 left-[20%] w-16 h-6 bg-gradient-to-r from-green-400/30 via-cyan-400/40 to-purple-400/30 blur-md" />
    {/* Snowflakes */}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute text-white/50"
        style={{
          top: `${Math.random() * 70}%`,
          left: `${Math.random() * 100}%`,
          fontSize: '6px',
        }}
      >
        ❄
      </div>
    ))}
    {/* Ice */}
    <div className="absolute bottom-0 left-2 w-2 h-5 bg-gradient-to-t from-cyan-200 to-cyan-100 opacity-60"
      style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }} />
    {/* Snow ground */}
    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-white to-slate-100/80" />
  </>
);

const MiniCyberScene = () => (
  <>
    {/* Grid floor */}
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-cyan-900/50 to-transparent">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="absolute left-0 right-0 h-px bg-cyan-400/40" style={{ bottom: `${i * 25}%` }} />
      ))}
    </div>
    {/* Particles */}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-0.5 h-0.5 bg-cyan-400"
        style={{
          top: `${Math.random() * 60}%`,
          left: `${Math.random() * 100}%`,
        }}
      />
    ))}
    {/* Glow line */}
    <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
  </>
);

// Scene selector
const getMiniScene = (theme) => {
  const scenes = {
    fantasy_dragon_lair: MiniDragonLairScene,
    spooky_haunted: MiniHauntedScene,
    spooky_graveyard: MiniHauntedScene,
    space_station: MiniSpaceScene,
    space_alien_planet: MiniSpaceScene,
    space_asteroid: MiniSpaceScene,
    ocean_depths: MiniOceanScene,
    ocean_coral_reef: MiniOceanScene,
    ocean_shipwreck: MiniOceanScene,
    prehistoric_jungle: MiniJungleScene,
    prehistoric_volcano: MiniJungleScene,
    myth_olympus: MiniOlympusScene,
    myth_underworld: MiniHauntedScene,
    myth_norse: MiniArcticScene,
    science_lab: MiniLabScene,
    science_cyber: MiniCyberScene,
    nature_arctic: MiniArcticScene,
    nature_desert: MiniDesertScene,
    nature_storm: MiniSpaceScene,
  };
  return scenes[theme] || null;
};

// Gradient mapping
const getGradient = (theme) => {
  const gradients = {
    fantasy_forest: 'from-green-900 via-green-800 to-emerald-900',
    fantasy_castle: 'from-slate-900 via-purple-950 to-slate-900',
    fantasy_dragon_lair: 'from-red-950 via-orange-900 to-red-950',
    space_station: 'from-slate-950 via-blue-950 to-slate-950',
    space_alien_planet: 'from-purple-950 via-indigo-900 to-purple-950',
    space_asteroid: 'from-slate-950 via-stone-900 to-slate-950',
    ocean_depths: 'from-blue-950 via-cyan-900 to-blue-950',
    ocean_coral_reef: 'from-cyan-900 via-teal-800 to-cyan-900',
    ocean_shipwreck: 'from-slate-900 via-cyan-950 to-slate-900',
    prehistoric_jungle: 'from-green-950 via-lime-900 to-green-950',
    prehistoric_volcano: 'from-stone-900 via-orange-950 to-stone-900',
    myth_olympus: 'from-sky-300 via-amber-100 to-sky-200',
    myth_underworld: 'from-purple-950 via-fuchsia-950 to-purple-950',
    myth_norse: 'from-slate-800 via-blue-900 to-slate-800',
    science_lab: 'from-slate-900 via-emerald-950 to-slate-900',
    science_cyber: 'from-slate-950 via-cyan-950 to-slate-950',
    nature_arctic: 'from-slate-300 via-blue-200 to-slate-300',
    nature_desert: 'from-amber-300 via-yellow-200 to-amber-300',
    nature_storm: 'from-slate-800 via-slate-700 to-slate-800',
    spooky_haunted: 'from-slate-950 via-purple-950 to-slate-950',
    spooky_graveyard: 'from-slate-950 via-slate-900 to-slate-950',
  };
  return gradients[theme] || 'from-violet-600 via-purple-600 to-violet-700';
};

const GameThumbnail = ({ spec, className = '' }) => {
  const gameType = spec?.meta?.game_type || 'quiz';
  const battleVisuals = spec?.battle_visuals;
  
  // For non-battle games or games without battle visuals, show quiz style thumbnail
  if (gameType !== 'battle' || !battleVisuals) {
    return (
      <div className={`aspect-video bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center relative overflow-hidden ${className}`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 border border-white rounded-lg"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 45}deg)`
              }}
            />
          ))}
        </div>
        
        {/* Quiz icon */}
        <div className="relative z-10 flex flex-col items-center">
          <BookOpen className="w-10 h-10 text-white/80" />
        </div>
        
        {/* Game type badge */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 rounded text-[10px] text-white font-medium backdrop-blur-sm flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          Quiz
        </div>
      </div>
    );
  }
  
  // Battle game thumbnail with full scene preview
  const theme = battleVisuals.theme || 'fantasy_castle';
  const player = PLAYER_CHARACTERS[battleVisuals.playerCharacter] || PLAYER_CHARACTERS.knight;
  const enemy = ENEMIES[battleVisuals.enemyType] || ENEMIES.orc;
  const gradient = getGradient(theme);
  const MiniScene = getMiniScene(theme);
  const themeData = THEMES[theme];

  return (
    <div className={`aspect-video relative overflow-hidden rounded-t-xl ${className}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${gradient}`} />
      
      {/* Scene elements */}
      {MiniScene && <MiniScene />}
      
      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/40 to-transparent" />
      
      {/* Characters */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        {/* Player */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-md scale-150" />
            <span className="relative z-10 text-3xl drop-shadow-lg">{player.icon}</span>
          </div>
          <div className="mt-1 px-1.5 py-0.5 bg-black/50 rounded text-[8px] text-white font-medium backdrop-blur-sm">
            {player.name.split(' ')[0]}
          </div>
        </div>
        
        {/* VS indicator */}
        <div className="text-white/40 text-xs font-bold">VS</div>
        
        {/* Enemy */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/30 rounded-full blur-md scale-150" />
            <span className="relative z-10 text-3xl drop-shadow-lg transform -scale-x-100">{enemy.icon}</span>
          </div>
          <div className="mt-1 px-1.5 py-0.5 bg-black/50 rounded text-[8px] text-white font-medium backdrop-blur-sm">
            {enemy.name.split(' ')[0]}
          </div>
        </div>
      </div>
      
      {/* Game type badge */}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-red-600/80 rounded text-[10px] text-white font-medium backdrop-blur-sm flex items-center gap-1">
        <Gamepad2 className="w-3 h-3" />
        Battle
      </div>
      
      {/* Theme badge */}
      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/50 rounded text-[8px] text-white/90 backdrop-blur-sm">
        {themeData?.name || 'Battle Arena'}
      </div>
    </div>
  );
};

export default GameThumbnail;
