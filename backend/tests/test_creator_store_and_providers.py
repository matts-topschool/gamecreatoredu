"""
Test Creator Store and Provider Integration endpoints.
Tests:
- GET /api/integrations/providers - Only Google Classroom available, others Coming Soon
- POST /api/marketplace/store - Create creator store
- GET /api/marketplace/store/{slug} - Get store with featured products
- GET /api/marketplace/store/{slug}/products - Get store products with sorting
- POST /api/marketplace/store/{slug}/follow - Follow store
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
USER1 = {"email": "testuser@example.com", "password": "testpassword123"}
USER2 = {"email": "teacher2@example.com", "password": "testpassword123"}

# Known test data
STORE_SLUG = "test-teacher-games"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session."""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def user1_token(api_client):
    """Get auth token for user1 (testuser@example.com) - store owner."""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=USER1)
    if response.status_code == 200:
        data = response.json()
        # Token is nested: token.access_token
        token = data.get("token", {}).get("access_token") or data.get("access_token")
        if token:
            return token
    pytest.skip("User1 authentication failed")


@pytest.fixture(scope="module")
def user2_token(api_client):
    """Get auth token for user2 (teacher2@example.com) - follower."""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=USER2)
    if response.status_code == 200:
        data = response.json()
        # Token is nested: token.access_token
        token = data.get("token", {}).get("access_token") or data.get("access_token")
        if token:
            return token
    pytest.skip("User2 authentication failed")


class TestIntegrationProviders:
    """Test /api/integrations/providers - LMS provider availability."""
    
    def test_get_providers_returns_list(self, api_client):
        """GET /api/integrations/providers returns provider list."""
        response = api_client.get(f"{BASE_URL}/api/integrations/providers")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "providers" in data
        assert "total" in data
        assert len(data["providers"]) > 0
        print(f"✓ Found {len(data['providers'])} providers")
    
    def test_google_classroom_is_available(self, api_client):
        """GET /api/integrations/providers - Google Classroom should be available (not coming_soon)."""
        response = api_client.get(f"{BASE_URL}/api/integrations/providers")
        assert response.status_code == 200
        
        data = response.json()
        providers = data["providers"]
        
        # Find Google Classroom
        google_classroom = next((p for p in providers if p["id"] == "google_classroom"), None)
        assert google_classroom is not None, "Google Classroom provider not found"
        assert google_classroom.get("available") is True, "Google Classroom should be available"
        # If coming_soon is not present, it defaults to False (not coming soon = available)
        assert google_classroom.get("coming_soon") is not True, "Google Classroom should not be coming_soon"
        print(f"✓ Google Classroom is available: {google_classroom['name']}")
    
    def test_other_lms_providers_coming_soon(self, api_client):
        """GET /api/integrations/providers - Canvas, Clever, ClassLink should be Coming Soon."""
        response = api_client.get(f"{BASE_URL}/api/integrations/providers")
        assert response.status_code == 200
        
        data = response.json()
        providers = data["providers"]
        
        coming_soon_providers = ["canvas", "clever", "classlink", "powerschool", "schoology"]
        
        for provider_id in coming_soon_providers:
            provider = next((p for p in providers if p["id"] == provider_id), None)
            if provider:
                assert provider.get("coming_soon") is True, f"{provider_id} should be coming_soon"
                assert provider.get("available") is False, f"{provider_id} should not be available"
                print(f"✓ {provider['name']} is Coming Soon")
    
    def test_file_import_providers_available(self, api_client):
        """GET /api/integrations/providers - CTF and CSV import should be available."""
        response = api_client.get(f"{BASE_URL}/api/integrations/providers")
        assert response.status_code == 200
        
        data = response.json()
        providers = data["providers"]
        
        # CTF import should be available (available=True)
        ctf_import = next((p for p in providers if p["id"] == "ctf_import"), None)
        assert ctf_import is not None, "CTF Import provider not found"
        assert ctf_import.get("available") is True, "CTF Import should be available"
        
        # CSV import should be available
        csv_import = next((p for p in providers if p["id"] == "csv_import"), None)
        assert csv_import is not None, "CSV Import provider not found"
        assert csv_import.get("available") is True, "CSV Import should be available"
        
        print(f"✓ CTF Import and CSV Import are available")
    
    def test_providers_count_with_regions(self, api_client):
        """GET /api/integrations/providers - Should have UK and US providers."""
        response = api_client.get(f"{BASE_URL}/api/integrations/providers")
        assert response.status_code == 200
        
        data = response.json()
        providers = data["providers"]
        
        # Count by region
        uk_providers = [p for p in providers if p.get("region") == "uk"]
        us_providers = [p for p in providers if p.get("region") == "us"]
        global_providers = [p for p in providers if p.get("region") == "global"]
        
        assert len(uk_providers) > 0, "Should have UK providers"
        assert len(us_providers) > 0, "Should have US providers"
        assert len(global_providers) > 0, "Should have global providers"
        
        print(f"✓ Found {len(uk_providers)} UK, {len(us_providers)} US, {len(global_providers)} global providers")


class TestCreatorStore:
    """Test Creator Store endpoints."""
    
    def test_get_store_by_slug(self, api_client):
        """GET /api/marketplace/store/{slug} returns store with featured products."""
        response = api_client.get(f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        store = response.json()
        
        # Validate store structure
        assert "id" in store
        assert "user_id" in store
        assert "store_name" in store
        assert "slug" in store
        assert store["slug"] == STORE_SLUG
        
        # Stats fields
        assert "total_products" in store
        assert "follower_count" in store
        assert "avg_rating" in store
        
        # Featured products
        assert "featured_products" in store
        assert isinstance(store["featured_products"], list)
        
        print(f"✓ Store '{store['store_name']}' found with {len(store['featured_products'])} featured products")
    
    def test_get_store_featured_products_have_data(self, api_client):
        """GET /api/marketplace/store/{slug} - featured products have proper structure."""
        response = api_client.get(f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}")
        assert response.status_code == 200
        
        store = response.json()
        products = store.get("featured_products", [])
        
        if len(products) > 0:
            product = products[0]
            assert "id" in product
            assert "title" in product
            assert "creator_id" in product
            assert "creator_name" in product
            assert "is_free" in product
            print(f"✓ Featured product '{product['title']}' has valid structure")
        else:
            print("⚠ No featured products to test")
    
    def test_get_store_products_with_sorting(self, api_client):
        """GET /api/marketplace/store/{slug}/products returns products with sorting."""
        # Test default sorting (newest)
        response = api_client.get(f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/products")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "listings" in data
        assert "total" in data
        assert "page" in data
        assert "total_pages" in data
        
        print(f"✓ Store products: {data['total']} total, page {data['page']} of {data['total_pages']}")
    
    def test_get_store_products_sort_by_popular(self, api_client):
        """GET /api/marketplace/store/{slug}/products?sort_by=popular works."""
        response = api_client.get(f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/products?sort_by=popular")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        print(f"✓ Sort by popular: {len(data['listings'])} products returned")
    
    def test_get_store_products_sort_by_rating(self, api_client):
        """GET /api/marketplace/store/{slug}/products?sort_by=rating works."""
        response = api_client.get(f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/products?sort_by=rating")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        print(f"✓ Sort by rating: {len(data['listings'])} products returned")
    
    def test_get_store_products_sort_by_price(self, api_client):
        """GET /api/marketplace/store/{slug}/products?sort_by=price_low works."""
        response = api_client.get(f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/products?sort_by=price_low")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        print(f"✓ Sort by price_low: {len(data['listings'])} products returned")
    
    def test_get_nonexistent_store_returns_404(self, api_client):
        """GET /api/marketplace/store/{slug} returns 404 for unknown store."""
        response = api_client.get(f"{BASE_URL}/api/marketplace/store/nonexistent-store-slug-12345")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Non-existent store returns 404")


class TestCreatorStoreCreate:
    """Test store creation endpoint."""
    
    def test_create_store_requires_auth(self, api_client):
        """POST /api/marketplace/store requires authentication."""
        response = api_client.post(
            f"{BASE_URL}/api/marketplace/store?store_name=Test%20Store&tagline=Test"
        )
        # Accept both 401 and 403 for unauthenticated requests
        assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code}"
        print("✓ Store creation requires authentication")
    
    def test_create_store_with_auth_existing_user(self, api_client, user1_token):
        """POST /api/marketplace/store - user with existing store gets error."""
        headers = {"Authorization": f"Bearer {user1_token}"}
        response = api_client.post(
            f"{BASE_URL}/api/marketplace/store?store_name=Another%20Store",
            headers=headers
        )
        # User1 already has a store, should get 400
        assert response.status_code == 400, f"Expected 400 (already has store), got {response.status_code}"
        assert "already have a store" in response.text.lower()
        print("✓ Duplicate store creation blocked")


class TestStoreFollow:
    """Test store follow/unfollow functionality."""
    
    def test_follow_store_requires_auth(self, api_client):
        """POST /api/marketplace/store/{slug}/follow requires authentication."""
        response = api_client.post(f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/follow")
        # Accept both 401 and 403 for unauthenticated requests
        assert response.status_code in [401, 403], f"Expected 401 or 403, got {response.status_code}"
        print("✓ Follow requires authentication")
    
    def test_follow_store_success(self, api_client, user2_token):
        """POST /api/marketplace/store/{slug}/follow - user2 can follow user1's store."""
        headers = {"Authorization": f"Bearer {user2_token}"}
        response = api_client.post(
            f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/follow",
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") is True
        assert data.get("is_following") is True
        print(f"✓ User2 followed store: {data.get('message')}")
    
    def test_check_following_status(self, api_client, user2_token):
        """GET /api/marketplace/store/{slug}/is-following returns status."""
        headers = {"Authorization": f"Bearer {user2_token}"}
        response = api_client.get(
            f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/is-following",
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "is_following" in data
        print(f"✓ Following status: {data['is_following']}")
    
    def test_follow_own_store_blocked(self, api_client, user1_token):
        """POST /api/marketplace/store/{slug}/follow - can't follow own store."""
        headers = {"Authorization": f"Bearer {user1_token}"}
        response = api_client.post(
            f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/follow",
            headers=headers
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        assert "own store" in response.text.lower()
        print("✓ Following own store blocked")
    
    def test_unfollow_store(self, api_client, user2_token):
        """DELETE /api/marketplace/store/{slug}/follow - unfollow works."""
        headers = {"Authorization": f"Bearer {user2_token}"}
        response = api_client.delete(
            f"{BASE_URL}/api/marketplace/store/{STORE_SLUG}/follow",
            headers=headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("is_following") is False
        print(f"✓ User2 unfollowed store: {data.get('message')}")


class TestMarketplaceListing:
    """Test marketplace listing creator link."""
    
    def test_marketplace_listing_has_creator_info(self, api_client):
        """GET /api/marketplace/browse returns listings with creator name."""
        response = api_client.get(f"{BASE_URL}/api/marketplace/browse")
        assert response.status_code == 200
        
        data = response.json()
        listings = data.get("listings", [])
        
        if len(listings) > 0:
            listing = listings[0]
            assert "creator_id" in listing
            assert "creator_name" in listing
            print(f"✓ Listing '{listing['title']}' has creator '{listing['creator_name']}'")
        else:
            print("⚠ No listings to verify")


class TestFeaturedStores:
    """Test featured stores endpoint."""
    
    def test_get_featured_stores(self, api_client):
        """GET /api/marketplace/stores/featured returns store list."""
        response = api_client.get(f"{BASE_URL}/api/marketplace/stores/featured")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        # Response is a list
        assert isinstance(data, list)
        print(f"✓ Featured stores: {len(data)} stores returned")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
