/**
 * Scene Backgrounds - Detailed visual backgrounds for each battle theme
 */
import React from 'react';

// ==================== SCENE ELEMENTS ====================

// Dragon's Lair Scene
export const DragonLairScene = () => (
  <div className="absolute inset-0">
    {/* Lava flow at bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-orange-600 via-red-600 to-transparent opacity-80">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-yellow-500/30 via-orange-500/50 to-yellow-500/30" />
    </div>
    
    {/* Cave walls */}
    <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-stone-900 to-transparent" />
    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-stone-900 to-transparent" />
    
    {/* Stalactites */}
    <div className="absolute top-0 left-[15%] w-4 h-20 bg-gradient-to-b from-stone-700 to-stone-800 rounded-b-full" />
    <div className="absolute top-0 left-[35%] w-6 h-28 bg-gradient-to-b from-stone-600 to-stone-700 rounded-b-full" />
    <div className="absolute top-0 right-[25%] w-5 h-24 bg-gradient-to-b from-stone-700 to-stone-800 rounded-b-full" />
    <div className="absolute top-0 right-[40%] w-3 h-16 bg-gradient-to-b from-stone-600 to-stone-700 rounded-b-full" />
    
    {/* Treasure pile */}
    <div className="absolute bottom-16 left-8 w-20 h-12 opacity-60">
      <div className="absolute bottom-0 left-0 w-4 h-4 bg-yellow-400 rounded-full" />
      <div className="absolute bottom-1 left-5 w-3 h-3 bg-yellow-500 rounded-full" />
      <div className="absolute bottom-0 left-10 w-5 h-5 bg-yellow-400 rounded-full" />
      <div className="absolute bottom-2 left-3 w-3 h-3 bg-amber-400 rounded-full" />
    </div>
    
    {/* Fire glow */}
    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-orange-500/30 rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-red-500/20 rounded-full blur-3xl animate-pulse delay-500" />
  </div>
);

// Haunted House Scene
export const HauntedScene = () => (
  <div className="absolute inset-0">
    {/* Moon */}
    <div className="absolute top-8 right-16 w-16 h-16 bg-slate-200 rounded-full shadow-lg shadow-slate-200/50" />
    
    {/* Clouds passing moon */}
    <div className="absolute top-6 right-10 w-24 h-8 bg-slate-700/60 rounded-full animate-pulse" />
    
    {/* Bats */}
    <div className="absolute top-20 left-[20%] text-2xl animate-bounce" style={{ animationDuration: '2s' }}>🦇</div>
    <div className="absolute top-16 right-[30%] text-xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦇</div>
    <div className="absolute top-24 left-[40%] text-lg animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>🦇</div>
    
    {/* Dead trees silhouette */}
    <div className="absolute bottom-0 left-4 w-8 h-40 bg-slate-950 rounded-t-lg" />
    <div className="absolute bottom-32 left-0 w-16 h-3 bg-slate-950 rounded-full transform -rotate-45" />
    <div className="absolute bottom-28 left-6 w-12 h-3 bg-slate-950 rounded-full transform rotate-30" />
    
    <div className="absolute bottom-0 right-8 w-6 h-32 bg-slate-950 rounded-t-lg" />
    <div className="absolute bottom-24 right-4 w-14 h-2 bg-slate-950 rounded-full transform rotate-45" />
    
    {/* Fog */}
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-400/20 to-transparent" />
    
    {/* Spooky glow */}
    <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-green-500/10 rounded-full blur-2xl animate-pulse" />
  </div>
);

// Space Station Scene
export const SpaceScene = () => (
  <div className="absolute inset-0">
    {/* Stars */}
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
        style={{
          top: `${Math.random() * 70}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          opacity: 0.3 + Math.random() * 0.7
        }}
      />
    ))}
    
    {/* Planet */}
    <div className="absolute top-12 right-20 w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 opacity-60">
      <div className="absolute top-4 left-3 w-6 h-4 bg-blue-300/40 rounded-full" />
      <div className="absolute bottom-6 right-4 w-8 h-3 bg-blue-300/30 rounded-full" />
    </div>
    
    {/* Distant planet with rings */}
    <div className="absolute top-20 left-16 w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 opacity-50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-3 bg-amber-400/30 rounded-full transform rotate-12" />
    </div>
    
    {/* Shooting star */}
    <div className="absolute top-16 left-[30%] w-16 h-0.5 bg-gradient-to-r from-white to-transparent transform -rotate-45 animate-pulse" />
    
    {/* Nebula glow */}
    <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
  </div>
);

// Ocean Depths Scene
export const OceanScene = () => (
  <div className="absolute inset-0">
    {/* Light rays from surface */}
    <div className="absolute top-0 left-[20%] w-8 h-48 bg-gradient-to-b from-cyan-300/20 to-transparent transform -rotate-12" />
    <div className="absolute top-0 left-[40%] w-6 h-56 bg-gradient-to-b from-cyan-300/15 to-transparent" />
    <div className="absolute top-0 right-[30%] w-10 h-40 bg-gradient-to-b from-cyan-300/20 to-transparent transform rotate-12" />
    
    {/* Bubbles */}
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full border border-white/20 bg-white/5 animate-bounce"
        style={{
          width: `${8 + Math.random() * 12}px`,
          height: `${8 + Math.random() * 12}px`,
          bottom: `${Math.random() * 60}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${3 + Math.random() * 4}s`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
    
    {/* Seaweed */}
    <div className="absolute bottom-0 left-8 w-3 h-24 bg-gradient-to-t from-green-800 to-green-600 rounded-t-full animate-pulse" style={{ animationDuration: '4s' }} />
    <div className="absolute bottom-0 left-14 w-2 h-20 bg-gradient-to-t from-green-700 to-green-500 rounded-t-full animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
    <div className="absolute bottom-0 right-12 w-3 h-28 bg-gradient-to-t from-green-800 to-green-600 rounded-t-full animate-pulse" style={{ animationDuration: '4.5s' }} />
    <div className="absolute bottom-0 right-6 w-2 h-16 bg-gradient-to-t from-green-700 to-green-500 rounded-t-full animate-pulse" style={{ animationDuration: '3s', animationDelay: '1s' }} />
    
    {/* Coral */}
    <div className="absolute bottom-0 left-1/4 w-12 h-10 bg-gradient-to-t from-pink-600 to-pink-400 rounded-t-full opacity-60" />
    <div className="absolute bottom-0 right-1/3 w-8 h-8 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-full opacity-60" />
    
    {/* Fish silhouettes */}
    <div className="absolute top-1/3 right-[15%] text-xl opacity-40 animate-pulse">🐟</div>
    <div className="absolute top-1/2 left-[10%] text-lg opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>🐠</div>
  </div>
);

// Prehistoric Jungle Scene
export const JungleScene = () => (
  <div className="absolute inset-0">
    {/* Volcano in background */}
    <div className="absolute top-8 right-12 w-32 h-24">
      <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-stone-700 via-stone-600 to-stone-500 clip-triangle" 
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500/50 rounded-full blur-lg animate-pulse" />
    </div>
    
    {/* Ferns and plants */}
    <div className="absolute bottom-0 left-4 text-4xl">🌿</div>
    <div className="absolute bottom-0 left-16 text-3xl opacity-80">🌴</div>
    <div className="absolute bottom-0 right-8 text-4xl">🌿</div>
    <div className="absolute bottom-0 right-20 text-3xl opacity-80">🪴</div>
    
    {/* Pterodactyl in sky */}
    <div className="absolute top-16 left-[30%] text-2xl opacity-40 animate-bounce" style={{ animationDuration: '4s' }}>🦅</div>
    
    {/* Ground */}
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-900 to-amber-800/50" />
    
    {/* Jungle mist */}
    <div className="absolute bottom-8 left-0 right-0 h-16 bg-gradient-to-t from-green-900/30 to-transparent" />
  </div>
);

// Mount Olympus Scene
export const OlympusScene = () => (
  <div className="absolute inset-0">
    {/* Clouds */}
    <div className="absolute top-4 left-[10%] w-32 h-12 bg-white/60 rounded-full blur-sm" />
    <div className="absolute top-8 left-[5%] w-24 h-8 bg-white/40 rounded-full blur-sm" />
    <div className="absolute top-6 right-[15%] w-28 h-10 bg-white/50 rounded-full blur-sm" />
    <div className="absolute top-12 right-[20%] w-20 h-6 bg-white/30 rounded-full blur-sm" />
    
    {/* Pillars */}
    <div className="absolute bottom-0 left-8 w-6 h-32 bg-gradient-to-b from-amber-100 to-amber-200">
      <div className="absolute top-0 w-8 h-3 bg-amber-100 -left-1" />
      <div className="absolute bottom-0 w-8 h-3 bg-amber-200 -left-1" />
    </div>
    <div className="absolute bottom-0 right-8 w-6 h-28 bg-gradient-to-b from-amber-100 to-amber-200">
      <div className="absolute top-0 w-8 h-3 bg-amber-100 -left-1" />
      <div className="absolute bottom-0 w-8 h-3 bg-amber-200 -left-1" />
    </div>
    
    {/* Lightning bolt */}
    <div className="absolute top-20 left-1/2 -translate-x-1/2 text-4xl animate-pulse">⚡</div>
    
    {/* Golden glow */}
    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />
  </div>
);

// Science Lab Scene
export const LabScene = () => (
  <div className="absolute inset-0">
    {/* Grid lines */}
    <div className="absolute inset-0 opacity-10">
      {[...Array(10)].map((_, i) => (
        <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-green-400" style={{ top: `${i * 10}%` }} />
      ))}
      {[...Array(15)].map((_, i) => (
        <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-green-400" style={{ left: `${i * 7}%` }} />
      ))}
    </div>
    
    {/* Beakers and tubes */}
    <div className="absolute bottom-0 left-8 text-3xl">🧪</div>
    <div className="absolute bottom-0 left-20 text-2xl">⚗️</div>
    <div className="absolute bottom-0 right-12 text-3xl">🔬</div>
    
    {/* Floating particles */}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-green-400/60 rounded-full animate-ping"
        style={{
          top: `${20 + Math.random() * 50}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${2 + Math.random() * 3}s`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
    
    {/* Electric arcs */}
    <div className="absolute top-1/4 left-1/4 w-16 h-16 border border-cyan-400/30 rounded-full animate-pulse" />
    <div className="absolute top-1/3 right-1/4 w-12 h-12 border border-green-400/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
  </div>
);

// Desert/Egyptian Scene
export const DesertScene = () => (
  <div className="absolute inset-0">
    {/* Sun */}
    <div className="absolute top-8 right-16 w-20 h-20 bg-yellow-400 rounded-full blur-sm shadow-lg shadow-yellow-400/50" />
    
    {/* Pyramids */}
    <div className="absolute bottom-8 left-[20%] w-24 h-20 bg-gradient-to-t from-amber-600 to-amber-500"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    <div className="absolute bottom-8 left-[35%] w-16 h-14 bg-gradient-to-t from-amber-700 to-amber-600"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
    
    {/* Palm tree silhouette */}
    <div className="absolute bottom-0 right-16 text-3xl opacity-60">🌴</div>
    
    {/* Sand dunes */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-400 to-amber-300/50 rounded-t-full" />
    
    {/* Heat shimmer */}
    <div className="absolute bottom-12 left-0 right-0 h-8 bg-gradient-to-t from-amber-200/20 to-transparent animate-pulse" />
  </div>
);

// Arctic/Frozen Scene
export const ArcticScene = () => (
  <div className="absolute inset-0">
    {/* Aurora borealis */}
    <div className="absolute top-0 left-[20%] w-64 h-32 bg-gradient-to-r from-green-400/20 via-cyan-400/30 to-purple-400/20 blur-xl animate-pulse" />
    
    {/* Snowflakes */}
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute text-white/60 animate-bounce"
        style={{
          top: `${Math.random() * 80}%`,
          left: `${Math.random() * 100}%`,
          fontSize: `${8 + Math.random() * 8}px`,
          animationDuration: `${4 + Math.random() * 4}s`,
          animationDelay: `${Math.random() * 3}s`
        }}
      >
        ❄
      </div>
    ))}
    
    {/* Ice formations */}
    <div className="absolute bottom-0 left-4 w-8 h-20 bg-gradient-to-t from-cyan-200 to-cyan-100 opacity-60"
      style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }} />
    <div className="absolute bottom-0 right-8 w-12 h-24 bg-gradient-to-t from-cyan-300 to-cyan-200 opacity-50"
      style={{ clipPath: 'polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)' }} />
    
    {/* Snow ground */}
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-slate-100/80" />
  </div>
);

// Cyber/Digital Scene
export const CyberScene = () => (
  <div className="absolute inset-0">
    {/* Grid floor perspective */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-900/50 to-transparent">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute left-0 right-0 h-px bg-cyan-400/30" style={{ bottom: `${i * 15}%` }} />
      ))}
    </div>
    
    {/* Digital particles */}
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-cyan-400 animate-ping"
        style={{
          top: `${Math.random() * 70}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${1 + Math.random() * 2}s`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
    
    {/* Holographic elements */}
    <div className="absolute top-16 left-[15%] w-16 h-16 border border-cyan-400/40 rotate-45 animate-pulse" />
    <div className="absolute top-24 right-[20%] w-12 h-12 border border-magenta-400/40 rotate-12 animate-pulse" style={{ animationDelay: '0.5s' }} />
    
    {/* Glowing lines */}
    <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
  </div>
);

// Scene selector function
export const getSceneComponent = (theme) => {
  const scenes = {
    fantasy_dragon_lair: DragonLairScene,
    spooky_haunted: HauntedScene,
    spooky_graveyard: HauntedScene,
    space_station: SpaceScene,
    space_alien_planet: SpaceScene,
    space_asteroid: SpaceScene,
    ocean_depths: OceanScene,
    ocean_coral_reef: OceanScene,
    ocean_shipwreck: OceanScene,
    prehistoric_jungle: JungleScene,
    prehistoric_volcano: JungleScene,
    myth_olympus: OlympusScene,
    myth_underworld: HauntedScene,
    myth_norse: ArcticScene,
    science_lab: LabScene,
    science_cyber: CyberScene,
    nature_arctic: ArcticScene,
    nature_desert: DesertScene,
    nature_storm: SpaceScene,
  };
  
  return scenes[theme] || null;
};

export default {
  DragonLairScene,
  HauntedScene,
  SpaceScene,
  OceanScene,
  JungleScene,
  OlympusScene,
  LabScene,
  DesertScene,
  ArcticScene,
  CyberScene,
  getSceneComponent
};
