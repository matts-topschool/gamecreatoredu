/**
 * Adventure Asset Catalog - Theme worlds, scenes, NPCs, and artifacts
 */

// ==================== ADVENTURE WORLDS ====================

export const ADVENTURE_WORLDS = {
  pirate_voyage: {
    id: 'pirate_voyage',
    name: 'Pirate Voyage',
    icon: '🏴‍☠️',
    description: 'Sail the seas and hunt for buried treasure!',
    artifact: {
      name: 'Treasure Map',
      pieces: ['🗺️', '🗺️', '🗺️', '🗺️', '🗺️', '🗺️', '🗺️'],
      complete: '🗺️✨',
      completeMessage: 'The treasure map is complete! X marks the spot!'
    },
    scenes: [
      { id: 'beach', name: 'Sandy Beach', icon: '🏖️', npc: 'old_sailor' },
      { id: 'jungle', name: 'Dense Jungle', icon: '🌴', npc: 'parrot' },
      { id: 'waterfall', name: 'Hidden Waterfall', icon: '💧', npc: 'monkey' },
      { id: 'cave', name: 'Dark Cave', icon: '🦇', npc: 'hermit' },
      { id: 'underground', name: 'Underground Lake', icon: '🚣', npc: 'ghost_pirate' },
      { id: 'temple', name: 'Ancient Temple', icon: '🏛️', npc: 'stone_guardian' },
      { id: 'treasure', name: 'Treasure Chamber', icon: '💎', npc: 'captain' },
    ],
    colors: { primary: '#1e3a5f', secondary: '#d4a76a', accent: '#ffd700' },
    free: true
  },

  mystery_mansion: {
    id: 'mystery_mansion',
    name: 'Mystery Mansion',
    icon: '🏚️',
    description: 'Explore the haunted mansion and solve the mystery!',
    artifact: {
      name: 'Skeleton Key',
      pieces: ['🔑', '🔑', '🔑', '🔑', '🔑', '🔑', '🔑'],
      complete: '🗝️✨',
      completeMessage: 'The skeleton key is forged! The final door awaits!'
    },
    scenes: [
      { id: 'entrance', name: 'Grand Entrance', icon: '🚪', npc: 'butler' },
      { id: 'library', name: 'Dusty Library', icon: '📚', npc: 'ghost_librarian' },
      { id: 'kitchen', name: 'Abandoned Kitchen', icon: '🍳', npc: 'chef_ghost' },
      { id: 'gallery', name: 'Portrait Gallery', icon: '🖼️', npc: 'painting' },
      { id: 'basement', name: 'Creepy Basement', icon: '🕯️', npc: 'rat_king' },
      { id: 'attic', name: 'Dusty Attic', icon: '🕸️', npc: 'old_lady_ghost' },
      { id: 'secret', name: 'Secret Chamber', icon: '⚰️', npc: 'mansion_owner' },
    ],
    colors: { primary: '#1a1a2e', secondary: '#4a0e4e', accent: '#00ff00' },
    free: true
  },

  space_mission: {
    id: 'space_mission',
    name: 'Space Mission',
    icon: '🚀',
    description: 'Blast off to explore the galaxy!',
    artifact: {
      name: 'Hyperdrive Core',
      pieces: ['⚙️', '⚙️', '⚙️', '⚙️', '⚙️', '⚙️', '⚙️'],
      complete: '💫✨',
      completeMessage: 'The hyperdrive is complete! Prepare for lightspeed!'
    },
    scenes: [
      { id: 'launchpad', name: 'Launch Pad', icon: '🚀', npc: 'commander' },
      { id: 'bridge', name: 'Ship Bridge', icon: '🖥️', npc: 'ai_computer' },
      { id: 'engine', name: 'Engine Room', icon: '⚡', npc: 'engineer' },
      { id: 'asteroid', name: 'Asteroid Field', icon: '☄️', npc: 'navigator' },
      { id: 'station', name: 'Space Station', icon: '🛸', npc: 'alien_trader' },
      { id: 'nebula', name: 'Colorful Nebula', icon: '🌌', npc: 'space_whale' },
      { id: 'planet', name: 'New Planet', icon: '🪐', npc: 'alien_elder' },
    ],
    colors: { primary: '#0a0a23', secondary: '#1e3a5f', accent: '#00ffff' },
    free: true
  },

  ancient_egypt: {
    id: 'ancient_egypt',
    name: 'Ancient Egypt',
    icon: '🏺',
    description: 'Uncover the secrets of the pharaohs!',
    artifact: {
      name: 'Eye of Ra',
      pieces: ['👁️', '👁️', '👁️', '👁️', '👁️', '👁️', '👁️'],
      complete: '🌟✨',
      completeMessage: 'The Eye of Ra shines with ancient power!'
    },
    scenes: [
      { id: 'oasis', name: 'Desert Oasis', icon: '🌴', npc: 'camel_trader' },
      { id: 'entrance', name: 'Pyramid Entrance', icon: '🔺', npc: 'sphinx' },
      { id: 'hieroglyphs', name: 'Hieroglyph Hall', icon: '📜', npc: 'scribe' },
      { id: 'traps', name: 'Trap Corridor', icon: '⚠️', npc: 'mummy' },
      { id: 'burial', name: 'Burial Chamber', icon: '⚰️', npc: 'anubis' },
      { id: 'treasury', name: 'Royal Treasury', icon: '💰', npc: 'cat_goddess' },
      { id: 'throne', name: "Pharaoh's Throne", icon: '👑', npc: 'pharaoh' },
    ],
    colors: { primary: '#c2a366', secondary: '#8b7355', accent: '#ffd700' },
    free: true
  },

  enchanted_forest: {
    id: 'enchanted_forest',
    name: 'Enchanted Forest',
    icon: '🧚',
    description: 'Discover magic in the mystical woods!',
    artifact: {
      name: 'Crystal of Light',
      pieces: ['💎', '💎', '💎', '💎', '💎', '💎', '💎'],
      complete: '🔮✨',
      completeMessage: 'The Crystal radiates pure magic! The forest is saved!'
    },
    scenes: [
      { id: 'edge', name: 'Forest Edge', icon: '🌲', npc: 'wise_owl' },
      { id: 'glade', name: 'Fairy Glade', icon: '🧚', npc: 'fairy_queen' },
      { id: 'cottage', name: "Witch's Cottage", icon: '🏠', npc: 'good_witch' },
      { id: 'bridge', name: 'Troll Bridge', icon: '🌉', npc: 'friendly_troll' },
      { id: 'grove', name: 'Ancient Grove', icon: '🌳', npc: 'tree_spirit' },
      { id: 'cave', name: 'Crystal Cave', icon: '💎', npc: 'gnome_king' },
      { id: 'castle', name: 'Crystal Castle', icon: '🏰', npc: 'forest_king' },
    ],
    colors: { primary: '#1a4d1a', secondary: '#9932cc', accent: '#00ff7f' },
    free: true
  },

  ocean_quest: {
    id: 'ocean_quest',
    name: 'Ocean Quest',
    icon: '🐚',
    description: 'Dive deep into underwater adventure!',
    artifact: {
      name: "Poseidon's Trident",
      pieces: ['🔱', '🔱', '🔱', '🔱', '🔱', '🔱', '🔱'],
      complete: '🔱✨',
      completeMessage: "Poseidon's Trident is restored! Command the seas!"
    },
    scenes: [
      { id: 'shore', name: 'Sunny Shore', icon: '🏖️', npc: 'lifeguard' },
      { id: 'shallows', name: 'Coral Shallows', icon: '🐠', npc: 'clownfish' },
      { id: 'reef', name: 'Rainbow Reef', icon: '🪸', npc: 'sea_turtle' },
      { id: 'shipwreck', name: 'Sunken Ship', icon: '⚓', npc: 'ghost_captain' },
      { id: 'trench', name: 'Deep Trench', icon: '🦑', npc: 'giant_squid' },
      { id: 'caves', name: 'Underwater Caves', icon: '🐙', npc: 'octopus_sage' },
      { id: 'palace', name: 'Mermaid Palace', icon: '🧜', npc: 'mermaid_queen' },
    ],
    colors: { primary: '#006994', secondary: '#20b2aa', accent: '#00ffff' },
    free: true
  }
};

// ==================== NPC CHARACTERS ====================

export const ADVENTURE_NPCS = {
  // Pirate NPCs
  old_sailor: { id: 'old_sailor', name: 'Old Sailor Pete', icon: '🧔', style: 'wise' },
  parrot: { id: 'parrot', name: 'Polly the Parrot', icon: '🦜', style: 'playful' },
  monkey: { id: 'monkey', name: 'Coco the Monkey', icon: '🐒', style: 'mischievous' },
  hermit: { id: 'hermit', name: 'Cave Hermit', icon: '🧙', style: 'mysterious' },
  ghost_pirate: { id: 'ghost_pirate', name: 'Captain Bones', icon: '💀', style: 'spooky' },
  stone_guardian: { id: 'stone_guardian', name: 'Temple Guardian', icon: '🗿', style: 'ancient' },
  captain: { id: 'captain', name: 'Captain Goldbeard', icon: '🏴‍☠️', style: 'proud' },
  
  // Mansion NPCs
  butler: { id: 'butler', name: 'Jeeves the Butler', icon: '🎩', style: 'formal' },
  ghost_librarian: { id: 'ghost_librarian', name: 'Ms. Whisper', icon: '👻', style: 'quiet' },
  chef_ghost: { id: 'chef_ghost', name: 'Chef Gusteau', icon: '👨‍🍳', style: 'dramatic' },
  painting: { id: 'painting', name: 'The Portrait', icon: '🖼️', style: 'mysterious' },
  rat_king: { id: 'rat_king', name: 'Rat King Squeaks', icon: '🐀', style: 'sneaky' },
  old_lady_ghost: { id: 'old_lady_ghost', name: 'Grandma Ghost', icon: '👵', style: 'kind' },
  mansion_owner: { id: 'mansion_owner', name: 'Lord Darkwood', icon: '🧛', style: 'dramatic' },
  
  // Space NPCs
  commander: { id: 'commander', name: 'Commander Nova', icon: '👨‍🚀', style: 'heroic' },
  ai_computer: { id: 'ai_computer', name: 'A.R.I.A.', icon: '🤖', style: 'logical' },
  engineer: { id: 'engineer', name: 'Engineer Sparks', icon: '👩‍🔧', style: 'technical' },
  navigator: { id: 'navigator', name: 'Navigator Luna', icon: '🧭', style: 'calm' },
  alien_trader: { id: 'alien_trader', name: 'Zyx the Trader', icon: '👽', style: 'friendly' },
  space_whale: { id: 'space_whale', name: 'Cosmic Whale', icon: '🐋', style: 'ancient' },
  alien_elder: { id: 'alien_elder', name: 'Elder Zor', icon: '🛸', style: 'wise' },
  
  // Egypt NPCs
  camel_trader: { id: 'camel_trader', name: 'Hassan', icon: '🐪', style: 'friendly' },
  sphinx: { id: 'sphinx', name: 'The Great Sphinx', icon: '🦁', style: 'mysterious' },
  scribe: { id: 'scribe', name: 'Scribe Thoth', icon: '📜', style: 'scholarly' },
  mummy: { id: 'mummy', name: 'Mummy Imhotep', icon: '🧟', style: 'slow' },
  anubis: { id: 'anubis', name: 'Anubis', icon: '🐺', style: 'serious' },
  cat_goddess: { id: 'cat_goddess', name: 'Bastet', icon: '🐱', style: 'graceful' },
  pharaoh: { id: 'pharaoh', name: 'Pharaoh Ramses', icon: '👑', style: 'royal' },
  
  // Forest NPCs
  wise_owl: { id: 'wise_owl', name: 'Professor Hoot', icon: '🦉', style: 'wise' },
  fairy_queen: { id: 'fairy_queen', name: 'Queen Titania', icon: '🧚', style: 'magical' },
  good_witch: { id: 'good_witch', name: 'Willow the Witch', icon: '🧙‍♀️', style: 'kind' },
  friendly_troll: { id: 'friendly_troll', name: 'Grumble', icon: '👹', style: 'grumpy' },
  tree_spirit: { id: 'tree_spirit', name: 'Elder Oak', icon: '🌳', style: 'ancient' },
  gnome_king: { id: 'gnome_king', name: 'King Gemstone', icon: '👑', style: 'jolly' },
  forest_king: { id: 'forest_king', name: 'King Oberon', icon: '🤴', style: 'noble' },
  
  // Ocean NPCs
  lifeguard: { id: 'lifeguard', name: 'Sandy', icon: '🏊', style: 'helpful' },
  clownfish: { id: 'clownfish', name: 'Finn', icon: '🐠', style: 'cheerful' },
  sea_turtle: { id: 'sea_turtle', name: 'Master Shelly', icon: '🐢', style: 'wise' },
  ghost_captain: { id: 'ghost_captain', name: 'Captain Barnacle', icon: '⚓', style: 'sad' },
  giant_squid: { id: 'giant_squid', name: 'Inky', icon: '🦑', style: 'shy' },
  octopus_sage: { id: 'octopus_sage', name: 'Oracle Octo', icon: '🐙', style: 'mysterious' },
  mermaid_queen: { id: 'mermaid_queen', name: 'Queen Coral', icon: '🧜‍♀️', style: 'regal' }
};

// ==================== NPC DIALOGUE TEMPLATES ====================

export const NPC_DIALOGUES = {
  intro: {
    wise: [
      "Ah, young traveler. I've been expecting you.",
      "Listen well, for I have important knowledge to share.",
      "The path ahead requires wisdom. Let me help you."
    ],
    playful: [
      "Hey hey! A new friend! This is gonna be fun!",
      "Ooh ooh! I know something you don't know!",
      "Yay! Let's play a game!"
    ],
    mysterious: [
      "The shadows whisper of your coming...",
      "Few dare to venture here. You are... different.",
      "What you seek lies beyond... if you prove worthy."
    ],
    spooky: [
      "Boooo! Hehe, did I scare you?",
      "The dead have much to say... if you'll listen.",
      "Even ghosts get lonely. Stay a while..."
    ],
    heroic: [
      "Attention, cadet! Your mission is critical!",
      "The galaxy needs heroes like you!",
      "Ready to save the universe? Let's do this!"
    ],
    friendly: [
      "Welcome, welcome! So good to see you!",
      "Oh how wonderful! A visitor!",
      "Come, come! Let me help you on your journey!"
    ],
    ancient: [
      "Through eons I have waited...",
      "The ancient ones spoke of this moment.",
      "Time flows differently here. But you... you are the one."
    ],
    royal: [
      "You stand before royalty. Show your worth.",
      "Few are granted audience. Consider yourself honored.",
      "The crown recognizes courage. Prove yours."
    ]
  },
  correct: {
    wise: ["Excellent! Your wisdom grows.", "Indeed! The truth reveals itself to you."],
    playful: ["Woohoo! You did it!", "Yippee! That was awesome!"],
    mysterious: ["The mysteries unfold before you...", "Yes... the path becomes clearer."],
    spooky: ["Even the spirits are impressed!", "Ooooh, spooky smart!"],
    heroic: ["Outstanding work, cadet!", "That's the spirit! Mission success!"],
    friendly: ["Wonderful! Simply wonderful!", "Oh how marvelous!"],
    ancient: ["The ancients smile upon you.", "Worthy. Truly worthy."],
    royal: ["You honor the crown.", "Most impressive, noble one."]
  },
  wrong: {
    wise: ["Hmm, not quite. Think deeper.", "The answer eludes you. Try again."],
    playful: ["Oopsie! That's not it! Try again!", "Nope nope! One more time!"],
    mysterious: ["The truth hides from you... for now.", "Look beyond what you see..."],
    spooky: ["Eeek! Wrong answer! Don't worry, try again!", "The spirits say... nope!"],
    heroic: ["Negative, cadet. Recalculate!", "Minor setback! Try again!"],
    friendly: ["Oh dear, not quite! You can do it!", "No worries, give it another go!"],
    ancient: ["Time will reveal the answer...", "Patience. Try once more."],
    royal: ["That is... incorrect. You may try again.", "The crown expects better. Again."]
  },
  artifact: {
    wise: ["You've earned this piece of the artifact. Guard it well."],
    playful: ["Ooh shiny! Here's your prize!"],
    mysterious: ["Take this fragment... its power grows with each piece."],
    spooky: ["A ghostly gift for you! Oooooh!"],
    heroic: ["Mission objective acquired! Outstanding!"],
    friendly: ["For you! You've earned it!"],
    ancient: ["This piece has waited ages for you."],
    royal: ["The crown bestows this upon you."]
  }
};

// ==================== HELPER FUNCTIONS ====================

export const getWorldById = (worldId) => ADVENTURE_WORLDS[worldId];

export const getNpcById = (npcId) => ADVENTURE_NPCS[npcId];

export const getRandomDialogue = (type, style) => {
  const dialogues = NPC_DIALOGUES[type]?.[style] || NPC_DIALOGUES[type]?.friendly || ["..."];
  return dialogues[Math.floor(Math.random() * dialogues.length)];
};

export const getWorldScenes = (worldId, count = 5) => {
  const world = ADVENTURE_WORLDS[worldId];
  if (!world) return [];
  
  // Return requested number of scenes, always including the last one
  const allScenes = world.scenes;
  if (count >= allScenes.length) return allScenes;
  
  // Take first (count-1) scenes + always include the last scene (finale)
  const selectedScenes = allScenes.slice(0, count - 1);
  selectedScenes.push(allScenes[allScenes.length - 1]);
  return selectedScenes;
};

export const getAllWorlds = () => Object.values(ADVENTURE_WORLDS);

export const getFreeWorlds = () => Object.values(ADVENTURE_WORLDS).filter(w => w.free);

export default {
  ADVENTURE_WORLDS,
  ADVENTURE_NPCS,
  NPC_DIALOGUES,
  getWorldById,
  getNpcById,
  getRandomDialogue,
  getWorldScenes,
  getAllWorlds,
  getFreeWorlds
};
