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

// ==================== SCENE SELECTOR ====================

export const getAdventureScene = (worldId, sceneId) => {
  const sceneMap = {
    pirate_voyage: {
      beach: PirateBeachScene,
      jungle: PirateJungleScene,
      waterfall: PirateJungleScene,
      cave: PirateCaveScene,
      underground: PirateCaveScene,
      temple: PirateCaveScene,
      treasure: PirateTreasureScene,
    },
    mystery_mansion: {
      entrance: MansionEntranceScene,
      library: MansionLibraryScene,
      kitchen: MansionLibraryScene,
      gallery: MansionLibraryScene,
      basement: MansionEntranceScene,
      attic: MansionLibraryScene,
      secret: PirateTreasureScene,
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
      oasis: PirateBeachScene,
      entrance: MansionEntranceScene,
      hieroglyphs: MansionLibraryScene,
      traps: PirateCaveScene,
      burial: PirateCaveScene,
      treasury: PirateTreasureScene,
      throne: PirateTreasureScene,
    },
    enchanted_forest: {
      edge: ForestEdgeScene,
      glade: ForestEdgeScene,
      cottage: MansionLibraryScene,
      bridge: ForestEdgeScene,
      grove: ForestEdgeScene,
      cave: PirateCaveScene,
      castle: ForestCastleScene,
    },
    ocean_quest: {
      shore: OceanShoreScene,
      shallows: OceanPalaceScene,
      reef: OceanPalaceScene,
      shipwreck: PirateCaveScene,
      trench: OceanPalaceScene,
      caves: PirateCaveScene,
      palace: OceanPalaceScene,
    }
  };
  
  return sceneMap[worldId]?.[sceneId] || PirateBeachScene;
};

export default {
  PirateBeachScene,
  PirateJungleScene,
  PirateCaveScene,
  PirateTreasureScene,
  SpaceLaunchScene,
  SpaceBridgeScene,
  SpacePlanetScene,
  MansionEntranceScene,
  MansionLibraryScene,
  ForestEdgeScene,
  ForestCastleScene,
  OceanShoreScene,
  OceanPalaceScene,
  getAdventureScene
};
