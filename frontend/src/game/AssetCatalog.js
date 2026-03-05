/**
 * Game Asset Catalog - Comprehensive theme and asset library
 * 
 * FREE TIER: Pre-made assets from catalog
 * PREMIUM TIER (future): AI-generated custom assets
 */

// ==================== THEME DEFINITIONS ====================

export const THEMES = {
  // Fantasy Themes
  fantasy_forest: {
    id: 'fantasy_forest',
    name: 'Enchanted Forest',
    category: 'fantasy',
    description: 'Mystical woodland with ancient magic',
    colors: { primary: '#2d5a27', secondary: '#8b4513', accent: '#ffd700' },
    free: true
  },
  fantasy_castle: {
    id: 'fantasy_castle',
    name: 'Dark Castle',
    category: 'fantasy',
    description: 'Gothic fortress of shadows',
    colors: { primary: '#1a1a2e', secondary: '#4a0e0e', accent: '#c0c0c0' },
    free: true
  },
  fantasy_dragon_lair: {
    id: 'fantasy_dragon_lair',
    name: "Dragon's Lair",
    category: 'fantasy',
    description: 'Volcanic cave filled with treasure',
    colors: { primary: '#8b0000', secondary: '#ff4500', accent: '#ffd700' },
    free: true
  },

  // Space Themes
  space_station: {
    id: 'space_station',
    name: 'Space Station',
    category: 'space',
    description: 'Futuristic orbital battle arena',
    colors: { primary: '#0a0a23', secondary: '#1e3a5f', accent: '#00ffff' },
    free: true
  },
  space_alien_planet: {
    id: 'space_alien_planet',
    name: 'Alien Planet',
    category: 'space',
    description: 'Strange world with twin suns',
    colors: { primary: '#2d1b4e', secondary: '#ff6b35', accent: '#7fff00' },
    free: true
  },
  space_asteroid: {
    id: 'space_asteroid',
    name: 'Asteroid Field',
    category: 'space',
    description: 'Dangerous space rocks',
    colors: { primary: '#0d0d0d', secondary: '#4a4a4a', accent: '#87ceeb' },
    free: true
  },

  // Ocean Themes
  ocean_depths: {
    id: 'ocean_depths',
    name: 'Ocean Depths',
    category: 'ocean',
    description: 'Deep underwater realm',
    colors: { primary: '#001f3f', secondary: '#0074d9', accent: '#7fdbff' },
    free: true
  },
  ocean_coral_reef: {
    id: 'ocean_coral_reef',
    name: 'Coral Kingdom',
    category: 'ocean',
    description: 'Vibrant reef ecosystem',
    colors: { primary: '#006994', secondary: '#ff6b6b', accent: '#ffeaa7' },
    free: true
  },
  ocean_shipwreck: {
    id: 'ocean_shipwreck',
    name: 'Sunken Ship',
    category: 'ocean',
    description: 'Haunted underwater wreckage',
    colors: { primary: '#1a3a3a', secondary: '#8b4513', accent: '#daa520' },
    free: true
  },

  // Prehistoric Themes
  prehistoric_jungle: {
    id: 'prehistoric_jungle',
    name: 'Dino Jungle',
    category: 'prehistoric',
    description: 'Primeval forest with dinosaurs',
    colors: { primary: '#228b22', secondary: '#8b4513', accent: '#ff6347' },
    free: true
  },
  prehistoric_volcano: {
    id: 'prehistoric_volcano',
    name: 'Volcanic Wasteland',
    category: 'prehistoric',
    description: 'Erupting prehistoric landscape',
    colors: { primary: '#2f2f2f', secondary: '#ff4500', accent: '#ffa500' },
    free: true
  },

  // Mythology Themes
  myth_olympus: {
    id: 'myth_olympus',
    name: 'Mount Olympus',
    category: 'mythology',
    description: 'Home of the Greek gods',
    colors: { primary: '#f5f5dc', secondary: '#daa520', accent: '#4169e1' },
    free: true
  },
  myth_underworld: {
    id: 'myth_underworld',
    name: 'The Underworld',
    category: 'mythology',
    description: 'Realm of Hades',
    colors: { primary: '#1a0a2e', secondary: '#800080', accent: '#00ff00' },
    free: true
  },
  myth_norse: {
    id: 'myth_norse',
    name: 'Asgard',
    category: 'mythology',
    description: 'Realm of Norse gods',
    colors: { primary: '#1e3d59', secondary: '#c0c0c0', accent: '#ffd700' },
    free: true
  },

  // Science Themes
  science_lab: {
    id: 'science_lab',
    name: 'Mad Science Lab',
    category: 'science',
    description: 'Bubbling potions and experiments',
    colors: { primary: '#2d2d2d', secondary: '#00ff00', accent: '#ff00ff' },
    free: true
  },
  science_cyber: {
    id: 'science_cyber',
    name: 'Cyber Grid',
    category: 'science',
    description: 'Digital virtual world',
    colors: { primary: '#0a0a0a', secondary: '#00ffff', accent: '#ff00ff' },
    free: true
  },

  // Nature Themes
  nature_arctic: {
    id: 'nature_arctic',
    name: 'Frozen Tundra',
    category: 'nature',
    description: 'Icy northern wilderness',
    colors: { primary: '#e8f4f8', secondary: '#87ceeb', accent: '#4169e1' },
    free: true
  },
  nature_desert: {
    id: 'nature_desert',
    name: 'Ancient Desert',
    category: 'nature',
    description: 'Pyramids and sand dunes',
    colors: { primary: '#c2b280', secondary: '#daa520', accent: '#8b4513' },
    free: true
  },
  nature_storm: {
    id: 'nature_storm',
    name: 'Storm Peak',
    category: 'nature',
    description: 'Mountain summit in a thunderstorm',
    colors: { primary: '#2f4f4f', secondary: '#4682b4', accent: '#ffff00' },
    free: true
  },

  // Spooky Themes
  spooky_haunted: {
    id: 'spooky_haunted',
    name: 'Haunted Mansion',
    category: 'spooky',
    description: 'Creepy abandoned house',
    colors: { primary: '#1a1a1a', secondary: '#4a0080', accent: '#00ff00' },
    free: true
  },
  spooky_graveyard: {
    id: 'spooky_graveyard',
    name: 'Midnight Graveyard',
    category: 'spooky',
    description: 'Foggy cemetery at night',
    colors: { primary: '#0d0d0d', secondary: '#483d8b', accent: '#b0c4de' },
    free: true
  }
};

// ==================== PLAYER CHARACTERS ====================

export const PLAYER_CHARACTERS = {
  // Warriors
  knight: {
    id: 'knight',
    name: 'Noble Knight',
    category: 'warrior',
    icon: '⚔️',
    description: 'Brave armored warrior',
    attackStyle: 'slash',
    compatibleThemes: ['fantasy', 'mythology'],
    free: true
  },
  samurai: {
    id: 'samurai',
    name: 'Shadow Samurai',
    category: 'warrior',
    icon: '🗡️',
    description: 'Swift blade master',
    attackStyle: 'slash',
    compatibleThemes: ['fantasy'],
    free: true
  },
  viking: {
    id: 'viking',
    name: 'Viking Raider',
    category: 'warrior',
    icon: '🪓',
    description: 'Fierce Norse warrior',
    attackStyle: 'smash',
    compatibleThemes: ['fantasy', 'mythology', 'nature'],
    free: true
  },

  // Mages
  wizard: {
    id: 'wizard',
    name: 'Arcane Wizard',
    category: 'mage',
    icon: '🧙',
    description: 'Master of arcane arts',
    attackStyle: 'magic',
    compatibleThemes: ['fantasy', 'mythology'],
    free: true
  },
  necromancer: {
    id: 'necromancer',
    name: 'Dark Necromancer',
    category: 'mage',
    icon: '💀',
    description: 'Controller of the undead',
    attackStyle: 'dark_magic',
    compatibleThemes: ['fantasy', 'spooky'],
    free: true
  },

  // Space Heroes
  astronaut: {
    id: 'astronaut',
    name: 'Space Explorer',
    category: 'space',
    icon: '👨‍🚀',
    description: 'Brave space adventurer',
    attackStyle: 'laser',
    compatibleThemes: ['space', 'science'],
    free: true
  },
  alien_hero: {
    id: 'alien_hero',
    name: 'Friendly Alien',
    category: 'space',
    icon: '👽',
    description: 'Otherworldly ally',
    attackStyle: 'beam',
    compatibleThemes: ['space'],
    free: true
  },
  robot: {
    id: 'robot',
    name: 'Battle Bot',
    category: 'space',
    icon: '🤖',
    description: 'Advanced combat droid',
    attackStyle: 'laser',
    compatibleThemes: ['space', 'science'],
    free: true
  },

  // Ocean Heroes
  diver: {
    id: 'diver',
    name: 'Deep Sea Diver',
    category: 'ocean',
    icon: '🤿',
    description: 'Ocean explorer',
    attackStyle: 'harpoon',
    compatibleThemes: ['ocean'],
    free: true
  },
  mermaid: {
    id: 'mermaid',
    name: 'Mermaid Warrior',
    category: 'ocean',
    icon: '🧜',
    description: 'Guardian of the seas',
    attackStyle: 'water_magic',
    compatibleThemes: ['ocean', 'mythology'],
    free: true
  },

  // Nature Heroes
  ranger: {
    id: 'ranger',
    name: 'Forest Ranger',
    category: 'nature',
    icon: '🏹',
    description: 'Expert archer and tracker',
    attackStyle: 'arrow',
    compatibleThemes: ['nature', 'fantasy', 'prehistoric'],
    free: true
  },
  explorer: {
    id: 'explorer',
    name: 'Brave Explorer',
    category: 'nature',
    icon: '🧭',
    description: 'Fearless adventurer',
    attackStyle: 'whip',
    compatibleThemes: ['nature', 'prehistoric'],
    free: true
  },

  // Science Heroes
  scientist: {
    id: 'scientist',
    name: 'Mad Scientist',
    category: 'science',
    icon: '🥼',
    description: 'Genius inventor',
    attackStyle: 'invention',
    compatibleThemes: ['science'],
    free: true
  },
  cyborg: {
    id: 'cyborg',
    name: 'Cyber Warrior',
    category: 'science',
    icon: '🦾',
    description: 'Half human, half machine',
    attackStyle: 'tech',
    compatibleThemes: ['science', 'space'],
    free: true
  },

  // Mythological Heroes
  greek_hero: {
    id: 'greek_hero',
    name: 'Greek Champion',
    category: 'mythology',
    icon: '🏛️',
    description: 'Blessed by the gods',
    attackStyle: 'lightning',
    compatibleThemes: ['mythology'],
    free: true
  },
  pharaoh: {
    id: 'pharaoh',
    name: 'Pharaoh',
    category: 'mythology',
    icon: '👑',
    description: 'Ancient Egyptian ruler',
    attackStyle: 'sand_magic',
    compatibleThemes: ['mythology', 'nature'],
    free: true
  }
};

// ==================== ENEMY TYPES ====================

export const ENEMIES = {
  // Fantasy Enemies
  goblin: {
    id: 'goblin',
    name: 'Sneaky Goblin',
    category: 'fantasy',
    icon: '👺',
    description: 'Small but cunning',
    difficulty: 'easy',
    health: 60,
    tauntStyle: 'mocking',
    compatibleThemes: ['fantasy'],
    free: true
  },
  orc: {
    id: 'orc',
    name: 'Brutal Orc',
    category: 'fantasy',
    icon: '👹',
    description: 'Strong and aggressive',
    difficulty: 'medium',
    health: 100,
    tauntStyle: 'aggressive',
    compatibleThemes: ['fantasy'],
    free: true
  },
  dragon: {
    id: 'dragon',
    name: 'Ancient Dragon',
    category: 'fantasy',
    icon: '🐉',
    description: 'Fire-breathing terror',
    difficulty: 'hard',
    health: 150,
    tauntStyle: 'arrogant',
    compatibleThemes: ['fantasy'],
    free: true
  },
  dark_wizard: {
    id: 'dark_wizard',
    name: 'Dark Sorcerer',
    category: 'fantasy',
    icon: '🧙‍♂️',
    description: 'Master of dark magic',
    difficulty: 'hard',
    health: 120,
    tauntStyle: 'mysterious',
    compatibleThemes: ['fantasy', 'spooky'],
    free: true
  },

  // Space Enemies
  alien_grunt: {
    id: 'alien_grunt',
    name: 'Alien Scout',
    category: 'space',
    icon: '👾',
    description: 'Basic alien invader',
    difficulty: 'easy',
    health: 60,
    tauntStyle: 'robotic',
    compatibleThemes: ['space'],
    free: true
  },
  alien_commander: {
    id: 'alien_commander',
    name: 'Alien Commander',
    category: 'space',
    icon: '🛸',
    description: 'Leader of the invasion',
    difficulty: 'medium',
    health: 100,
    tauntStyle: 'commanding',
    compatibleThemes: ['space'],
    free: true
  },
  space_kraken: {
    id: 'space_kraken',
    name: 'Cosmic Horror',
    category: 'space',
    icon: '🦑',
    description: 'Tentacled space monster',
    difficulty: 'hard',
    health: 150,
    tauntStyle: 'eldritch',
    compatibleThemes: ['space'],
    free: true
  },
  rogue_ai: {
    id: 'rogue_ai',
    name: 'Rogue A.I.',
    category: 'space',
    icon: '🖥️',
    description: 'Corrupted machine intelligence',
    difficulty: 'hard',
    health: 130,
    tauntStyle: 'cold',
    compatibleThemes: ['space', 'science'],
    free: true
  },

  // Ocean Enemies
  shark: {
    id: 'shark',
    name: 'Great White',
    category: 'ocean',
    icon: '🦈',
    description: 'Apex predator',
    difficulty: 'medium',
    health: 90,
    tauntStyle: 'predatory',
    compatibleThemes: ['ocean'],
    free: true
  },
  giant_squid: {
    id: 'giant_squid',
    name: 'Giant Squid',
    category: 'ocean',
    icon: '🦑',
    description: 'Deep sea terror',
    difficulty: 'hard',
    health: 120,
    tauntStyle: 'mysterious',
    compatibleThemes: ['ocean'],
    free: true
  },
  sea_serpent: {
    id: 'sea_serpent',
    name: 'Sea Serpent',
    category: 'ocean',
    icon: '🐍',
    description: 'Legendary ocean monster',
    difficulty: 'hard',
    health: 140,
    tauntStyle: 'ancient',
    compatibleThemes: ['ocean', 'mythology'],
    free: true
  },

  // Prehistoric Enemies
  trex: {
    id: 'trex',
    name: 'T-Rex',
    category: 'prehistoric',
    icon: '🦖',
    description: 'King of dinosaurs',
    difficulty: 'hard',
    health: 150,
    tauntStyle: 'roaring',
    compatibleThemes: ['prehistoric'],
    free: true
  },
  raptor: {
    id: 'raptor',
    name: 'Velociraptor',
    category: 'prehistoric',
    icon: '🦕',
    description: 'Clever hunter',
    difficulty: 'medium',
    health: 80,
    tauntStyle: 'cunning',
    compatibleThemes: ['prehistoric'],
    free: true
  },
  pterodactyl: {
    id: 'pterodactyl',
    name: 'Pterodactyl',
    category: 'prehistoric',
    icon: '🦅',
    description: 'Flying terror',
    difficulty: 'medium',
    health: 70,
    tauntStyle: 'screeching',
    compatibleThemes: ['prehistoric'],
    free: true
  },

  // Mythology Enemies
  minotaur: {
    id: 'minotaur',
    name: 'Minotaur',
    category: 'mythology',
    icon: '🐂',
    description: 'Bull-headed beast',
    difficulty: 'hard',
    health: 130,
    tauntStyle: 'raging',
    compatibleThemes: ['mythology'],
    free: true
  },
  medusa: {
    id: 'medusa',
    name: 'Medusa',
    category: 'mythology',
    icon: '🐍',
    description: 'Stone-gazing gorgon',
    difficulty: 'hard',
    health: 110,
    tauntStyle: 'seductive',
    compatibleThemes: ['mythology'],
    free: true
  },
  cerberus: {
    id: 'cerberus',
    name: 'Cerberus',
    category: 'mythology',
    icon: '🐕',
    description: 'Three-headed hellhound',
    difficulty: 'hard',
    health: 150,
    tauntStyle: 'growling',
    compatibleThemes: ['mythology', 'spooky'],
    free: true
  },
  cyclops: {
    id: 'cyclops',
    name: 'Cyclops',
    category: 'mythology',
    icon: '👁️',
    description: 'One-eyed giant',
    difficulty: 'medium',
    health: 120,
    tauntStyle: 'brutish',
    compatibleThemes: ['mythology'],
    free: true
  },

  // Science Enemies
  mutant: {
    id: 'mutant',
    name: 'Lab Mutant',
    category: 'science',
    icon: '🧟',
    description: 'Failed experiment',
    difficulty: 'medium',
    health: 90,
    tauntStyle: 'groaning',
    compatibleThemes: ['science'],
    free: true
  },
  evil_robot: {
    id: 'evil_robot',
    name: 'Evil Robot',
    category: 'science',
    icon: '🤖',
    description: 'Malfunctioning machine',
    difficulty: 'medium',
    health: 100,
    tauntStyle: 'mechanical',
    compatibleThemes: ['science', 'space'],
    free: true
  },
  virus: {
    id: 'virus',
    name: 'Mega Virus',
    category: 'science',
    icon: '🦠',
    description: 'Digital infection',
    difficulty: 'hard',
    health: 80,
    tauntStyle: 'corrupting',
    compatibleThemes: ['science'],
    free: true
  },

  // Spooky Enemies
  ghost: {
    id: 'ghost',
    name: 'Vengeful Spirit',
    category: 'spooky',
    icon: '👻',
    description: 'Haunting presence',
    difficulty: 'medium',
    health: 80,
    tauntStyle: 'eerie',
    compatibleThemes: ['spooky'],
    free: true
  },
  vampire: {
    id: 'vampire',
    name: 'Vampire Lord',
    category: 'spooky',
    icon: '🧛',
    description: 'Ancient bloodsucker',
    difficulty: 'hard',
    health: 120,
    tauntStyle: 'aristocratic',
    compatibleThemes: ['spooky'],
    free: true
  },
  werewolf: {
    id: 'werewolf',
    name: 'Werewolf',
    category: 'spooky',
    icon: '🐺',
    description: 'Cursed shapeshifter',
    difficulty: 'medium',
    health: 100,
    tauntStyle: 'howling',
    compatibleThemes: ['spooky', 'nature'],
    free: true
  },
  skeleton_king: {
    id: 'skeleton_king',
    name: 'Skeleton King',
    category: 'spooky',
    icon: '💀',
    description: 'Undead ruler',
    difficulty: 'hard',
    health: 140,
    tauntStyle: 'regal',
    compatibleThemes: ['spooky', 'fantasy'],
    free: true
  },

  // Nature Enemies
  giant_spider: {
    id: 'giant_spider',
    name: 'Giant Spider',
    category: 'nature',
    icon: '🕷️',
    description: 'Eight-legged nightmare',
    difficulty: 'medium',
    health: 90,
    tauntStyle: 'hissing',
    compatibleThemes: ['nature', 'spooky'],
    free: true
  },
  bear: {
    id: 'bear',
    name: 'Grizzly Bear',
    category: 'nature',
    icon: '🐻',
    description: 'Territorial beast',
    difficulty: 'medium',
    health: 110,
    tauntStyle: 'growling',
    compatibleThemes: ['nature'],
    free: true
  },
  yeti: {
    id: 'yeti',
    name: 'Yeti',
    category: 'nature',
    icon: '🦍',
    description: 'Abominable snowman',
    difficulty: 'hard',
    health: 130,
    tauntStyle: 'roaring',
    compatibleThemes: ['nature'],
    free: true
  }
};

// ==================== ATTACK ANIMATIONS ====================

export const ATTACK_STYLES = {
  slash: {
    id: 'slash',
    name: 'Sword Slash',
    animation: 'slash-right',
    hitEffect: 'spark',
    color: '#silver'
  },
  smash: {
    id: 'smash',
    name: 'Heavy Smash',
    animation: 'shake-heavy',
    hitEffect: 'impact',
    color: '#orange'
  },
  magic: {
    id: 'magic',
    name: 'Magic Blast',
    animation: 'pulse-glow',
    hitEffect: 'sparkle',
    color: '#purple'
  },
  dark_magic: {
    id: 'dark_magic',
    name: 'Dark Spell',
    animation: 'pulse-dark',
    hitEffect: 'smoke',
    color: '#darkpurple'
  },
  laser: {
    id: 'laser',
    name: 'Laser Beam',
    animation: 'beam-horizontal',
    hitEffect: 'electric',
    color: '#cyan'
  },
  beam: {
    id: 'beam',
    name: 'Energy Beam',
    animation: 'beam-pulse',
    hitEffect: 'glow',
    color: '#green'
  },
  harpoon: {
    id: 'harpoon',
    name: 'Harpoon Strike',
    animation: 'thrust-forward',
    hitEffect: 'pierce',
    color: '#silver'
  },
  water_magic: {
    id: 'water_magic',
    name: 'Water Surge',
    animation: 'wave-motion',
    hitEffect: 'splash',
    color: '#blue'
  },
  arrow: {
    id: 'arrow',
    name: 'Arrow Shot',
    animation: 'projectile-arc',
    hitEffect: 'pierce',
    color: '#brown'
  },
  whip: {
    id: 'whip',
    name: 'Whip Crack',
    animation: 'whip-snap',
    hitEffect: 'crack',
    color: '#brown'
  },
  invention: {
    id: 'invention',
    name: 'Gadget Attack',
    animation: 'random-effect',
    hitEffect: 'explosion',
    color: '#yellow'
  },
  tech: {
    id: 'tech',
    name: 'Tech Strike',
    animation: 'circuit-glow',
    hitEffect: 'electric',
    color: '#cyan'
  },
  lightning: {
    id: 'lightning',
    name: 'Lightning Bolt',
    animation: 'bolt-strike',
    hitEffect: 'electric',
    color: '#yellow'
  },
  sand_magic: {
    id: 'sand_magic',
    name: 'Sand Storm',
    animation: 'swirl-particles',
    hitEffect: 'dust',
    color: '#tan'
  }
};

// ==================== TAUNT TEMPLATES ====================

export const TAUNT_TEMPLATES = {
  mocking: [
    "Ha! Is that the best you've got?",
    "Too slow, little hero!",
    "You call that an attack?",
    "My grandmother hits harder!"
  ],
  aggressive: [
    "I'll crush you!",
    "Prepare to be destroyed!",
    "You dare challenge ME?",
    "Your bones will decorate my lair!"
  ],
  arrogant: [
    "Foolish mortal...",
    "You are beneath me.",
    "I've slain thousands like you.",
    "Bow before your superior!"
  ],
  mysterious: [
    "The shadows consume all...",
    "You cannot comprehend my power.",
    "Darkness awaits you...",
    "Your fate was sealed long ago."
  ],
  robotic: [
    "TARGET ACQUIRED.",
    "RESISTANCE IS FUTILE.",
    "CALCULATING DESTRUCTION...",
    "ERROR: MERCY NOT FOUND."
  ],
  commanding: [
    "Surrender, earthling!",
    "Your planet belongs to us!",
    "The invasion cannot be stopped!",
    "Submit to the hive mind!"
  ],
  eldritch: [
    "̷̯̈́Y̶͎͝o̵̺͒u̸̳͝ ̵̣̈́c̶̣̒a̴͖͝n̷̨̂n̵̲̐ö̸̳́t̸̰̊ ̶̳̐c̵̣͋o̷̰̿m̶̭̂p̷͓̈́r̸̨̈́ė̸̯h̷͙̄e̷̬͊n̸̬̐d̸̨͠...",
    "Stars die... so will you.",
    "I have seen eternities...",
    "Your mind fractures before me."
  ],
  cold: [
    "ILLOGICAL RESISTANCE DETECTED.",
    "YOUR SURVIVAL PROBABILITY: 0%",
    "EMOTIONAL WEAKNESS IDENTIFIED.",
    "TERMINATION SEQUENCE INITIATED."
  ],
  predatory: [
    "*circles menacingly*",
    "I can smell your fear...",
    "Fresh meat...",
    "The hunt ends here."
  ],
  ancient: [
    "I have slumbered for eons...",
    "You wake forces beyond your understanding.",
    "The deep remembers all...",
    "Time means nothing to me."
  ],
  roaring: [
    "ROOOOAAAR!",
    "*earth-shaking stomp*",
    "GRAAAHHH!",
    "*deafening roar*"
  ],
  cunning: [
    "*clicks and chirps intelligently*",
    "We hunt in packs...",
    "Clever... but not clever enough.",
    "*taps claw thoughtfully*"
  ],
  screeching: [
    "SCREEEECH!",
    "*swoops menacingly*",
    "*piercing cry*",
    "The skies belong to ME!"
  ],
  raging: [
    "NONE SHALL PASS!",
    "*snorts furiously*",
    "THE LABYRINTH CLAIMS ANOTHER!",
    "*stamps hooves*"
  ],
  seductive: [
    "Look into my eyes...",
    "Such a handsome hero... pity.",
    "Stone is such a lovely look for you...",
    "Don't look away, darling..."
  ],
  growling: [
    "*three heads growl in unison*",
    "NONE ESCAPE THE UNDERWORLD!",
    "*snaps at you*",
    "HEEL? I THINK NOT!"
  ],
  brutish: [
    "ME CRUSH TINY HUMAN!",
    "YOU LOOK TASTY!",
    "*scratches head confusedly*",
    "WHY LITTLE THING NOT RUN?"
  ],
  groaning: [
    "*unintelligible moaning*",
    "Braaaains... no wait, knowledge...",
    "*lurches forward*",
    "Join... us..."
  ],
  mechanical: [
    "*gears grinding*",
    "PROTOCOL: ELIMINATE.",
    "*sparks flying*",
    "MALFUNCTION... RAGE MODE."
  ],
  corrupting: [
    "Spreading... infecting...",
    "Your system will be ours.",
    "*data corruption intensifies*",
    "Resistance lowers defenses."
  ],
  eerie: [
    "*whispers from nowhere*",
    "I've been waiting... so long...",
    "*cold chill passes through*",
    "You shouldn't be here..."
  ],
  aristocratic: [
    "How... pedestrian.",
    "Your blood will be exquisite.",
    "I've dined on kings, you know.",
    "*adjusts cape dismissively*"
  ],
  howling: [
    "AWOOOOOO!",
    "*snarls and circles*",
    "The moon calls for blood!",
    "*hackles raised*"
  ],
  regal: [
    "KNEEL BEFORE YOUR KING!",
    "My army is eternal!",
    "Death is just the beginning!",
    "*rattles royal scepter*"
  ],
  hissing: [
    "*multiple eyes blink*",
    "Caught in my web...",
    "*legs clicking menacingly*",
    "You'll make a fine meal..."
  ]
};

// ==================== HELPER FUNCTIONS ====================

export const getThemesByCategory = (category) => {
  return Object.values(THEMES).filter(t => t.category === category);
};

export const getFreeThemes = () => {
  return Object.values(THEMES).filter(t => t.free);
};

export const getCharactersForTheme = (themeCategory) => {
  return Object.values(PLAYER_CHARACTERS).filter(c => 
    c.compatibleThemes.includes(themeCategory)
  );
};

export const getEnemiesForTheme = (themeCategory) => {
  return Object.values(ENEMIES).filter(e => 
    e.compatibleThemes.includes(themeCategory)
  );
};

export const getFreeCharacters = () => {
  return Object.values(PLAYER_CHARACTERS).filter(c => c.free);
};

export const getFreeEnemies = () => {
  return Object.values(ENEMIES).filter(e => e.free);
};

export const getRandomTaunt = (tauntStyle) => {
  const taunts = TAUNT_TEMPLATES[tauntStyle] || TAUNT_TEMPLATES.aggressive;
  return taunts[Math.floor(Math.random() * taunts.length)];
};

export const getThemeColors = (themeId) => {
  return THEMES[themeId]?.colors || { primary: '#1a1a2e', secondary: '#4a4a4a', accent: '#ffffff' };
};

// ==================== CATALOG SUMMARY ====================

export const CATALOG_STATS = {
  themes: Object.keys(THEMES).length,
  freeThemes: Object.values(THEMES).filter(t => t.free).length,
  characters: Object.keys(PLAYER_CHARACTERS).length,
  freeCharacters: Object.values(PLAYER_CHARACTERS).filter(c => c.free).length,
  enemies: Object.keys(ENEMIES).length,
  freeEnemies: Object.values(ENEMIES).filter(e => e.free).length,
  categories: [...new Set(Object.values(THEMES).map(t => t.category))]
};

export default {
  THEMES,
  PLAYER_CHARACTERS,
  ENEMIES,
  ATTACK_STYLES,
  TAUNT_TEMPLATES,
  CATALOG_STATS
};
