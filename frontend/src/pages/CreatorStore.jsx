/**
 * CreatorStore - TpT-style creator store page.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Star,
  Users,
  Play,
  Heart,
  Share2,
  ExternalLink,
  CheckCircle,
  Loader2,
  Grid,
  List,
  Filter,
  Store,
  Package,
  Download,
  MessageSquare,
  Twitter,
  Youtube,
  Instagram,
  Globe,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import marketplaceService from '@/services/marketplaceService';
import useAuthStore from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CreatorStore = () => {
  const { storeSlug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Filters
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadStore();
  }, [storeSlug]);

  useEffect(() => {
    if (store) {
      loadProducts();
    }
  }, [store, sortBy, page]);

  useEffect(() => {
    if (store && isAuthenticated) {
      checkFollowStatus();
    }
  }, [store, isAuthenticated]);

  const loadStore = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getStore(storeSlug);
      setStore(data);
    } catch (err) {
      console.error('Failed to load store:', err);
      toast.error('Store not found');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const data = await marketplaceService.getStoreProducts(storeSlug, { sortBy, page });
      setProducts(data.listings || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const data = await marketplaceService.isFollowingStore(storeSlug);
      setIsFollowing(data.is_following);
    } catch (err) {
      // Ignore errors
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow stores');
      navigate('/login');
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await marketplaceService.unfollowStore(storeSlug);
        setIsFollowing(false);
        setStore(prev => ({ ...prev, follower_count: prev.follower_count - 1 }));
        toast.success('Unfollowed store');
      } else {
        await marketplaceService.followStore(storeSlug);
        setIsFollowing(true);
        setStore(prev => ({ ...prev, follower_count: prev.follower_count + 1 }));
        toast.success('Now following store!');
      }
    } catch (err) {
      toast.error('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Store link copied!');
  };

  const isOwnStore = store && user && store.user_id === user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Banner */}
      <div 
        className="h-48 md:h-64 bg-gradient-to-r from-violet-600 to-indigo-600 relative"
        style={store.banner_url ? { 
          backgroundImage: `url(${store.banner_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : { backgroundColor: store.accent_color }}
      >
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white"
          onClick={() => navigate('/marketplace')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Store Info */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative -mt-16 md:-mt-20 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg -mt-16 md:-mt-20">
                  <AvatarImage src={store.logo_url} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                    {store.store_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl md:text-3xl font-bold">{store.store_name}</h1>
                      {store.is_verified && (
                        <Badge className="bg-blue-100 text-blue-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {store.is_featured_seller && (
                        <Badge className="bg-amber-100 text-amber-700">
                          Featured Seller
                        </Badge>
                      )}
                    </div>
                    {store.tagline && (
                      <p className="text-muted-foreground mt-1">{store.tagline}</p>
                    )}
                    
                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{store.total_products}</span>
                        <span className="text-muted-foreground">products</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{store.total_downloads.toLocaleString()}</span>
                        <span className="text-muted-foreground">downloads</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{store.follower_count.toLocaleString()}</span>
                        <span className="text-muted-foreground">followers</span>
                      </div>
                      {store.avg_rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-semibold">{store.avg_rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({store.review_count} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isOwnStore ? (
                      <Button onClick={() => navigate('/settings/store')}>
                        Edit Store
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFollow}
                        disabled={followLoading}
                        variant={isFollowing ? "outline" : "default"}
                        className={cn(!isFollowing && "bg-violet-600 hover:bg-violet-700")}
                        data-testid="follow-btn"
                      >
                        {followLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : isFollowing ? (
                          <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
                        ) : (
                          <Heart className="w-4 h-4 mr-2" />
                        )}
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Social Links */}
                {(store.website_url || store.twitter_handle || store.youtube_url || store.instagram_handle) && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {store.website_url && (
                      <a href={store.website_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-violet-600">
                        <Globe className="w-5 h-5" />
                      </a>
                    )}
                    {store.twitter_handle && (
                      <a href={`https://twitter.com/${store.twitter_handle}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-500">
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {store.youtube_url && (
                      <a href={store.youtube_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-red-600">
                        <Youtube className="w-5 h-5" />
                      </a>
                    )}
                    {store.instagram_handle && (
                      <a href={`https://instagram.com/${store.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-600">
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="mb-8">
          <TabsList>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Products ({store.total_products})
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-2">
              <Store className="w-4 h-4" />
              About
            </TabsTrigger>
            {store.show_reviews && (
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Reviews
              </TabsTrigger>
            )}
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            {/* Featured Products */}
            {store.featured_products?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Featured Products</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {store.featured_products.slice(0, 3).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}

            {/* All Products */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">All Products</h2>
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">No products yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "space-y-4"
              )}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <Card>
              <CardContent className="py-6">
                {store.about ? (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{store.about}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No about information yet.
                  </p>
                )}

                {store.support_email && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-2">Contact</h3>
                    <a 
                      href={`mailto:${store.support_email}`} 
                      className="flex items-center gap-2 text-violet-600 hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {store.support_email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          {store.show_reviews && (
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-muted-foreground">Store reviews coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, viewMode = 'grid' }) => {
  const navigate = useNavigate();

  if (viewMode === 'list') {
    return (
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navigate(`/marketplace/${product.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{product.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className={cn("font-semibold", product.is_free ? "text-emerald-600" : "text-slate-900")}>
                  {product.is_free ? 'Free' : `$${(product.price_cents / 100).toFixed(2)}`}
                </span>
                {product.avg_rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {product.avg_rating.toFixed(1)}
                  </span>
                )}
                <span className="text-muted-foreground">{product.play_count} plays</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => navigate(`/marketplace/${product.id}`)}
      data-testid={`product-card-${product.id}`}
    >
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        {product.thumbnail_url ? (
          <img 
            src={product.thumbnail_url} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
            <Play className="w-12 h-12 text-violet-400" />
          </div>
        )}
        <Badge className={cn(
          "absolute top-2 right-2",
          product.is_free ? "bg-emerald-600" : "bg-slate-900"
        )}>
          {product.is_free ? 'Free' : `$${(product.price_cents / 100).toFixed(2)}`}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1">{product.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center gap-1">
            {product.avg_rating > 0 ? (
              <>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-medium">{product.avg_rating.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-muted-foreground">No ratings yet</span>
            )}
          </div>
          <span className="text-muted-foreground">{product.play_count} plays</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorStore;
