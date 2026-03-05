/**
 * Adventure Scene Backgrounds - Detailed visual backgrounds for each scene
 */
import React from 'react';

// ==================== PIRATE VOYAGE SCENES ====================

export const PirateBeachScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Sky gradient */}
    <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200" />
    
    {/* Sun */}
    <div className="absolute top-8 right-16 w-16 h-16 bg-yellow-300 rounded-full blur-sm shadow-lg shadow-yellow-300/50" />
    
    {/* Clouds */}
    <div className="absolute top-12 left-[15%] w-24 h-8 bg-white/80 rounded-full blur-sm" />
    <div className="absolute top-16 left-[10%] w-16 h-6 bg-white/60 rounded-full blur-sm" />
    <div className="absolute top-10 right-[35%] w-20 h-6 bg-white/70 rounded-full blur-sm" />
    
    {/* Ocean */}
    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-b from-cyan-500 to-blue-600" />
    <div className="absolute bottom-[33%] left-0 right-0 h-4 bg-gradient-to-b from-cyan-400/50 to-transparent" />
    
    {/* Waves */}
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="absolute h-3 bg-white/30 rounded-full animate-pulse"
        style={{
          bottom: `${28 + i * 2}%`,
          left: `${i * 20}%`,
          width: '30%',
          animationDelay: `${i * 0.3}s`
        }}
      />
    ))}
    
    {/* Beach sand */}
    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-300 to-amber-200" />
    
    {/* Palm trees */}
    <div className="absolute bottom-[20%] left-8 text-5xl">🌴</div>
    <div className="absolute bottom-[18%] left-24 text-4xl opacity-80">🌴</div>
    <div className="absolute bottom-[22%] right-12 text-5xl">🌴</div>
    
    {/* Ship in distance */}
    <div className="absolute bottom-[38%] right-[20%] text-3xl opacity-60">⛵</div>
    
    {/* Seashells and items */}
    <div className="absolute bottom-[8%] left-[30%] text-2xl">🐚</div>
    <div className="absolute bottom-[5%] right-[40%] text-xl">🦀</div>
  </div>
);

export const PirateJungleScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Dense jungle background */}
    <div className="absolute inset-0 bg-gradient-to-b from-green-800 via-green-700 to-green-900" />
    
    {/* Light rays through canopy */}
    <div className="absolute top-0 left-[20%] w-8 h-48 bg-gradient-to-b from-yellow-300/30 to-transparent transform -rotate-12" />
    <div className="absolute top-0 left-[50%] w-6 h-56 bg-gradient-to-b from-yellow-300/20 to-transparent" />
    <div className="absolute top-0 right-[25%] w-10 h-40 bg-gradient-to-b from-yellow-300/25 to-transparent transform rotate-12" />
    
    {/* Trees and foliage - back layer */}
    <div className="absolute top-0 left-0 text-6xl opacity-40">🌳</div>
    <div className="absolute top-0 right-0 text-6xl opacity-40">🌳</div>
    <div className="absolute top-12 left-[30%] text-5xl opacity-50">🌴</div>
    
    {/* Vines */}
    <div className="absolute top-0 left-[15%] w-2 h-32 bg-gradient-to-b from-green-600 to-green-700 rounded-full" />
    <div className="absolute top-0 right-[20%] w-2 h-40 bg-gradient-to-b from-green-600 to-green-700 rounded-full" />
    
    {/* Ground foliage */}
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-green-950 to-transparent" />
    <div className="absolute bottom-0 left-4 text-4xl">🌿</div>
    <div className="absolute bottom-0 left-[25%] text-3xl">🌺</div>
    <div className="absolute bottom-2 right-8 text-4xl">🌿</div>
    <div className="absolute bottom-0 right-[30%] text-3xl">🪻</div>
    
    {/* Wildlife */}
    <div className="absolute top-[30%] right-[15%] text-3xl animate-bounce" style={{ animationDuration: '3s' }}>🦜</div>
    <div className="absolute bottom-[25%] left-[20%] text-2xl">🦎</div>
    <div className="absolute top-[40%] left-[10%] text-2xl">🦋</div>
  </div>
);

export const PirateCaveScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Dark cave background */}
    <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-950" />
    
    {/* Cave walls */}
    <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-stone-950 to-transparent" />
    <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-stone-950 to-transparent" />
    
    {/* Stalactites */}
    <div className="absolute top-0 left-[15%] w-4 h-20 bg-gradient-to-b from-stone-600 to-stone-700 rounded-b-full" />
    <div className="absolute top-0 left-[30%] w-6 h-28 bg-gradient-to-b from-stone-500 to-stone-600 rounded-b-full" />
    <div className="absolute top-0 right-[20%] w-5 h-24 bg-gradient-to-b from-stone-600 to-stone-700 rounded-b-full" />
    <div className="absolute top-0 right-[40%] w-3 h-16 bg-gradient-to-b from-stone-500 to-stone-600 rounded-b-full" />
    
    {/* Stalagmites */}
    <div className="absolute bottom-0 left-[20%] w-5 h-16 bg-gradient-to-t from-stone-600 to-stone-700 rounded-t-full" />
    <div className="absolute bottom-0 right-[30%] w-4 h-12 bg-gradient-to-t from-stone-600 to-stone-700 rounded-t-full" />
    
    {/* Torch light */}
    <div className="absolute top-1/3 left-[10%] w-32 h-32 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
    <div className="absolute top-1/3 right-[10%] w-32 h-32 bg-orange-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
    
    {/* Torches */}
    <div className="absolute top-[30%] left-[8%] text-2xl">🔥</div>
    <div className="absolute top-[30%] right-[8%] text-2xl">🔥</div>
    
    {/* Treasure hints */}
    <div className="absolute bottom-[15%] right-[25%] text-xl opacity-60">💰</div>
    <div className="absolute bottom-[10%] left-[35%] text-lg opacity-50">🪙</div>
    
    {/* Bats */}
    <div className="absolute top-[20%] left-[40%] text-xl animate-bounce" style={{ animationDuration: '2s' }}>🦇</div>
    <div className="absolute top-[25%] right-[35%] text-lg animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦇</div>
  </div>
);

export const PirateTreasureScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Golden cave background */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-950" />
    
    {/* Golden glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/30 rounded-full blur-3xl animate-pulse" />
    
    {/* Treasure piles */}
    <div className="absolute bottom-0 left-[20%] text-4xl">💰</div>
    <div className="absolute bottom-0 left-[35%] text-5xl">👑</div>
    <div className="absolute bottom-0 right-[20%] text-4xl">💎</div>
    <div className="absolute bottom-[5%] left-[25%] text-3xl">🪙</div>
    <div className="absolute bottom-[8%] right-[30%] text-3xl">💍</div>
    <div className="absolute bottom-[3%] left-[45%] text-4xl">🏆</div>
    
    {/* Treasure chest */}
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-6xl">🎁</div>
    
    {/* Sparkles */}
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute text-lg animate-ping"
        style={{
          top: `${20 + Math.random() * 50}%`,
          left: `${10 + Math.random() * 80}%`,
          animationDuration: `${1 + Math.random() * 2}s`,
          animationDelay: `${Math.random() * 2}s`
        }}
      >
        ✨
      </div>
    ))}
  </div>
);

// ==================== SPACE MISSION SCENES ====================

export const SpaceLaunchScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Sky at dusk */}
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-800 to-orange-600" />
    
    {/* Stars appearing */}
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          top: `${Math.random() * 40}%`,
          left: `${Math.random() * 100}%`,
          opacity: 0.3 + Math.random() * 0.5
        }}
      />
    ))}
    
    {/* Launch tower */}
    <div className="absolute bottom-0 left-[30%] w-8 h-48 bg-gradient-to-t from-gray-700 to-gray-600" />
    <div className="absolute bottom-[40%] left-[28%] w-12 h-3 bg-gray-500" />
    <div className="absolute bottom-[30%] left-[28%] w-12 h-3 bg-gray-500" />
    
    {/* Rocket */}
    <div className="absolute bottom-[20%] left-[38%] text-6xl">🚀</div>
    
    {/* Ground */}
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-800 to-gray-700" />
    
    {/* Exhaust/Steam */}
    <div className="absolute bottom-[15%] left-[40%] w-20 h-20 bg-white/30 rounded-full blur-xl animate-pulse" />
  </div>
);

export const SpaceBridgeScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Space background */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950" />
    
    {/* Stars */}
    {[...Array(40)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: 0.3 + Math.random() * 0.7,
          animationDelay: `${Math.random() * 3}s`
        }}
      />
    ))}
    
    {/* Control panels - left */}
    <div className="absolute bottom-[20%] left-4 w-20 h-32 bg-slate-800 rounded border border-cyan-500/30">
      <div className="absolute top-2 left-2 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      <div className="absolute top-2 right-2 w-3 h-3 bg-red-400 rounded-full" />
      <div className="absolute top-8 left-2 right-2 h-12 bg-slate-700 rounded" />
    </div>
    
    {/* Control panels - right */}
    <div className="absolute bottom-[20%] right-4 w-20 h-32 bg-slate-800 rounded border border-cyan-500/30">
      <div className="absolute top-2 left-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
      <div className="absolute top-8 left-2 right-2 h-16 bg-cyan-900/50 rounded" />
    </div>
    
    {/* Main viewscreen */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-24 bg-slate-800 rounded-lg border-2 border-cyan-400/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-purple-900" />
      <div className="absolute top-[30%] left-[40%] w-4 h-4 bg-blue-400 rounded-full opacity-60" />
    </div>
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-800 to-slate-900" />
    <div className="absolute bottom-0 left-0 right-0 h-2 bg-cyan-500/20" />
  </div>
);

export const SpacePlanetScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Deep space */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950" />
    
    {/* Stars */}
    {[...Array(50)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: 0.2 + Math.random() * 0.8
        }}
      />
    ))}
    
    {/* Nebula */}
    <div className="absolute top-[20%] left-[10%] w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
    <div className="absolute bottom-[30%] right-[5%] w-32 h-32 bg-pink-500/15 rounded-full blur-3xl" />
    
    {/* New planet - large */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-700">
      <div className="absolute top-[20%] left-[15%] w-12 h-8 bg-teal-300/40 rounded-full" />
      <div className="absolute bottom-[25%] right-[20%] w-16 h-6 bg-teal-300/30 rounded-full" />
      <div className="absolute top-[40%] left-[40%] w-8 h-8 bg-emerald-400/40 rounded-full" />
    </div>
    
    {/* Planet's moon */}
    <div className="absolute top-[20%] right-[25%] w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500" />
    
    {/* Spaceship approaching */}
    <div className="absolute bottom-[30%] left-[15%] text-3xl">🚀</div>
  </div>
);

// ==================== PIRATE WATERFALL SCENE ====================

export const PirateWaterfallScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Jungle sky */}
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-700 via-green-600 to-teal-700" />
    
    {/* Mist from waterfall */}
    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/10 blur-xl" />
    
    {/* Waterfall - main fall */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full bg-gradient-to-b from-cyan-200 via-cyan-300 to-cyan-400/50">
      <div className="absolute inset-0 bg-white/30 animate-pulse" style={{ animationDuration: '0.5s' }} />
    </div>
    
    {/* Rocks on sides */}
    <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-stone-800 to-transparent" />
    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-stone-800 to-transparent" />
    
    {/* Pool at bottom */}
    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-400/50" />
    
    {/* Splash effect */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-48 h-12 bg-white/40 rounded-full blur-lg animate-pulse" />
    
    {/* Jungle plants */}
    <div className="absolute bottom-[25%] left-4 text-4xl">🌿</div>
    <div className="absolute bottom-[28%] right-6 text-4xl">🌿</div>
    <div className="absolute top-[20%] left-8 text-3xl">🌺</div>
    <div className="absolute top-[25%] right-12 text-2xl">🦜</div>
    
    {/* Rainbow in mist */}
    <div className="absolute top-[30%] left-[20%] w-[60%] h-8 bg-gradient-to-r from-red-400/30 via-yellow-400/30 to-blue-400/30 rounded-full blur-sm" />
  </div>
);

// ==================== PIRATE UNDERGROUND LAKE ====================

export const PirateUndergroundScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Cave ceiling */}
    <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-blue-950" />
    
    {/* Bioluminescent glow */}
    <div className="absolute top-[20%] left-[20%] w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl" />
    <div className="absolute top-[30%] right-[25%] w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
    
    {/* Stalactites */}
    {[15, 30, 50, 70, 85].map((left, i) => (
      <div key={i} className="absolute top-0 w-3 h-16 bg-gradient-to-b from-stone-600 to-stone-700 rounded-b-full" style={{ left: `${left}%`, height: `${12 + i * 3}%` }} />
    ))}
    
    {/* Underground lake */}
    <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-blue-900 via-blue-800 to-blue-700/50" />
    
    {/* Water reflections */}
    <div className="absolute bottom-[15%] left-[20%] w-24 h-1 bg-cyan-400/40 rounded-full" />
    <div className="absolute bottom-[12%] right-[30%] w-16 h-1 bg-cyan-400/30 rounded-full" />
    
    {/* Glowing crystals */}
    <div className="absolute bottom-[40%] left-[15%] text-2xl animate-pulse">💎</div>
    <div className="absolute bottom-[45%] right-[20%] text-xl animate-pulse" style={{ animationDelay: '1s' }}>💎</div>
    <div className="absolute top-[30%] left-[40%] text-lg animate-pulse" style={{ animationDelay: '0.5s' }}>💠</div>
    
    {/* Small boat */}
    <div className="absolute bottom-[25%] left-[40%] text-3xl">🚣</div>
    
    {/* Ghost pirate hint */}
    <div className="absolute bottom-[30%] right-[15%] text-2xl opacity-60 animate-pulse" style={{ animationDuration: '3s' }}>👻</div>
  </div>
);

// ==================== PIRATE TEMPLE SCENE ====================

export const PirateTempleScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Ancient temple interior */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-900 via-stone-800 to-stone-950" />
    
    {/* Temple pillars */}
    <div className="absolute top-0 bottom-0 left-[10%] w-12 bg-gradient-to-b from-amber-700 via-amber-800 to-stone-900" />
    <div className="absolute top-0 bottom-0 right-[10%] w-12 bg-gradient-to-b from-amber-700 via-amber-800 to-stone-900" />
    
    {/* Pillar details */}
    <div className="absolute top-[10%] left-[10%] w-12 h-8 bg-amber-600 rounded-t-lg" />
    <div className="absolute top-[10%] right-[10%] w-12 h-8 bg-amber-600 rounded-t-lg" />
    
    {/* Altar in center */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-40 h-20 bg-gradient-to-t from-stone-700 to-stone-600">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">🏺</div>
    </div>
    
    {/* Torches */}
    <div className="absolute top-[30%] left-[15%] text-2xl">🔥</div>
    <div className="absolute top-[30%] right-[15%] text-2xl">🔥</div>
    
    {/* Torch glow */}
    <div className="absolute top-[28%] left-[12%] w-16 h-16 bg-orange-500/30 rounded-full blur-xl animate-pulse" />
    <div className="absolute top-[28%] right-[12%] w-16 h-16 bg-orange-500/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />
    
    {/* Ancient carvings */}
    <div className="absolute top-[50%] left-[25%] text-xl opacity-60">🐍</div>
    <div className="absolute top-[55%] right-[25%] text-xl opacity-60">🦅</div>
    
    {/* Stone guardian */}
    <div className="absolute bottom-[25%] left-[30%] text-3xl">🗿</div>
    
    {/* Floor tiles */}
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800" />
  </div>
);

// ==================== MYSTERY MANSION SCENES ====================

export const MansionEntranceScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Stormy night sky */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950" />
    
    {/* Lightning flash effect */}
    <div className="absolute inset-0 bg-purple-300/5 animate-pulse" style={{ animationDuration: '4s' }} />
    
    {/* Moon behind clouds */}
    <div className="absolute top-8 right-16 w-12 h-12 bg-slate-300 rounded-full opacity-60" />
    <div className="absolute top-6 right-12 w-20 h-8 bg-slate-800/80 rounded-full" />
    
    {/* Mansion silhouette - main building */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-56 h-40 bg-slate-950">
      {/* Windows */}
      <div className="absolute top-4 left-4 w-8 h-10 bg-amber-500/30 rounded-t-lg" />
      <div className="absolute top-4 right-4 w-8 h-10 bg-amber-500/20 rounded-t-lg" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-12 bg-amber-500/40 rounded-t-full" />
      
      {/* Door */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-16 bg-amber-900 rounded-t-lg border-2 border-amber-700" />
    </div>
    
    {/* Towers */}
    <div className="absolute bottom-[45%] left-[28%] w-12 h-24 bg-slate-950" />
    <div className="absolute bottom-[45%] right-[28%] w-12 h-20 bg-slate-950" />
    
    {/* Ground */}
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-slate-900" />
    
    {/* Dead trees */}
    <div className="absolute bottom-[15%] left-8 w-3 h-24 bg-slate-950 rounded-t" />
    <div className="absolute bottom-[30%] left-4 w-10 h-2 bg-slate-950 transform -rotate-45" />
    <div className="absolute bottom-[15%] right-8 w-2 h-20 bg-slate-950 rounded-t" />
    
    {/* Bats */}
    <div className="absolute top-[25%] left-[30%] text-lg animate-bounce" style={{ animationDuration: '2s' }}>🦇</div>
    <div className="absolute top-[20%] right-[35%] text-sm animate-bounce" style={{ animationDuration: '2.5s' }}>🦇</div>
  </div>
);

export const MansionLibraryScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Dark interior */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-950 via-stone-900 to-stone-950" />
    
    {/* Bookshelves - left */}
    <div className="absolute top-0 bottom-0 left-0 w-24 bg-amber-900">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute left-2 right-2 h-3 bg-gradient-to-r from-red-900 via-blue-900 to-green-900" style={{ top: `${i * 12 + 5}%` }} />
      ))}
    </div>
    
    {/* Bookshelves - right */}
    <div className="absolute top-0 bottom-0 right-0 w-24 bg-amber-900">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="absolute left-2 right-2 h-3 bg-gradient-to-r from-green-900 via-red-900 to-blue-900" style={{ top: `${i * 12 + 5}%` }} />
      ))}
    </div>
    
    {/* Chandelier glow */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl">🕯️</div>
    
    {/* Reading desk */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-32 h-12 bg-amber-800 rounded" />
    <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 text-2xl">📖</div>
    
    {/* Floating books/ghost effect */}
    <div className="absolute top-[40%] left-[35%] text-xl animate-bounce" style={{ animationDuration: '3s' }}>📚</div>
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-stone-950 to-stone-900" />
    
    {/* Cobwebs */}
    <div className="absolute top-0 left-24 text-2xl opacity-40">🕸️</div>
    <div className="absolute top-0 right-24 text-2xl opacity-40">🕸️</div>
  </div>
);

// ==================== MANSION KITCHEN SCENE ====================

export const MansionKitchenScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Dark kitchen */}
    <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-950" />
    
    {/* Brick wall back */}
    <div className="absolute top-0 left-0 right-0 h-1/2 opacity-20">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-1" style={{ marginTop: i % 2 === 0 ? 0 : '0' }}>
          {[...Array(12)].map((_, j) => (
            <div key={j} className="w-12 h-6 bg-red-900/50 border border-red-950/30" />
          ))}
        </div>
      ))}
    </div>
    
    {/* Old stove */}
    <div className="absolute bottom-[20%] left-[15%] w-24 h-20 bg-slate-800 rounded-t-lg">
      <div className="absolute top-2 left-2 w-4 h-4 bg-orange-600/50 rounded-full animate-pulse" />
      <div className="absolute top-2 right-2 w-4 h-4 bg-slate-600 rounded-full" />
    </div>
    
    {/* Counter */}
    <div className="absolute bottom-[20%] right-[10%] w-32 h-16 bg-amber-900" />
    
    {/* Hanging pots */}
    <div className="absolute top-[15%] left-[30%] text-2xl">🍳</div>
    <div className="absolute top-[18%] left-[40%] text-xl">🥘</div>
    <div className="absolute top-[14%] right-[35%] text-2xl">🫕</div>
    
    {/* Ghost chef glow */}
    <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-24 h-24 bg-green-500/10 rounded-full blur-xl animate-pulse" style={{ animationDuration: '3s' }} />
    
    {/* Food items */}
    <div className="absolute bottom-[25%] right-[15%] text-xl">🧄</div>
    <div className="absolute bottom-[28%] right-[25%] text-lg">🧅</div>
    
    {/* Rats */}
    <div className="absolute bottom-[5%] left-[40%] text-lg">🐀</div>
    <div className="absolute bottom-[8%] right-[50%] text-sm opacity-70">🐀</div>
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900" />
  </div>
);

// ==================== MANSION GALLERY SCENE ====================

export const MansionGalleryScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Elegant but creepy walls */}
    <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-red-950 to-stone-950" />
    
    {/* Wallpaper pattern */}
    <div className="absolute inset-0 opacity-10">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute text-4xl" style={{ top: `${Math.floor(i/5) * 25}%`, left: `${(i%5) * 20}%` }}>🔱</div>
      ))}
    </div>
    
    {/* Portrait frames */}
    <div className="absolute top-[15%] left-[15%] w-16 h-20 bg-amber-800 border-4 border-amber-600 rounded">
      <div className="absolute inset-1 bg-stone-800">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xl">👤</div>
      </div>
    </div>
    <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-20 h-24 bg-amber-800 border-4 border-amber-600 rounded">
      <div className="absolute inset-1 bg-stone-800">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-2xl animate-pulse" style={{ animationDuration: '5s' }}>👁️</div>
      </div>
    </div>
    <div className="absolute top-[15%] right-[15%] w-16 h-20 bg-amber-800 border-4 border-amber-600 rounded">
      <div className="absolute inset-1 bg-stone-800">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xl">👤</div>
      </div>
    </div>
    
    {/* Eyes following */}
    <div className="absolute top-[18%] left-[20%] w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    <div className="absolute top-[18%] right-[20%] w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
    
    {/* Red carpet */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-full bg-gradient-to-t from-red-900/50 to-transparent" />
    
    {/* Candelabra */}
    <div className="absolute top-[40%] left-[10%] text-2xl">🕯️</div>
    <div className="absolute top-[40%] right-[10%] text-2xl">🕯️</div>
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-950 to-stone-900" />
  </div>
);

// ==================== MANSION BASEMENT SCENE ====================

export const MansionBasementScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Dark basement */}
    <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-slate-950 to-black" />
    
    {/* Stone walls */}
    <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-stone-900 to-transparent" />
    <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-stone-900 to-transparent" />
    
    {/* Stairs coming down */}
    <div className="absolute top-[10%] right-[20%] w-24 h-32 bg-gradient-to-b from-stone-700 to-stone-800" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 30% 100%)' }} />
    
    {/* Wine barrels */}
    <div className="absolute bottom-[20%] left-[15%] w-12 h-10 bg-amber-900 rounded-full border-2 border-amber-700" />
    <div className="absolute bottom-[18%] left-[25%] w-10 h-8 bg-amber-800 rounded-full border-2 border-amber-600" />
    
    {/* Chains */}
    <div className="absolute top-[20%] left-[30%] text-xl">⛓️</div>
    <div className="absolute top-[25%] right-[35%] text-lg">⛓️</div>
    
    {/* Single light */}
    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl animate-pulse" />
    <div className="absolute top-[28%] left-1/2 -translate-x-1/2 text-xl">💡</div>
    
    {/* Cobwebs */}
    <div className="absolute top-0 left-0 text-3xl opacity-50">🕸️</div>
    <div className="absolute top-0 right-0 text-3xl opacity-50">🕸️</div>
    
    {/* Rat king area */}
    <div className="absolute bottom-[10%] right-[20%] text-2xl">🐀</div>
    <div className="absolute bottom-[8%] right-[25%] text-lg">🐀</div>
    <div className="absolute bottom-[12%] right-[15%] text-sm">🐀</div>
    
    {/* Floor - wet stone */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 to-stone-950" />
    <div className="absolute bottom-2 left-[40%] w-24 h-2 bg-blue-900/30 rounded-full blur-sm" />
  </div>
);

// ==================== MANSION ATTIC SCENE ====================

export const MansionAtticScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Dusty attic */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-900/80 via-stone-800 to-stone-900" />
    
    {/* Slanted roof */}
    <div className="absolute top-0 left-0 w-1/2 h-1/3 bg-gradient-to-br from-stone-800 to-transparent" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
    <div className="absolute top-0 right-0 w-1/2 h-1/3 bg-gradient-to-bl from-stone-800 to-transparent" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
    
    {/* Window with moonlight */}
    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-16 h-20 bg-slate-700 rounded-t-full border-2 border-amber-800">
      <div className="absolute inset-1 bg-gradient-to-b from-indigo-900 to-purple-950 rounded-t-full" />
      <div className="absolute top-2 right-2 w-4 h-4 bg-slate-300 rounded-full opacity-50" />
    </div>
    
    {/* Moonlight beam */}
    <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-12 h-48 bg-gradient-to-b from-slate-300/20 to-transparent transform rotate-6" />
    
    {/* Old furniture */}
    <div className="absolute bottom-[25%] left-[15%] w-20 h-16 bg-amber-900/60 rounded" />
    <div className="absolute bottom-[30%] left-[18%] text-2xl">📦</div>
    
    {/* Old trunk */}
    <div className="absolute bottom-[20%] right-[20%] w-16 h-12 bg-amber-800 rounded border-2 border-amber-600" />
    
    {/* Dress form */}
    <div className="absolute bottom-[25%] right-[35%] text-3xl opacity-70">👗</div>
    
    {/* Cobwebs everywhere */}
    <div className="absolute top-[10%] left-[20%] text-3xl opacity-40">🕸️</div>
    <div className="absolute top-[15%] right-[25%] text-2xl opacity-40">🕸️</div>
    
    {/* Dust particles */}
    {[...Array(10)].map((_, i) => (
      <div key={i} className="absolute w-1 h-1 bg-amber-200/30 rounded-full animate-pulse" 
        style={{ top: `${30 + Math.random() * 50}%`, left: `${10 + Math.random() * 80}%`, animationDelay: `${Math.random() * 3}s` }} />
    ))}
    
    {/* Old lady ghost hint */}
    <div className="absolute bottom-[35%] left-[40%] text-xl opacity-30 animate-pulse" style={{ animationDuration: '4s' }}>👵</div>
  </div>
);

// ==================== MANSION SECRET CHAMBER ====================

export const MansionSecretScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Hidden chamber */}
    <div className="absolute inset-0 bg-gradient-to-b from-purple-950 via-slate-950 to-black" />
    
    {/* Eerie glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
    
    {/* Stone coffin */}
    <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-40 h-16 bg-stone-800 rounded border-2 border-stone-600">
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-32 h-2 bg-stone-700" />
    </div>
    
    {/* Candles around */}
    <div className="absolute bottom-[30%] left-[25%] text-xl">🕯️</div>
    <div className="absolute bottom-[30%] right-[25%] text-xl">🕯️</div>
    <div className="absolute bottom-[20%] left-[30%] text-lg">🕯️</div>
    <div className="absolute bottom-[20%] right-[30%] text-lg">🕯️</div>
    
    {/* Symbols on walls */}
    <div className="absolute top-[30%] left-[15%] text-2xl opacity-50">☠️</div>
    <div className="absolute top-[35%] right-[15%] text-2xl opacity-50">⚰️</div>
    
    {/* Vampire/Lord hint */}
    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-4xl animate-pulse" style={{ animationDuration: '5s' }}>🧛</div>
    
    {/* Treasure */}
    <div className="absolute bottom-[15%] left-[20%] text-xl">💎</div>
    <div className="absolute bottom-[12%] right-[25%] text-lg">💍</div>
    
    {/* Bats */}
    <div className="absolute top-[20%] left-[30%] text-lg animate-bounce" style={{ animationDuration: '2s' }}>🦇</div>
    <div className="absolute top-[15%] right-[35%] text-sm animate-bounce" style={{ animationDuration: '2.5s' }}>🦇</div>
  </div>
);

// ==================== ANCIENT EGYPT SCENES ====================

export const EgyptOasisScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Desert sky */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-200 via-orange-200 to-amber-300" />
    
    {/* Sun */}
    <div className="absolute top-8 right-16 w-20 h-20 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50" />
    
    {/* Desert dunes */}
    <div className="absolute bottom-[25%] left-0 right-0 h-1/3 bg-gradient-to-t from-amber-400 to-amber-300" style={{ clipPath: 'polygon(0 100%, 0 60%, 20% 40%, 40% 60%, 60% 35%, 80% 55%, 100% 45%, 100% 100%)' }} />
    
    {/* Oasis water */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-48 h-20 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
    
    {/* Palm trees around oasis */}
    <div className="absolute bottom-[28%] left-[25%] text-5xl">🌴</div>
    <div className="absolute bottom-[32%] left-[35%] text-4xl">🌴</div>
    <div className="absolute bottom-[30%] right-[30%] text-5xl">🌴</div>
    <div className="absolute bottom-[26%] right-[22%] text-4xl">🌴</div>
    
    {/* Pyramids in distance */}
    <div className="absolute bottom-[40%] left-[10%] w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-amber-600/60" />
    <div className="absolute bottom-[38%] left-[18%] w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-amber-600/40" />
    
    {/* Camel */}
    <div className="absolute bottom-[22%] left-[15%] text-4xl">🐪</div>
    
    {/* Desert floor */}
    <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-t from-amber-500 to-amber-400" />
  </div>
);

export const EgyptEntranceScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Evening desert sky */}
    <div className="absolute inset-0 bg-gradient-to-b from-orange-400 via-amber-400 to-amber-500" />
    
    {/* Sun setting */}
    <div className="absolute top-[20%] right-[10%] w-16 h-16 bg-orange-500 rounded-full shadow-lg shadow-orange-500/50" />
    
    {/* Giant pyramid */}
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-0 h-0 
      border-l-[150px] border-r-[150px] border-b-[200px] 
      border-l-transparent border-r-transparent border-b-amber-700" />
    
    {/* Pyramid entrance */}
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-20 h-24 bg-stone-950" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-12 h-16 bg-black" />
    
    {/* Sphinx silhouette */}
    <div className="absolute bottom-[18%] left-[15%] text-4xl">🦁</div>
    
    {/* Hieroglyphs on walls */}
    <div className="absolute bottom-[35%] left-[38%] text-lg opacity-50">𓀀</div>
    <div className="absolute bottom-[40%] right-[38%] text-lg opacity-50">𓂀</div>
    
    {/* Guards/statues */}
    <div className="absolute bottom-[18%] left-[40%] text-2xl">🗿</div>
    <div className="absolute bottom-[18%] right-[40%] text-2xl">🗿</div>
    
    {/* Desert floor */}
    <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-amber-600 to-amber-500" />
  </div>
);

export const EgyptHieroglyphsScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Temple interior */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-800 via-stone-800 to-stone-900" />
    
    {/* Torch light glow */}
    <div className="absolute top-[30%] left-[10%] w-32 h-32 bg-orange-500/30 rounded-full blur-2xl animate-pulse" />
    <div className="absolute top-[30%] right-[10%] w-32 h-32 bg-orange-500/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
    
    {/* Torches */}
    <div className="absolute top-[28%] left-[8%] text-2xl">🔥</div>
    <div className="absolute top-[28%] right-[8%] text-2xl">🔥</div>
    
    {/* Wall with hieroglyphs */}
    <div className="absolute top-[15%] left-[20%] right-[20%] bottom-[30%] bg-amber-700/50 rounded-lg">
      {/* Hieroglyph symbols */}
      <div className="absolute top-4 left-4 text-3xl">𓀀</div>
      <div className="absolute top-4 left-16 text-3xl">𓁿</div>
      <div className="absolute top-4 right-4 text-3xl">𓂀</div>
      <div className="absolute top-16 left-8 text-2xl">𓃀</div>
      <div className="absolute top-16 right-8 text-2xl">𓆣</div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-4xl">👁️</div>
    </div>
    
    {/* Scribe */}
    <div className="absolute bottom-[25%] right-[25%] text-3xl">📜</div>
    
    {/* Pillars */}
    <div className="absolute top-0 bottom-0 left-[5%] w-10 bg-gradient-to-b from-amber-700 to-amber-800" />
    <div className="absolute top-0 bottom-0 right-[5%] w-10 bg-gradient-to-b from-amber-700 to-amber-800" />
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-900 to-stone-800" />
  </div>
);

export const EgyptTrapsScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Dark corridor */}
    <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-950" />
    
    {/* Warning glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '2s' }} />
    
    {/* Stone walls */}
    <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-stone-950 to-transparent" />
    <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-stone-950 to-transparent" />
    
    {/* Trap holes in floor */}
    <div className="absolute bottom-[20%] left-[20%] w-16 h-8 bg-black rounded" />
    <div className="absolute bottom-[15%] left-[45%] w-12 h-8 bg-black rounded" />
    <div className="absolute bottom-[20%] right-[25%] w-16 h-8 bg-black rounded" />
    
    {/* Spikes */}
    <div className="absolute bottom-[25%] left-[25%] text-xl">⚠️</div>
    <div className="absolute bottom-[18%] right-[30%] text-xl">⚠️</div>
    
    {/* Pressure plates */}
    <div className="absolute bottom-[10%] left-[35%] w-8 h-2 bg-stone-600 rounded" />
    <div className="absolute bottom-[10%] right-[40%] w-8 h-2 bg-stone-600 rounded" />
    
    {/* Mummy wandering */}
    <div className="absolute bottom-[30%] left-[60%] text-3xl animate-pulse" style={{ animationDuration: '3s' }}>🧟</div>
    
    {/* Torch */}
    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 text-2xl">🔥</div>
    
    {/* Arrows on wall */}
    <div className="absolute top-[40%] left-[12%] text-lg opacity-50">➡️</div>
    <div className="absolute top-[45%] right-[12%] text-lg opacity-50">⬅️</div>
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900" />
  </div>
);

export const EgyptBurialScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Dark burial chamber */}
    <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-purple-950 to-black" />
    
    {/* Eerie glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
    
    {/* Sarcophagus */}
    <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-32 h-48 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-3xl border-4 border-amber-500">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl">👑</div>
      <div className="absolute top-24 left-1/2 -translate-x-1/2 text-2xl">☥</div>
    </div>
    
    {/* Canopic jars */}
    <div className="absolute bottom-[20%] left-[20%] text-2xl">🏺</div>
    <div className="absolute bottom-[18%] left-[28%] text-xl">🏺</div>
    <div className="absolute bottom-[20%] right-[20%] text-2xl">🏺</div>
    <div className="absolute bottom-[18%] right-[28%] text-xl">🏺</div>
    
    {/* Anubis statue */}
    <div className="absolute bottom-[35%] left-[15%] text-4xl">🐺</div>
    
    {/* Hieroglyphs */}
    <div className="absolute top-[25%] left-[10%] text-xl opacity-40">𓂀</div>
    <div className="absolute top-[30%] right-[10%] text-xl opacity-40">𓃀</div>
    
    {/* Floating spirits */}
    <div className="absolute top-[35%] right-[25%] text-xl opacity-40 animate-bounce" style={{ animationDuration: '4s' }}>👻</div>
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-stone-950 to-stone-900" />
  </div>
);

export const EgyptTreasuryScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Golden chamber */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-700 via-yellow-700 to-amber-800" />
    
    {/* Golden glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/40 rounded-full blur-3xl animate-pulse" />
    
    {/* Treasure piles */}
    <div className="absolute bottom-[15%] left-[15%] text-4xl">💰</div>
    <div className="absolute bottom-[18%] left-[25%] text-3xl">👑</div>
    <div className="absolute bottom-[12%] left-[35%] text-3xl">💎</div>
    <div className="absolute bottom-[15%] right-[15%] text-4xl">💰</div>
    <div className="absolute bottom-[20%] right-[25%] text-3xl">🏺</div>
    <div className="absolute bottom-[10%] right-[35%] text-2xl">💍</div>
    
    {/* Central treasure */}
    <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 text-6xl animate-pulse">👁️</div>
    
    {/* Cat goddess */}
    <div className="absolute bottom-[35%] right-[20%] text-4xl">🐱</div>
    
    {/* Sparkles */}
    {[...Array(10)].map((_, i) => (
      <div key={i} className="absolute text-lg animate-ping"
        style={{ top: `${20 + Math.random() * 50}%`, left: `${15 + Math.random() * 70}%`, animationDuration: `${1 + Math.random() * 2}s`, animationDelay: `${Math.random() * 2}s` }}>
        ✨
      </div>
    ))}
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-amber-900 to-amber-800" />
  </div>
);

export const EgyptThroneScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Royal chamber */}
    <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900" />
    
    {/* Royal glow */}
    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-400/30 rounded-full blur-3xl" />
    
    {/* Throne */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-40 h-56 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-3xl border-4 border-amber-500">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl">☀️</div>
    </div>
    
    {/* Pharaoh */}
    <div className="absolute bottom-[35%] left-1/2 -translate-x-1/2 text-6xl">👑</div>
    
    {/* Royal guards */}
    <div className="absolute bottom-[25%] left-[20%] text-3xl">🗿</div>
    <div className="absolute bottom-[25%] right-[20%] text-3xl">🗿</div>
    
    {/* Pillars */}
    <div className="absolute top-0 bottom-0 left-[10%] w-12 bg-gradient-to-b from-amber-500 to-amber-700">
      <div className="absolute top-4 left-0 right-0 h-8 bg-amber-400" />
    </div>
    <div className="absolute top-0 bottom-0 right-[10%] w-12 bg-gradient-to-b from-amber-500 to-amber-700">
      <div className="absolute top-4 left-0 right-0 h-8 bg-amber-400" />
    </div>
    
    {/* Royal carpet */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-full bg-gradient-to-t from-red-900/40 to-transparent" />
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900" />
  </div>
);

// ==================== ENCHANTED FOREST SCENES ====================

export const ForestEdgeScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Magical twilight sky */}
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-600 via-purple-500 to-pink-400" />
    
    {/* Stars/sparkles */}
    {[...Array(15)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
        style={{
          top: `${Math.random() * 40}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    ))}
    
    {/* Trees - back layer */}
    <div className="absolute bottom-[30%] left-0 w-full h-32 bg-green-900/80" style={{ clipPath: 'polygon(0 100%, 10% 40%, 25% 80%, 40% 30%, 55% 70%, 70% 20%, 85% 60%, 100% 40%, 100% 100%)' }} />
    
    {/* Trees - front layer */}
    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-950 to-green-900" />
    
    {/* Magical trees */}
    <div className="absolute bottom-[20%] left-8 text-5xl">🌲</div>
    <div className="absolute bottom-[25%] left-24 text-4xl opacity-80">🌳</div>
    <div className="absolute bottom-[22%] right-12 text-5xl">🌲</div>
    <div className="absolute bottom-[28%] right-28 text-4xl opacity-80">🌳</div>
    
    {/* Path */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-16 bg-amber-700/50 rounded-t-full" />
    
    {/* Fireflies */}
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-60"
        style={{
          bottom: `${20 + Math.random() * 40}%`,
          left: `${Math.random() * 100}%`,
          animationDuration: `${2 + Math.random() * 2}s`
        }}
      />
    ))}
    
    {/* Mushrooms */}
    <div className="absolute bottom-[5%] left-[20%] text-2xl">🍄</div>
    <div className="absolute bottom-[3%] right-[25%] text-xl">🍄</div>
  </div>
);

// ==================== FOREST GLADE SCENE ====================

export const ForestGladeScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Magical clearing */}
    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500 via-green-500 to-green-700" />
    
    {/* Sunlight through trees */}
    <div className="absolute top-0 left-[30%] w-16 h-64 bg-gradient-to-b from-yellow-200/40 to-transparent transform -rotate-12" />
    <div className="absolute top-0 right-[25%] w-12 h-48 bg-gradient-to-b from-yellow-200/30 to-transparent transform rotate-6" />
    
    {/* Flower circle */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-48 h-32 rounded-full bg-green-400/30">
      <div className="absolute top-2 left-4 text-xl">🌸</div>
      <div className="absolute top-0 right-8 text-lg">🌺</div>
      <div className="absolute bottom-2 left-8 text-xl">🌷</div>
      <div className="absolute bottom-4 right-4 text-lg">🌼</div>
    </div>
    
    {/* Trees around */}
    <div className="absolute top-[10%] left-4 text-5xl opacity-60">🌳</div>
    <div className="absolute top-[15%] right-8 text-5xl opacity-60">🌳</div>
    
    {/* Fairies */}
    <div className="absolute top-[35%] left-[25%] text-2xl animate-bounce" style={{ animationDuration: '2s' }}>🧚</div>
    <div className="absolute top-[40%] right-[30%] text-xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🧚</div>
    
    {/* Fireflies */}
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-70"
        style={{ top: `${25 + Math.random() * 40}%`, left: `${20 + Math.random() * 60}%`, animationDuration: `${2 + Math.random()}s` }} />
    ))}
    
    {/* Grass */}
    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-800 to-green-600" />
  </div>
);

// ==================== FOREST COTTAGE SCENE ====================

export const ForestCottageScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Forest background */}
    <div className="absolute inset-0 bg-gradient-to-b from-green-800 via-green-700 to-green-900" />
    
    {/* Trees */}
    <div className="absolute bottom-[30%] left-4 text-5xl opacity-50">🌲</div>
    <div className="absolute bottom-[35%] right-8 text-5xl opacity-50">🌲</div>
    
    {/* Cottage */}
    <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-48 h-36 bg-amber-800 rounded-lg">
      {/* Roof */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-56 h-16 bg-stone-700" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
      
      {/* Door */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-16 bg-amber-900 rounded-t-lg" />
      
      {/* Windows */}
      <div className="absolute top-8 left-4 w-8 h-8 bg-amber-400/50 rounded border-2 border-amber-600" />
      <div className="absolute top-8 right-4 w-8 h-8 bg-amber-400/50 rounded border-2 border-amber-600" />
    </div>
    
    {/* Chimney with smoke */}
    <div className="absolute bottom-[48%] left-[55%] w-6 h-10 bg-stone-600" />
    <div className="absolute bottom-[55%] left-[56%] text-lg animate-bounce" style={{ animationDuration: '3s' }}>💨</div>
    
    {/* Witch items */}
    <div className="absolute bottom-[22%] left-[25%] text-2xl">🧹</div>
    <div className="absolute bottom-[20%] right-[28%] text-xl">🫖</div>
    
    {/* Cat */}
    <div className="absolute bottom-[15%] right-[35%] text-xl">🐈‍⬛</div>
    
    {/* Garden */}
    <div className="absolute bottom-[8%] left-[30%] text-lg">🌿</div>
    <div className="absolute bottom-[5%] left-[40%] text-xl">🍄</div>
    <div className="absolute bottom-[6%] right-[35%] text-lg">🌿</div>
    
    {/* Ground */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-950 to-green-800" />
  </div>
);

// ==================== FOREST BRIDGE SCENE ====================

export const ForestBridgeScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* River valley */}
    <div className="absolute inset-0 bg-gradient-to-b from-green-700 via-green-600 to-blue-800" />
    
    {/* Trees on both sides */}
    <div className="absolute bottom-[30%] left-4 text-5xl">🌲</div>
    <div className="absolute bottom-[35%] left-16 text-4xl opacity-70">🌳</div>
    <div className="absolute bottom-[30%] right-4 text-5xl">🌲</div>
    <div className="absolute bottom-[35%] right-16 text-4xl opacity-70">🌳</div>
    
    {/* River below */}
    <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-blue-700 to-blue-500">
      {/* Water ripples */}
      <div className="absolute top-[30%] left-[20%] w-16 h-2 bg-blue-300/40 rounded-full" />
      <div className="absolute top-[50%] right-[30%] w-12 h-2 bg-blue-300/30 rounded-full" />
    </div>
    
    {/* Stone bridge */}
    <div className="absolute bottom-[25%] left-[10%] right-[10%] h-12 bg-stone-600 rounded-lg border-b-4 border-stone-700">
      <div className="absolute top-0 left-[20%] w-8 h-full bg-stone-500 rounded-t-full" />
      <div className="absolute top-0 left-[50%] -translate-x-1/2 w-8 h-full bg-stone-500 rounded-t-full" />
      <div className="absolute top-0 right-[20%] w-8 h-full bg-stone-500 rounded-t-full" />
    </div>
    
    {/* Troll under bridge hint */}
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-3xl opacity-60">👹</div>
    
    {/* Fireflies */}
    <div className="absolute top-[40%] left-[30%] w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
    <div className="absolute top-[50%] right-[35%] w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
  </div>
);

// ==================== FOREST GROVE SCENE ====================

export const ForestGroveScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Ancient grove */}
    <div className="absolute inset-0 bg-gradient-to-b from-green-900 via-green-800 to-emerald-900" />
    
    {/* Mystical light */}
    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-48 h-48 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
    
    {/* Giant ancient tree */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[70%] bg-gradient-to-t from-amber-900 to-amber-800 rounded-t-full">
      {/* Face in tree */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 text-3xl">🌳</div>
    </div>
    
    {/* Roots */}
    <div className="absolute bottom-[5%] left-[30%] w-20 h-8 bg-amber-900/70 rounded-full transform -rotate-12" />
    <div className="absolute bottom-[8%] right-[32%] w-16 h-6 bg-amber-900/70 rounded-full transform rotate-12" />
    
    {/* Surrounding trees */}
    <div className="absolute bottom-[20%] left-8 text-4xl opacity-60">🌲</div>
    <div className="absolute bottom-[25%] right-8 text-4xl opacity-60">🌲</div>
    
    {/* Mushroom ring */}
    <div className="absolute bottom-[12%] left-[25%] text-xl">🍄</div>
    <div className="absolute bottom-[8%] left-[35%] text-lg">🍄</div>
    <div className="absolute bottom-[10%] right-[30%] text-xl">🍄</div>
    <div className="absolute bottom-[6%] right-[40%] text-lg">🍄</div>
    
    {/* Fireflies around tree */}
    {[...Array(5)].map((_, i) => (
      <div key={i} className="absolute w-2 h-2 bg-green-300 rounded-full animate-ping opacity-60"
        style={{ top: `${30 + Math.random() * 30}%`, left: `${35 + Math.random() * 30}%`, animationDuration: `${2 + Math.random()}s` }} />
    ))}
    
    {/* Ground */}
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-950 to-green-900" />
  </div>
);

// ==================== FOREST CAVE SCENE ====================

export const ForestCaveScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Crystal cave */}
    <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-950" />
    
    {/* Crystal glow */}
    <div className="absolute top-[30%] left-[20%] w-32 h-32 bg-cyan-500/30 rounded-full blur-2xl" />
    <div className="absolute bottom-[40%] right-[25%] w-28 h-28 bg-purple-500/30 rounded-full blur-2xl" />
    
    {/* Cave walls */}
    <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-stone-950 to-transparent" />
    <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-stone-950 to-transparent" />
    
    {/* Crystals */}
    <div className="absolute top-[25%] left-[25%] text-4xl animate-pulse">💎</div>
    <div className="absolute top-[35%] left-[40%] text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>💎</div>
    <div className="absolute bottom-[40%] right-[30%] text-4xl animate-pulse" style={{ animationDelay: '1s' }}>💎</div>
    <div className="absolute bottom-[35%] left-[35%] text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>💠</div>
    
    {/* Stalactites */}
    <div className="absolute top-0 left-[30%] w-4 h-20 bg-gradient-to-b from-stone-600 to-purple-800 rounded-b-full" />
    <div className="absolute top-0 right-[35%] w-3 h-16 bg-gradient-to-b from-stone-600 to-purple-800 rounded-b-full" />
    
    {/* Gnome king hint */}
    <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 text-4xl">👑</div>
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-indigo-950" />
  </div>
);

export const ForestCastleScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Magical sky */}
    <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-pink-800 to-purple-600" />
    
    {/* Aurora effect */}
    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-r from-cyan-500/20 via-pink-500/30 to-purple-500/20 blur-xl" />
    
    {/* Stars */}
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          top: `${Math.random() * 50}%`,
          left: `${Math.random() * 100}%`,
          opacity: 0.5 + Math.random() * 0.5
        }}
      />
    ))}
    
    {/* Crystal castle */}
    <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-48 h-40 bg-gradient-to-t from-purple-300/60 to-cyan-200/40 backdrop-blur-sm"
      style={{ clipPath: 'polygon(20% 100%, 20% 60%, 35% 60%, 35% 30%, 50% 0%, 65% 30%, 65% 60%, 80% 60%, 80% 100%)' }}>
    </div>
    
    {/* Castle towers */}
    <div className="absolute bottom-[60%] left-[32%] w-8 h-20 bg-gradient-to-t from-purple-400/50 to-cyan-300/30" />
    <div className="absolute bottom-[55%] right-[32%] w-8 h-16 bg-gradient-to-t from-purple-400/50 to-cyan-300/30" />
    
    {/* Castle glow */}
    <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-64 h-48 bg-cyan-400/20 rounded-full blur-3xl" />
    
    {/* Rainbow bridge */}
    <div className="absolute bottom-[20%] left-[15%] w-[70%] h-6 bg-gradient-to-r from-red-400/50 via-yellow-400/50 to-purple-400/50 rounded-full" />
    
    {/* Magical elements */}
    <div className="absolute top-[20%] left-[20%] text-2xl animate-bounce" style={{ animationDuration: '3s' }}>✨</div>
    <div className="absolute top-[25%] right-[25%] text-xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🦋</div>
    <div className="absolute bottom-[35%] left-[25%] text-lg animate-pulse">💎</div>
    <div className="absolute bottom-[40%] right-[30%] text-lg animate-pulse" style={{ animationDelay: '1s' }}>💎</div>
  </div>
);

// ==================== OCEAN QUEST SCENES ====================

export const OceanShoreScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Sky */}
    <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-cyan-200" />
    
    {/* Sun */}
    <div className="absolute top-8 right-20 w-14 h-14 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50" />
    
    {/* Clouds */}
    <div className="absolute top-12 left-[20%] w-20 h-6 bg-white/80 rounded-full" />
    <div className="absolute top-16 left-[15%] w-14 h-4 bg-white/60 rounded-full" />
    
    {/* Ocean */}
    <div className="absolute bottom-[25%] left-0 right-0 h-[40%] bg-gradient-to-b from-cyan-400 to-blue-600" />
    
    {/* Waves */}
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="absolute h-4 bg-white/40 rounded-full"
        style={{
          bottom: `${35 + i * 5}%`,
          left: `${i * 15}%`,
          width: '40%',
        }}
      />
    ))}
    
    {/* Beach */}
    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-amber-200 to-amber-100" />
    
    {/* Beach items */}
    <div className="absolute bottom-[8%] left-[25%] text-2xl">🐚</div>
    <div className="absolute bottom-[5%] left-[40%] text-xl">⭐</div>
    <div className="absolute bottom-[10%] right-[20%] text-2xl">🦀</div>
    <div className="absolute bottom-[6%] right-[35%] text-xl">🐚</div>
    
    {/* Beach umbrella */}
    <div className="absolute bottom-[15%] left-[15%] text-4xl">🏖️</div>
    
    {/* Seagulls */}
    <div className="absolute top-[25%] left-[30%] text-xl">🕊️</div>
    <div className="absolute top-[20%] right-[40%] text-lg opacity-70">🕊️</div>
  </div>
);

export const OceanPalaceScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Deep ocean */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-800 via-blue-900 to-indigo-950" />
    
    {/* Light rays */}
    <div className="absolute top-0 left-[25%] w-8 h-48 bg-gradient-to-b from-cyan-300/30 to-transparent transform -rotate-12" />
    <div className="absolute top-0 right-[30%] w-6 h-40 bg-gradient-to-b from-cyan-300/20 to-transparent transform rotate-6" />
    
    {/* Palace structure */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-56 h-44 bg-gradient-to-t from-cyan-600/40 to-teal-400/30 rounded-t-3xl backdrop-blur-sm">
      {/* Windows */}
      <div className="absolute top-8 left-8 w-8 h-12 bg-cyan-300/40 rounded-t-full" />
      <div className="absolute top-8 right-8 w-8 h-12 bg-cyan-300/40 rounded-t-full" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-16 bg-cyan-300/50 rounded-t-full" />
    </div>
    
    {/* Palace towers */}
    <div className="absolute bottom-[55%] left-[30%] w-10 h-20 bg-gradient-to-t from-cyan-500/30 to-teal-300/20 rounded-t-full" />
    <div className="absolute bottom-[50%] right-[30%] w-10 h-16 bg-gradient-to-t from-cyan-500/30 to-teal-300/20 rounded-t-full" />
    
    {/* Coral decorations */}
    <div className="absolute bottom-[15%] left-8 text-3xl">🪸</div>
    <div className="absolute bottom-[18%] right-12 text-2xl">🪸</div>
    
    {/* Sea creatures */}
    <div className="absolute top-[30%] left-[15%] text-2xl animate-bounce" style={{ animationDuration: '4s' }}>🐠</div>
    <div className="absolute top-[40%] right-[20%] text-xl animate-bounce" style={{ animationDuration: '3.5s' }}>🐡</div>
    <div className="absolute bottom-[40%] left-[20%] text-lg">🦑</div>
    
    {/* Bubbles */}
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full border border-white/30 bg-white/10"
        style={{
          width: `${4 + Math.random() * 8}px`,
          height: `${4 + Math.random() * 8}px`,
          bottom: `${Math.random() * 60}%`,
          left: `${Math.random() * 100}%`,
        }}
      />
    ))}
    
    {/* Mermaid hint */}
    <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 text-4xl">🧜‍♀️</div>
  </div>
);

// ==================== OCEAN REEF SCENE ====================

export const OceanReefScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Underwater */}
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500 via-blue-600 to-blue-800" />
    
    {/* Light rays */}
    <div className="absolute top-0 left-[20%] w-8 h-48 bg-gradient-to-b from-cyan-200/40 to-transparent transform -rotate-12" />
    <div className="absolute top-0 right-[25%] w-10 h-56 bg-gradient-to-b from-cyan-200/30 to-transparent transform rotate-6" />
    
    {/* Coral reef */}
    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-900 to-transparent">
      <div className="absolute bottom-4 left-[15%] text-4xl">🪸</div>
      <div className="absolute bottom-8 left-[30%] text-3xl">🪸</div>
      <div className="absolute bottom-2 left-[50%] text-4xl">🪸</div>
      <div className="absolute bottom-6 right-[25%] text-3xl">🪸</div>
      <div className="absolute bottom-4 right-[10%] text-4xl">🪸</div>
    </div>
    
    {/* Colorful fish */}
    <div className="absolute top-[30%] left-[20%] text-2xl animate-bounce" style={{ animationDuration: '3s' }}>🐠</div>
    <div className="absolute top-[40%] right-[25%] text-xl animate-bounce" style={{ animationDuration: '2.5s' }}>🐡</div>
    <div className="absolute top-[35%] left-[50%] text-lg animate-bounce" style={{ animationDuration: '3.5s' }}>🐟</div>
    <div className="absolute bottom-[40%] left-[35%] text-xl">🦀</div>
    
    {/* Sea turtle */}
    <div className="absolute top-[45%] right-[40%] text-4xl">🐢</div>
    
    {/* Bubbles */}
    {[...Array(8)].map((_, i) => (
      <div key={i} className="absolute rounded-full border border-white/40 bg-white/10"
        style={{ width: `${6 + Math.random() * 10}px`, height: `${6 + Math.random() * 10}px`, bottom: `${Math.random() * 70}%`, left: `${Math.random() * 100}%` }} />
    ))}
  </div>
);

// ==================== OCEAN SHIPWRECK SCENE ====================

export const OceanShipwreckScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Deep murky water */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-800 via-slate-800 to-slate-950" />
    
    {/* Dim light */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-48 bg-gradient-to-b from-blue-400/20 to-transparent" />
    
    {/* Shipwreck */}
    <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-56 h-32 bg-amber-900/60 rounded-lg transform -rotate-12">
      {/* Mast */}
      <div className="absolute -top-16 left-[40%] w-4 h-20 bg-amber-800/80" />
      {/* Torn sail */}
      <div className="absolute -top-12 left-[42%] w-12 h-10 bg-slate-400/40" style={{ clipPath: 'polygon(0 0, 100% 30%, 80% 100%, 0 80%)' }} />
    </div>
    
    {/* Treasure spilling out */}
    <div className="absolute bottom-[12%] left-[35%] text-xl">💰</div>
    <div className="absolute bottom-[8%] left-[45%] text-lg">🪙</div>
    <div className="absolute bottom-[10%] right-[40%] text-xl">💎</div>
    
    {/* Ghost captain */}
    <div className="absolute bottom-[30%] right-[25%] text-3xl opacity-50 animate-pulse" style={{ animationDuration: '4s' }}>👻</div>
    
    {/* Sea creatures */}
    <div className="absolute top-[35%] left-[20%] text-2xl">🦈</div>
    <div className="absolute bottom-[35%] right-[15%] text-xl">🐙</div>
    
    {/* Seaweed */}
    <div className="absolute bottom-0 left-[20%] w-4 h-24 bg-gradient-to-t from-green-900 to-green-700/50 rounded-t-full" />
    <div className="absolute bottom-0 right-[25%] w-3 h-20 bg-gradient-to-t from-green-900 to-green-700/50 rounded-t-full" />
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-slate-900" />
  </div>
);

// ==================== OCEAN TRENCH SCENE ====================

export const OceanTrenchScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Abyssal depths */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-slate-950 to-black" />
    
    {/* Bioluminescence */}
    <div className="absolute top-[30%] left-[25%] w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
    <div className="absolute bottom-[40%] right-[30%] w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
    
    {/* Trench walls */}
    <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-slate-950 to-transparent" />
    <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-slate-950 to-transparent" />
    
    {/* Bioluminescent creatures */}
    <div className="absolute top-[25%] left-[30%] text-2xl animate-pulse">🦑</div>
    <div className="absolute top-[45%] right-[35%] text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>🐙</div>
    
    {/* Angler fish */}
    <div className="absolute bottom-[35%] left-[40%] text-3xl">🐟</div>
    
    {/* Deep sea vents */}
    <div className="absolute bottom-0 left-[35%] w-8 h-16 bg-orange-900/40 rounded-t-full" />
    <div className="absolute bottom-[8%] left-[36%] text-lg animate-bounce" style={{ animationDuration: '2s' }}>💨</div>
    
    {/* Glowing particles */}
    {[...Array(12)].map((_, i) => (
      <div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-50"
        style={{ top: `${Math.random() * 80}%`, left: `${20 + Math.random() * 60}%`, animationDuration: `${2 + Math.random() * 2}s` }} />
    ))}
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black to-slate-950" />
  </div>
);

// ==================== OCEAN CAVES SCENE ====================

export const OceanCavesScene = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Underwater cave */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950" />
    
    {/* Light from entrance */}
    <div className="absolute top-[20%] left-[15%] w-32 h-40 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-full blur-xl" />
    
    {/* Cave walls */}
    <div className="absolute top-0 left-0 w-28 h-full bg-gradient-to-r from-stone-950 to-transparent" />
    <div className="absolute top-0 right-0 w-28 h-full bg-gradient-to-l from-stone-950 to-transparent" />
    
    {/* Stalactites */}
    <div className="absolute top-0 left-[25%] w-5 h-24 bg-gradient-to-b from-stone-700 to-stone-800 rounded-b-full" />
    <div className="absolute top-0 left-[50%] w-4 h-20 bg-gradient-to-b from-stone-700 to-stone-800 rounded-b-full" />
    <div className="absolute top-0 right-[30%] w-6 h-28 bg-gradient-to-b from-stone-700 to-stone-800 rounded-b-full" />
    
    {/* Octopus sage */}
    <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 text-5xl">🐙</div>
    
    {/* Glowing shells/pearls */}
    <div className="absolute bottom-[20%] left-[25%] text-2xl animate-pulse">🐚</div>
    <div className="absolute bottom-[15%] right-[30%] text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>🦪</div>
    
    {/* Treasure hint */}
    <div className="absolute bottom-[25%] right-[20%] text-lg">💎</div>
    
    {/* Bubbles */}
    {[...Array(6)].map((_, i) => (
      <div key={i} className="absolute rounded-full border border-white/30 bg-white/10"
        style={{ width: `${4 + Math.random() * 8}px`, height: `${4 + Math.random() * 8}px`, bottom: `${20 + Math.random() * 50}%`, left: `${30 + Math.random() * 40}%` }} />
    ))}
    
    {/* Floor */}
    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-950 to-slate-900" />
  </div>
);

// ==================== SCENE SELECTOR ====================

export const getAdventureScene = (worldId, sceneId) => {
  const sceneMap = {
    pirate_voyage: {
      beach: PirateBeachScene,
      jungle: PirateJungleScene,
      waterfall: PirateWaterfallScene,
      cave: PirateCaveScene,
      underground: PirateUndergroundScene,
      temple: PirateTempleScene,
      treasure: PirateTreasureScene,
    },
    mystery_mansion: {
      entrance: MansionEntranceScene,
      library: MansionLibraryScene,
      kitchen: MansionKitchenScene,
      gallery: MansionGalleryScene,
      basement: MansionBasementScene,
      attic: MansionAtticScene,
      secret: MansionSecretScene,
    },
    space_mission: {
      launchpad: SpaceLaunchScene,
      bridge: SpaceBridgeScene,
      engine: SpaceBridgeScene,
      asteroid: SpacePlanetScene,
      station: SpaceBridgeScene,
      nebula: SpacePlanetScene,
      planet: SpacePlanetScene,
    },
    ancient_egypt: {
      oasis: EgyptOasisScene,
      entrance: EgyptEntranceScene,
      hieroglyphs: EgyptHieroglyphsScene,
      traps: EgyptTrapsScene,
      burial: EgyptBurialScene,
      treasury: EgyptTreasuryScene,
      throne: EgyptThroneScene,
    },
    enchanted_forest: {
      edge: ForestEdgeScene,
      glade: ForestGladeScene,
      cottage: ForestCottageScene,
      bridge: ForestBridgeScene,
      grove: ForestGroveScene,
      cave: ForestCaveScene,
      castle: ForestCastleScene,
    },
    ocean_quest: {
      shore: OceanShoreScene,
      shallows: OceanReefScene,
      reef: OceanReefScene,
      shipwreck: OceanShipwreckScene,
      trench: OceanTrenchScene,
      caves: OceanCavesScene,
      palace: OceanPalaceScene,
    }
  };
  
  return sceneMap[worldId]?.[sceneId] || PirateBeachScene;
};

export default {
  // Pirate
  PirateBeachScene,
  PirateJungleScene,
  PirateWaterfallScene,
  PirateCaveScene,
  PirateUndergroundScene,
  PirateTempleScene,
  PirateTreasureScene,
  // Space
  SpaceLaunchScene,
  SpaceBridgeScene,
  SpacePlanetScene,
  // Mansion
  MansionEntranceScene,
  MansionLibraryScene,
  MansionKitchenScene,
  MansionGalleryScene,
  MansionBasementScene,
  MansionAtticScene,
  MansionSecretScene,
  // Egypt
  EgyptOasisScene,
  EgyptEntranceScene,
  EgyptHieroglyphsScene,
  EgyptTrapsScene,
  EgyptBurialScene,
  EgyptTreasuryScene,
  EgyptThroneScene,
  // Forest
  ForestEdgeScene,
  ForestGladeScene,
  ForestCottageScene,
  ForestBridgeScene,
  ForestGroveScene,
  ForestCaveScene,
  ForestCastleScene,
  // Ocean
  OceanShoreScene,
  OceanReefScene,
  OceanShipwreckScene,
  OceanTrenchScene,
  OceanCavesScene,
  OceanPalaceScene,
  // Utility
  getAdventureScene
};
