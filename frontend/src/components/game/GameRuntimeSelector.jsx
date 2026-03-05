/**
 * GameRuntimeSelector - Routes to the appropriate game runtime based on game type.
 * Supports: quiz, battle (enhanced), adventure (coming), platformer (coming), puzzle (coming), simulation (coming)
 */
import React from 'react';
import GameRuntime from './GameRuntime';
import BattleRuntime from './BattleRuntime';
import EnhancedBattleRuntime from '../../game/EnhancedBattleRuntime';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Construction, Sparkles } from 'lucide-react';

/**
 * Placeholder for game types not yet implemented
 */
const ComingSoonRuntime = ({ spec, gameType, onExit }) => (
  <Card className="min-h-[400px]">
    <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Construction className="w-16 h-16 text-amber-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">{spec?.meta?.title || 'Game'}</h2>
      <Badge variant="outline" className="mb-4 capitalize">{gameType} Mode</Badge>
      <p className="text-muted-foreground mb-6 max-w-md">
        The <strong className="capitalize">{gameType}</strong> game mode is coming soon! 
        For now, this game will play in Quiz mode.
      </p>
      <p className="text-sm text-muted-foreground">
        Check back later for updates.
      </p>
    </CardContent>
  </Card>
);

/**
 * GameRuntimeSelector - Main component
 * 
 * Props:
 * - spec: GameSpec object with game content
 * - onComplete: Callback when game finishes
 * - onExit: Callback to exit game
 * - sessionId: Optional session ID for tracking
 * - playerId: Player identifier
 * - playerName: Display name
 * - useEnhancedGraphics: Whether to use enhanced visual mode (default: true)
 * - theme: Battle arena theme (from AssetCatalog)
 * - playerCharacter: Selected player character (from AssetCatalog)
 * - enemyType: Selected enemy type (from AssetCatalog)
 * - fallbackToQuiz: If true, unsupported types fall back to quiz
 */
const GameRuntimeSelector = ({ 
  spec, 
  onComplete, 
  onExit,
  sessionId,
  playerId,
  playerName,
  useEnhancedGraphics = true,
  theme = 'fantasy_castle',
  playerCharacter = 'knight',
  enemyType = 'orc',
  fallbackToQuiz = true
}) => {
  const gameType = spec?.meta?.game_type?.toLowerCase() || 'quiz';

  // Route to appropriate runtime
  switch (gameType) {
    case 'quiz':
      return (
        <GameRuntime
          spec={spec}
          onComplete={onComplete}
          onExit={onExit}
          sessionId={sessionId}
          playerId={playerId}
          playerName={playerName}
        />
      );
    
    case 'battle':
    case 'monster_battle':
      // Use enhanced battle runtime with visuals if enabled
      if (useEnhancedGraphics) {
        return (
          <EnhancedBattleRuntime
            spec={spec}
            onComplete={onComplete}
            onExit={onExit}
            theme={theme}
            playerCharacter={playerCharacter}
            enemyType={enemyType}
          />
        );
      }
      // Fallback to original battle runtime
      return (
        <BattleRuntime
          spec={spec}
          onComplete={onComplete}
          onExit={onExit}
          playerId={playerId}
          playerName={playerName}
        />
      );
    
    // Future game types - for now, fall back to quiz or show coming soon
    case 'adventure':
    case 'platformer':
    case 'puzzle':
    case 'simulation':
      if (fallbackToQuiz) {
        // Use quiz runtime with a notice
        return (
          <GameRuntime
            spec={spec}
            onComplete={onComplete}
            onExit={onExit}
            sessionId={sessionId}
            playerId={playerId}
            playerName={playerName}
          />
        );
      }
      return (
        <ComingSoonRuntime 
          spec={spec} 
          gameType={gameType} 
          onExit={onExit}
        />
      );
    
    default:
      // Unknown type - default to quiz
      return (
        <GameRuntime
          spec={spec}
          onComplete={onComplete}
          onExit={onExit}
          sessionId={sessionId}
          playerId={playerId}
          playerName={playerName}
        />
      );
  }
};

export default GameRuntimeSelector;
