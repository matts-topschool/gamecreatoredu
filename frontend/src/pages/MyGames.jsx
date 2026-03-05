/**
 * MyGames - Redesigned game library with Created, Saved, and Purchased sections.
 * Designed for scale (hundreds of games) with search, filters, and quick actions.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  Plus, 
  Search, 
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  PlayCircle,
  Sparkles,
  Filter,
  LayoutGrid,
  List,
  Heart,
  ShoppingBag,
  FolderPlus,
  School,
  ChevronRight,
  SortAsc,
  SortDesc,
  Calendar,
  Clock,
  BookOpen,
  Swords,
  Compass,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import useGameStore from '@/stores/gameStore';
import GameThumbnail from '@/components/game/GameThumbnail';
import AssignToClassDialog from '@/components/game/AssignToClassDialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import api from '@/services/api';

// Game type icons
const getGameTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'battle':
    case 'monster_battle':
      return <Swords className="w-4 h-4" />;
    case 'adventure':
    case 'story':
      return <Compass className="w-4 h-4" />;
    case 'quiz':
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

// Quick Stats Card
const QuickStats = ({ created, saved, purchased }) => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <FolderPlus className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-violet-700">{created}</p>
          <p className="text-xs text-violet-600">Created</p>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
          <Heart className="w-5 h-5 text-rose-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-rose-700">{saved}</p>
          <p className="text-xs text-rose-600">Saved</p>
        </div>
      </CardContent>
    </Card>
    <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-emerald-700">{purchased}</p>
          <p className="text-xs text-emerald-600">Purchased</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Game Card Component
const GameCard = ({ 
  game, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onAssign,
  onPlay,
  showCreator = false,
  source = 'created'
}) => {
  const navigate = useNavigate();
  const gameType = game.spec?.meta?.game_type || game.game_type || 'quiz';
  
  return (
    <Card 
      className="group hover:border-violet-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
      data-testid={`game-card-${game.id}`}
    >
      {/* Thumbnail */}
      <div 
        className="relative cursor-pointer"
        onClick={() => navigate(`/play/${game.id}`)}
      >
        <GameThumbnail spec={game.spec || { meta: { game_type: game.game_type || 'quiz' }, battle_visuals: game.game_spec?.battle_visuals, adventure_visuals: game.game_spec?.adventure_visuals }} />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button 
            size="sm" 
            className="bg-white text-slate-900 hover:bg-slate-100"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(game);
            }}
          >
            <PlayCircle className="w-4 h-4 mr-1" />
            Play
          </Button>
          {source === 'created' && (
            <Button 
              size="sm" 
              variant="outline"
              className="border-white text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(game);
              }}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
        
        {/* Game type badge */}
        <Badge 
          className="absolute top-2 left-2 bg-black/60 text-white backdrop-blur-sm"
        >
          {getGameTypeIcon(gameType)}
          <span className="ml-1 capitalize">{gameType}</span>
        </Badge>
        
        {/* Status badge for created games */}
        {source === 'created' && game.status && (
          <Badge 
            className={cn(
              "absolute top-2 right-2",
              game.status === 'published' && "bg-emerald-500",
              game.status === 'draft' && "bg-slate-500",
              game.status === 'archived' && "bg-orange-500"
            )}
          >
            {game.status}
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate group-hover:text-violet-600 transition-colors">
              {game.title}
            </h3>
            {showCreator && game.creator_name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                by {game.creator_name}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {game.subjects?.[0] && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {game.subjects[0]}
                </Badge>
              )}
              {game.grade_levels?.[0] && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Grade {game.grade_levels[0]}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Actions dropdown - only for created games */}
          {source === 'created' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onPlay?.(game)}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Play Game
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign?.(game)}>
                  <School className="w-4 h-4 mr-2" />
                  Assign to Class
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit?.(game)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Game
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(game)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(game)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Footer - different for created vs saved/purchased */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(game.updated_at || game.created_at), { addSuffix: true })}
          </span>
          
          {/* Show Assign button for saved/purchased games, play count for created */}
          {source === 'created' ? (
            game.play_count !== undefined && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3" />
                {game.play_count} plays
              </span>
            )
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="h-7 px-2 text-xs gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onAssign?.(game);
              }}
            >
              <School className="w-3 h-3" />
              Assign
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Empty State Component
const EmptyState = ({ type, onAction }) => {
  const configs = {
    created: {
      icon: <Sparkles className="w-12 h-12 text-violet-400" />,
      title: "No games created yet",
      description: "Create your first AI-powered educational game in minutes!",
      actionText: "Create Game",
      actionLink: "/studio/new"
    },
    saved: {
      icon: <Heart className="w-12 h-12 text-rose-400" />,
      title: "No saved games",
      description: "Browse the marketplace and save games you love.",
      actionText: "Browse Marketplace",
      actionLink: "/marketplace"
    },
    purchased: {
      icon: <ShoppingBag className="w-12 h-12 text-emerald-400" />,
      title: "No purchased games",
      description: "Premium games you purchase will appear here.",
      actionText: "Browse Marketplace",
      actionLink: "/marketplace"
    }
  };
  
  const config = configs[type];
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        {config.icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{config.description}</p>
      <Link to={config.actionLink}>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {config.actionText}
        </Button>
      </Link>
    </div>
  );
};

// Main Component
const MyGames = () => {
  const navigate = useNavigate();
  const { games, fetchGames, deleteGame, duplicateGame, isLoading } = useGameStore();
  
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [gameTypeFilter, setGameTypeFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('created');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [gameToAssign, setGameToAssign] = useState(null);
  
  // For saved (free acquired) and purchased (paid) games
  const [savedGames, setSavedGames] = useState([]);
  const [purchasedGames, setPurchasedGames] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);

  // Fetch library (acquired games from marketplace)
  const fetchLibrary = async () => {
    setLibraryLoading(true);
    try {
      const response = await api.get('/marketplace/my-library');
      const library = response.data.library || [];
      
      // Separate into saved (free) and purchased (paid)
      // Also exclude games the user created (those show in "Created" tab)
      const saved = [];
      const purchased = [];
      
      library.forEach(game => {
        // Skip games the user owns (created) - they're already in the Created tab
        if (game.is_mine) return;
        
        if (game.price_cents > 0) {
          purchased.push(game);
        } else {
          saved.push(game);
        }
      });
      
      setSavedGames(saved);
      setPurchasedGames(purchased);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchLibrary();
  }, [fetchGames]);

  // Filter and sort games
  const filterAndSort = (gameList) => {
    let filtered = gameList.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = gameTypeFilter === 'all' || 
        (game.spec?.meta?.game_type || 'quiz').toLowerCase() === gameTypeFilter;
      const matchesGrade = gradeFilter === 'all' || 
        game.grade_levels?.includes(parseInt(gradeFilter));
      return matchesSearch && matchesType && matchesGrade;
    });
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'plays':
          return (b.play_count || 0) - (a.play_count || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredCreated = useMemo(() => filterAndSort(games), [games, search, sortBy, gameTypeFilter, gradeFilter]);
  const filteredSaved = useMemo(() => filterAndSort(savedGames), [savedGames, search, sortBy, gameTypeFilter, gradeFilter]);
  const filteredPurchased = useMemo(() => filterAndSort(purchasedGames), [purchasedGames, search, sortBy, gameTypeFilter, gradeFilter]);

  const handleDelete = async () => {
    if (gameToDelete) {
      const success = await deleteGame(gameToDelete.id);
      if (success) {
        toast.success('Game deleted successfully');
      } else {
        toast.error('Failed to delete game');
      }
      setDeleteDialogOpen(false);
      setGameToDelete(null);
    }
  };

  const handleDuplicate = async (game) => {
    const newGame = await duplicateGame(game.id);
    if (newGame) {
      toast.success('Game added to your library');
      navigate(`/studio/${newGame.id}`);
    } else {
      toast.error('Failed to duplicate game');
    }
  };

  const getCurrentGames = () => {
    switch (activeTab) {
      case 'created': return filteredCreated;
      case 'saved': return filteredSaved;
      case 'purchased': return filteredPurchased;
      default: return [];
    }
  };

  const renderGameGrid = (gameList, source) => {
    if (gameList.length === 0) {
      return <EmptyState type={source} />;
    }
    
    return (
      <div className={cn(
        viewMode === 'grid' 
          ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
          : 'space-y-3'
      )}>
        {gameList.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            source={source}
            showCreator={source !== 'created'}
            onEdit={(g) => navigate(`/studio/${g.id}`)}
            onDuplicate={handleDuplicate}
            onDelete={(g) => {
              setGameToDelete(g);
              setDeleteDialogOpen(true);
            }}
            onAssign={(g) => {
              setGameToAssign(g);
              setAssignDialogOpen(true);
            }}
            onPlay={(g) => navigate(`/play/${g.id}`)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6" data-testid="my-games-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-foreground">My Games</h1>
          <p className="text-muted-foreground mt-1">Your complete game library</p>
        </div>
        <Link to="/studio/new">
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2" data-testid="create-game-btn">
            <Sparkles className="w-4 h-4" />
            Create with AI
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <QuickStats 
        created={games.length}
        saved={savedGames.length}
        purchased={purchasedGames.length}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger 
              value="created" 
              className="data-[state=active]:bg-violet-600 data-[state=active]:text-white px-6"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Created
              <Badge variant="secondary" className="ml-2 bg-white/20">{games.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="data-[state=active]:bg-rose-500 data-[state=active]:text-white px-6"
            >
              <Heart className="w-4 h-4 mr-2" />
              Saved
              <Badge variant="secondary" className="ml-2 bg-white/20">{savedGames.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="purchased"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Purchased
              <Badge variant="secondary" className="ml-2 bg-white/20">{purchasedGames.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          {/* View toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters - Same for all tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="search-games"
            />
          </div>
          
          <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Game Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="battle">Battle</SelectItem>
              <SelectItem value="adventure">Adventure</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {[...Array(12)].map((_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>Grade {i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="plays">Most Played</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {(isLoading || libraryLoading) && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div 
                key={i} 
                className="aspect-[4/3] bg-slate-100 rounded-xl animate-pulse" 
              />
            ))}
          </div>
        )}

        {/* Tab Content */}
        {!isLoading && !libraryLoading && (
          <>
            <TabsContent value="created" className="mt-0">
              {renderGameGrid(filteredCreated, 'created')}
            </TabsContent>
            
            <TabsContent value="saved" className="mt-0">
              {renderGameGrid(filteredSaved, 'saved')}
            </TabsContent>
            
            <TabsContent value="purchased" className="mt-0">
              {renderGameGrid(filteredPurchased, 'purchased')}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Results count */}
      {!isLoading && getCurrentGames().length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {getCurrentGames().length} game{getCurrentGames().length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{gameToDelete?.title}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign to Class Dialog */}
      <AssignToClassDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        game={gameToAssign}
        onAssigned={() => {
          toast.success('Game assigned successfully!');
        }}
      />
    </div>
  );
};

export default MyGames;
