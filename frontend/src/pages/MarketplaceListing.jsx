/**
 * MarketplaceListing - Single game detail page in marketplace.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Star,
  Users,
  Play,
  Heart,
  Share2,
  Gamepad2,
  BookOpen,
  Clock,
  GraduationCap,
  Trophy,
  Loader2,
  CheckCircle,
  ShoppingCart,
  User,
  MessageSquare,
  GitFork,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import Leaderboard from '@/components/game/Leaderboard';
import marketplaceService from '@/services/marketplaceService';
import useAuthStore from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * Star Rating Input
 */
const StarRating = ({ value, onChange, readonly = false }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={cn(
            "transition-colors",
            readonly ? "cursor-default" : "cursor-pointer"
          )}
        >
          <Star 
            className={cn(
              "w-6 h-6",
              (hover || value) >= star 
                ? "fill-amber-400 text-amber-400" 
                : "text-slate-300"
            )}
          />
        </button>
      ))}
    </div>
  );
};

/**
 * Review Card
 */
const ReviewCard = ({ review }) => {
  const date = new Date(review.created_at).toLocaleDateString();
  
  return (
    <div className="border-b border-slate-100 pb-4 mb-4 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
            <User className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="font-medium">{review.reviewer_name}</p>
            <div className="flex items-center gap-2">
              <StarRating value={review.rating} readonly />
              {review.verified_purchase && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      
      {review.title && (
        <h4 className="font-medium mb-1">{review.title}</h4>
      )}
      {review.content && (
        <p className="text-muted-foreground">{review.content}</p>
      )}
    </div>
  );
};

/**
 * Main MarketplaceListing Page
 */
const MarketplaceListing = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [acquiring, setAcquiring] = useState(false);
  const [forking, setForking] = useState(false);
  const [acquired, setAcquired] = useState(false);
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadListing();
    loadReviews();
  }, [gameId]);

  const loadListing = async () => {
    setLoading(true);
    try {
      const data = await marketplaceService.getListing(gameId);
      setListing(data);
    } catch (err) {
      toast.error('Game not found');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await marketplaceService.getReviews(gameId);
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleAcquire = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to get this game');
      navigate('/login');
      return;
    }

    setAcquiring(true);
    try {
      await marketplaceService.acquireGame(gameId);
      setAcquired(true);
      toast.success('Game added to your library!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to acquire game');
    } finally {
      setAcquiring(false);
    }
  };

  const handleFork = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to fork this game');
      navigate('/login');
      return;
    }

    setForking(true);
    try {
      const result = await marketplaceService.forkGame(gameId);
      toast.success(result.message || 'Game forked successfully!');
      
      // Navigate to the forked game in studio
      navigate(`/studio/${result.forked_game_id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to fork game');
    } finally {
      setForking(false);
    }
  };

  const handlePlay = () => {
    navigate(`/play/${gameId}`);
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      await navigator.share({
        title: listing?.title,
        text: listing?.description,
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to leave a review');
      return;
    }

    setSubmittingReview(true);
    try {
      await marketplaceService.createReview(gameId, reviewForm);
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', content: '' });
      loadReviews();
      loadListing(); // Refresh to get new rating
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!listing) return null;

  const isOwner = user?.id === listing.creator_id;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="marketplace-listing-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/marketplace')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <Card>
              <div className="relative h-64 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-t-lg overflow-hidden">
                {listing.thumbnail_url ? (
                  <img 
                    src={listing.thumbnail_url} 
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gamepad2 className="w-24 h-24 text-white/30" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold font-outfit mb-2">
                      {listing.title}
                    </h1>
                    <p className="text-muted-foreground">
                      by <span className="text-violet-600 font-medium">{listing.creator_name}</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {listing.avg_rating > 0 && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-semibold">{listing.avg_rating.toFixed(1)}</span>
                        <span className="text-muted-foreground text-sm">
                          ({listing.review_count})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {listing.play_count.toLocaleString()} plays
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Gamepad2 className="w-4 h-4" />
                    <span className="capitalize">{listing.game_type}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {listing.grade_levels?.map(g => (
                    <Badge key={g} variant="outline">
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Grade {g}
                    </Badge>
                  ))}
                  {listing.subjects?.map(s => (
                    <Badge key={s} variant="secondary" className="capitalize">
                      {s}
                    </Badge>
                  ))}
                  {listing.tags?.map(t => (
                    <Badge key={t} variant="outline" className="capitalize">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="about">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({listing.review_count})</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {listing.description || 'No description provided.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <CardTitle>Reviews</CardTitle>
                    {isAuthenticated && !isOwner && (
                      <Button 
                        variant="outline"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Write Review
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Review Form */}
                    {showReviewForm && (
                      <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-slate-50 rounded-lg">
                        <div className="space-y-4">
                          <div>
                            <Label>Rating</Label>
                            <StarRating 
                              value={reviewForm.rating} 
                              onChange={(r) => setReviewForm(prev => ({ ...prev, rating: r }))}
                            />
                          </div>
                          <div>
                            <Label>Title (optional)</Label>
                            <input
                              type="text"
                              value={reviewForm.title}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Sum up your experience"
                              className="w-full mt-1 px-3 py-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <Label>Review (optional)</Label>
                            <Textarea
                              value={reviewForm.content}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                              placeholder="Share your thoughts..."
                              rows={3}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" disabled={submittingReview}>
                              {submittingReview && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Submit Review
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => setShowReviewForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No reviews yet</p>
                        <p className="text-sm">Be the first to review this game!</p>
                      </div>
                    ) : (
                      <div>
                        {reviews.map(review => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard" className="mt-4">
                <Leaderboard gameId={gameId} showTitle={false} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Action Card */}
            <Card>
              <CardContent className="p-6">
                {/* Price */}
                <div className="text-center mb-4">
                  <span className={cn(
                    "text-3xl font-bold",
                    listing.is_free ? "text-emerald-600" : "text-slate-900"
                  )}>
                    {listing.is_free ? 'Free' : `$${(listing.price_cents / 100).toFixed(2)}`}
                  </span>
                </div>

                {/* Forked indicator */}
                {listing.is_forked && (
                  <Alert className="mb-4 border-violet-200 bg-violet-50">
                    <GitFork className="h-4 w-4 text-violet-600" />
                    <AlertDescription className="text-violet-800 text-sm">
                      This is a community adaptation
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  {isOwner ? (
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/studio/${gameId}`)}
                      data-testid="edit-game-btn"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Game
                    </Button>
                  ) : acquired ? (
                    <>
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700" 
                        onClick={handlePlay}
                        data-testid="play-now-btn"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Now
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={handleFork}
                        disabled={forking}
                        data-testid="fork-game-btn"
                      >
                        {forking ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <GitFork className="w-4 h-4 mr-2" />
                        )}
                        Fork & Customize
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={handleAcquire}
                        disabled={acquiring}
                        data-testid="acquire-game-btn"
                      >
                        {acquiring ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 mr-2" />
                        )}
                        {listing.is_free ? 'Get Free' : 'Purchase'}
                      </Button>
                      {/* Show fork option for free games even before acquiring */}
                      {listing.is_free && (
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={handleFork}
                          disabled={forking}
                          data-testid="fork-game-btn"
                        >
                          {forking ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <GitFork className="w-4 h-4 mr-2" />
                          )}
                          Fork & Customize
                        </Button>
                      )}
                    </>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handlePlay}
                      data-testid="preview-btn"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Derivative sales info */}
                {listing.allow_derivative_sales && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Derivative sales allowed - you can modify and resell
                    </p>
                  </div>
                )}
                {!listing.allow_derivative_sales && !isOwner && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Personal use only - cannot resell modifications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creator Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium">{listing.creator_name}</p>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-sm text-violet-600"
                      onClick={() => navigate(`/marketplace/publisher/${listing.creator_id}`)}
                    >
                      View all games
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium capitalize">
                    {listing.category?.replace('_', ' ') || 'Uncategorized'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Game Type</span>
                  <span className="font-medium capitalize">{listing.game_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">License</span>
                  <span className="font-medium capitalize">{listing.license_type}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceListing;
