/**
 * PublishDialog - Dialog for publishing a game to the marketplace.
 */
import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  Globe, 
  Tag,
  DollarSign,
  Search as SearchIcon,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import marketplaceService from '@/services/marketplaceService';
import { toast } from 'sonner';

const PublishDialog = ({ open, onOpenChange, game, onPublished }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  const [form, setForm] = useState({
    category: '',
    subcategory: '',
    tags: [],
    is_free: true,
    price_cents: 0,
    license_type: 'single',
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  });

  useEffect(() => {
    if (open) {
      loadCategories();
      // Pre-fill from game data
      setForm(prev => ({
        ...prev,
        seo_title: game?.title || '',
        seo_description: game?.description || ''
      }));
    }
  }, [open, game]);

  const loadCategories = async () => {
    try {
      const data = await marketplaceService.getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && form.tags.length < 10) {
      const tag = tagInput.trim().toLowerCase();
      if (!form.tags.includes(tag)) {
        setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setForm(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(t => t !== tag) 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.category) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const publishData = {
        game_id: game.id,
        category: form.category,
        subcategory: form.subcategory || null,
        tags: form.tags,
        is_free: form.is_free,
        price_cents: form.is_free ? 0 : form.price_cents,
        license_type: form.license_type,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        seo_keywords: form.seo_keywords
      };

      const result = await marketplaceService.publish(publishData);
      toast.success('Game published to marketplace!');
      onPublished(result);
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to publish game');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === form.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-600" />
            Publish to Marketplace
          </DialogTitle>
          <DialogDescription>
            Make your game discoverable by other educators.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <Label>Category *</Label>
            <Select 
              value={form.category} 
              onValueChange={(v) => setForm(prev => ({ ...prev, category: v, subcategory: '' }))}
            >
              <SelectTrigger className="mt-1" data-testid="category-select">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          {selectedCategory?.subcategories?.length > 0 && (
            <div>
              <Label>Subcategory</Label>
              <Select 
                value={form.subcategory} 
                onValueChange={(v) => setForm(prev => ({ ...prev, subcategory: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a subcategory (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tags */}
          <div>
            <Label className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags (up to 10)
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Free Game
                </Label>
                <p className="text-sm text-muted-foreground">
                  Anyone can access this game for free
                </p>
              </div>
              <Switch
                checked={form.is_free}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_free: checked }))}
              />
            </div>

            {!form.is_free && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (USD)</Label>
                  <Input
                    type="number"
                    min="0.99"
                    step="0.01"
                    value={(form.price_cents / 100).toFixed(2)}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      price_cents: Math.round(parseFloat(e.target.value) * 100) 
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>License Type</Label>
                  <Select 
                    value={form.license_type} 
                    onValueChange={(v) => setForm(prev => ({ ...prev, license_type: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single User</SelectItem>
                      <SelectItem value="class">Classroom (30 students)</SelectItem>
                      <SelectItem value="school">School-wide</SelectItem>
                      <SelectItem value="district">District-wide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <SearchIcon className="w-4 h-4" />
              SEO Settings
            </Label>
            
            <div>
              <Label className="text-sm text-muted-foreground">SEO Title</Label>
              <Input
                value={form.seo_title}
                onChange={(e) => setForm(prev => ({ ...prev, seo_title: e.target.value }))}
                placeholder={game?.title}
                maxLength={60}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.seo_title.length}/60 characters
              </p>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">SEO Description</Label>
              <Textarea
                value={form.seo_description}
                onChange={(e) => setForm(prev => ({ ...prev, seo_description: e.target.value }))}
                placeholder={game?.description}
                maxLength={160}
                rows={2}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.seo_description.length}/160 characters
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="publish-btn">
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Publish to Marketplace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PublishDialog;
