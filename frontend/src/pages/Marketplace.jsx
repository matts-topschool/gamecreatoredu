/**
 * Marketplace - Browse and discover educational games.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Search,
  Filter,
  Star,
  Users,
  Gamepad2,
  Loader2,
  ChevronDown,
  X,
  Sparkles,
  BookOpen,
  Trophy,
  Grid3X3,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import marketplaceService from '@/services/marketplaceService';
import { cn } from '@/lib/utils';

/**
 * Game Card Component
 */
const GameCard = ({ listing, onClick }) => {
  const gameTypeIcons = {
    quiz: BookOpen,
    battle: Gamepad2,
    adventure: Sparkles,
    platformer: Trophy,
  };
  
  const Icon = gameTypeIcons[listing.game_type] || Gamepad2;

  return (
    <Card 
      className="group cursor-pointer hover:border-violet-300 hover:shadow-lg transition-all overflow-hidden"
      onClick={() => onClick(listing)}
      data-testid={`game-card-${listing.id}`}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-violet-500 to-indigo-600 overflow-hidden">
        {listing.thumbnail_url ? (
          <img 
            src={listing.thumbnail_url} 
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-16 h-16 text-white/30" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={cn(
            "text-sm font-semibold",
            listing.is_free 
              ? "bg-emerald-500 text-white" 
              : "bg-amber-500 text-white"
          )}>
            {listing.is_free ? 'Free' : `$${(listing.price_cents / 100).toFixed(2)}`}
          </Badge>
        </div>
        
        {/* Game Type */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-black/50 text-white border-0 capitalize">
            <Icon className="w-3 h-3 mr-1" />
            {listing.game_type}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title & Creator */}
        <h3 className="font-semibold text-foreground truncate group-hover:text-violet-600 transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-muted-foreground truncate">
          by {listing.creator_name}
        </p>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {listing.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          {listing.avg_rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {listing.avg_rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {listing.play_count.toLocaleString()}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {listing.grade_levels?.slice(0, 2).map(g => (
            <Badge key={g} variant="outline" className="text-xs">
              Grade {g}
            </Badge>
          ))}
          {listing.subjects?.slice(0, 1).map(s => (
            <Badge key={s} variant="secondary" className="text-xs capitalize">
              {s}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Filter Sidebar Component
 */
const FilterSidebar = ({ 
  categories, 
  facets,
  filters, 
  onFilterChange,
  onClearFilters 
}) => {
  const gradeOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const gameTypes = ['quiz', 'battle', 'adventure', 'platformer', 'puzzle'];

  const hasActiveFilters = filters.category || filters.gradeLevel || 
    filters.gameType || filters.isFree !== undefined;

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}

      {/* Category Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Category</Label>
        <div className="space-y-2">
          {categories?.map(cat => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={filters.category === cat.id}
                onCheckedChange={(checked) => 
                  onFilterChange('category', checked ? cat.id : null)
                }
              />
              <label 
                htmlFor={`cat-${cat.id}`} 
                className="text-sm cursor-pointer flex-1"
              >
                {cat.name}
              </label>
              {facets?.categories?.find(f => f.value === cat.id)?.count && (
                <span className="text-xs text-muted-foreground">
                  ({facets.categories.find(f => f.value === cat.id).count})
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grade Level Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Grade Level</Label>
        <Select 
          value={filters.gradeLevel?.toString() || ""} 
          onValueChange={(v) => onFilterChange('gradeLevel', v ? parseInt(v) : null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Grades</SelectItem>
            {gradeOptions.map(g => (
              <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Game Type Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Game Type</Label>
        <div className="space-y-2">
          {gameTypes.map(type => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.gameType === type}
                onCheckedChange={(checked) => 
                  onFilterChange('gameType', checked ? type : null)
                }
              />
              <label 
                htmlFor={`type-${type}`} 
                className="text-sm cursor-pointer capitalize"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Price</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="price-free"
              checked={filters.isFree === true}
              onCheckedChange={(checked) => 
                onFilterChange('isFree', checked ? true : undefined)
              }
            />
            <label htmlFor="price-free" className="text-sm cursor-pointer">
              Free Only
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Marketplace Page
 */
const Marketplace = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [facets, setFacets] = useState({});
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters from URL
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category: searchParams.get('category'),
    gradeLevel: searchParams.get('grade') ? parseInt(searchParams.get('grade')) : null,
    gameType: searchParams.get('type'),
    isFree: searchParams.get('free') === 'true' ? true : undefined,
    sortBy: searchParams.get('sort') || 'popular',
    page: parseInt(searchParams.get('page')) || 1
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    loadFeatured();
  }, []);

  // Load listings when filters change
  useEffect(() => {
    loadListings();
    updateUrl();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const data = await marketplaceService.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadFeatured = async () => {
    try {
      const data = await marketplaceService.getFeatured(6);
      setFeatured(data.featured || []);
    } catch (err) {
      console.error('Failed to load featured:', err);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.browse(filters);
      setListings(data.listings || []);
      setTotalResults(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setFacets(data.facets || {});
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.gradeLevel) params.set('grade', filters.gradeLevel.toString());
    if (filters.gameType) params.set('type', filters.gameType);
    if (filters.isFree) params.set('free', 'true');
    if (filters.sortBy !== 'popular') params.set('sort', filters.sortBy);
    if (filters.page > 1) params.set('page', filters.page.toString());
    
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      category: null,
      gradeLevel: null,
      gameType: null,
      isFree: undefined,
      sortBy: 'popular',
      page: 1
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Query is already in state, just trigger reload
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleGameClick = (listing) => {
    navigate(`/marketplace/${listing.id}`);
  };

  const showFeatured = !filters.query && !filters.category && 
    !filters.gradeLevel && !filters.gameType;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="marketplace-page">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-outfit mb-4">
            Discover Educational Games
          </h1>
          <p className="text-white/80 mb-6 max-w-xl">
            Browse thousands of engaging games created by educators for students of all ages.
          </p>
          
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Search games..."
                className="pl-10 bg-white text-slate-900 border-0 h-12"
                data-testid="search-input"
              />
            </div>
            <Button type="submit" className="bg-white text-violet-600 hover:bg-white/90 h-12 px-6">
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h2>
              <FilterSidebar
                categories={categories}
                facets={facets}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar
                      categories={categories}
                      facets={facets}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Featured Section */}
            {showFeatured && featured.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Featured Games
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.slice(0, 3).map(listing => (
                    <GameCard 
                      key={listing.id} 
                      listing={listing} 
                      onClick={handleGameClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {totalResults} game{totalResults !== 1 ? 's' : ''} found
              </p>
              
              <Select 
                value={filters.sortBy} 
                onValueChange={(v) => handleFilterChange('sortBy', v)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
            ) : listings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Gamepad2 className="w-16 h-16 text-slate-200 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No games found</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Results Grid */}
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {listings.map(listing => (
                    <GameCard 
                      key={listing.id} 
                      listing={listing} 
                      onClick={handleGameClick}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={filters.page <= 1}
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                      Page {filters.page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={filters.page >= totalPages}
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
