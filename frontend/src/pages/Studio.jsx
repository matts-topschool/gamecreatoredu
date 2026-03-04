/**
 * Studio page - List of user's games with create option.
 */
import React, { useEffect, useState } from 'react';
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
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const Studio = () => {
  const navigate = useNavigate();
  const { games, fetchGames, deleteGame, duplicateGame, isLoading } = useGameStore();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gameToDelete, setGameToDelete] = useState(null);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      toast.success('Game duplicated successfully');
      navigate(`/studio/${newGame.id}`);
    } else {
      toast.error('Failed to duplicate game');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'archived': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6" data-testid="studio-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-outfit text-foreground">Game Studio</h1>
          <p className="text-muted-foreground mt-1">Create and manage your educational games</p>
        </div>
        <Link to="/studio/new">
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2" data-testid="studio-create-btn">
            <Sparkles className="w-4 h-4" />
            Create with AI
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search games..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="studio-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="studio-filter">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className="rounded-none"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
            className="rounded-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Games Grid/List */}
      {isLoading ? (
        <div className={viewMode === 'grid' 
          ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-3'
        }>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className={viewMode === 'grid' 
                ? 'h-48 bg-slate-100 rounded-xl animate-pulse' 
                : 'h-20 bg-slate-100 rounded-lg animate-pulse'
              } 
            />
          ))}
        </div>
      ) : filteredGames.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game) => (
              <Card 
                key={game.id} 
                className="group hover:border-violet-200 hover:shadow-md transition-all cursor-pointer"
                data-testid={`game-card-${game.id}`}
              >
                <Link to={`/studio/${game.id}`}>
                  <div className="aspect-video bg-gradient-to-br from-violet-100 to-indigo-100 rounded-t-xl flex items-center justify-center relative">
                    <Gamepad2 className="w-12 h-12 text-violet-300" />
                    <Badge 
                      className={`absolute top-3 right-3 ${getStatusColor(game.status)}`}
                    >
                      {game.status}
                    </Badge>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <Link to={`/studio/${game.id}`} className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-violet-600 transition-colors line-clamp-1">
                        {game.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {game.description || 'No description'}
                      </p>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`game-menu-${game.id}`}>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/studio/${game.id}`)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(game)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setGameToDelete(game);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-3.5 h-3.5" />
                      {game.play_count} plays
                    </span>
                    <span>
                      Updated {formatDistanceToNow(new Date(game.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGames.map((game) => (
              <Card 
                key={game.id}
                className="hover:border-violet-200 transition-all"
                data-testid={`game-row-${game.id}`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-6 h-6 text-violet-400" />
                  </div>
                  <Link to={`/studio/${game.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground hover:text-violet-600 transition-colors">
                        {game.title}
                      </h3>
                      <Badge className={getStatusColor(game.status)}>
                        {game.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">
                      {game.description || 'No description'}
                    </p>
                  </Link>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      {game.play_count}
                    </span>
                    <span className="hidden sm:inline">
                      {formatDistanceToNow(new Date(game.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/studio/${game.id}`)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(game)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setGameToDelete(game);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card className="py-16">
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {search || statusFilter !== 'all' 
                ? 'No games found' 
                : 'Create your first game'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Use AI to generate an educational game in minutes, or start from scratch.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link to="/studio/new">
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create with AI
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Game</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{gameToDelete?.title}"? This action cannot be undone.
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
    </div>
  );
};

export default Studio;
