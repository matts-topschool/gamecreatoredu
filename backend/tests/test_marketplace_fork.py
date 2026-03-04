"""
Test Marketplace Fork & Derivative Sales Feature
Tests: 
- Forking games from marketplace
- Publishing forked games (allowed/blocked based on derivative sales permission)
- Marketplace browse showing fork status
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test users
USER1 = {"email": "testuser@example.com", "password": "testpassword123"}
USER2 = {"email": "teacher2@example.com", "password": "testpassword123"}

# Test games (seeded by main agent)
GAME_ALLOWS_DERIVATIVES = "f2cb526e-e085-4fe4-bf47-c6e6d9568472"  # Math Quiz for Testing
GAME_NO_DERIVATIVES = "9382edd4-af3e-48dc-9a2c-0bd4bd4c6341"  # Science Quiz - No Resale


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def user1_token(api_client):
    """Get token for user1 (testuser@example.com)"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=USER1)
    if response.status_code == 200:
        data = response.json()
        token = data.get('token', {})
        if isinstance(token, dict):
            return token.get('access_token', '')
        return token
    pytest.skip("User1 authentication failed")


@pytest.fixture(scope="module")
def user2_token(api_client):
    """Get token for user2 (teacher2@example.com)"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json=USER2)
    if response.status_code == 200:
        data = response.json()
        token = data.get('token', {})
        if isinstance(token, dict):
            return token.get('access_token', '')
        return token
    pytest.skip("User2 authentication failed")


class TestMarketplaceBrowse:
    """Test marketplace browse endpoints"""
    
    def test_browse_returns_published_games(self, api_client):
        """Browse endpoint returns published games"""
        response = api_client.get(f"{BASE_URL}/api/marketplace/browse?limit=10")
        assert response.status_code == 200
        
        data = response.json()
        assert "listings" in data
        assert "total" in data
        assert isinstance(data["listings"], list)
        print(f"Found {data['total']} published games")
    
    def test_browse_shows_derivative_sales_status(self, api_client):
        """Listings include allow_derivative_sales field"""
        response = api_client.get(f"{BASE_URL}/api/marketplace/browse")
        assert response.status_code == 200
        
        data = response.json()
        if data["listings"]:
            listing = data["listings"][0]
            assert "allow_derivative_sales" in listing
            assert "is_forked" in listing
            print(f"Game '{listing['title']}' - allow_derivative_sales: {listing['allow_derivative_sales']}, is_forked: {listing['is_forked']}")


class TestMarketplaceListing:
    """Test single listing endpoint"""
    
    def test_get_listing_shows_derivative_status(self, api_client):
        """Single listing shows allow_derivative_sales status"""
        response = api_client.get(f"{BASE_URL}/api/marketplace/game/{GAME_ALLOWS_DERIVATIVES}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == GAME_ALLOWS_DERIVATIVES
        assert data["allow_derivative_sales"] == True
        print(f"Game '{data['title']}' allows derivative sales")
    
    def test_get_listing_no_derivatives(self, api_client):
        """Listing with derivatives disabled shows correct status"""
        response = api_client.get(f"{BASE_URL}/api/marketplace/game/{GAME_NO_DERIVATIVES}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["allow_derivative_sales"] == False
        print(f"Game '{data['title']}' does NOT allow derivative sales")


class TestForkGame:
    """Test game forking functionality"""
    
    def test_fork_game_success(self, api_client, user2_token):
        """User can fork a game they don't own"""
        response = api_client.post(
            f"{BASE_URL}/api/marketplace/game/{GAME_ALLOWS_DERIVATIVES}/fork",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "forked_game_id" in data
        assert data["original_game_id"] == GAME_ALLOWS_DERIVATIVES
        assert "can_resell" in data
        print(f"Forked game created: {data['forked_game_id']}, can_resell: {data['can_resell']}")
    
    def test_fork_game_returns_can_resell_true(self, api_client, user2_token):
        """Forking game with allow_derivative_sales=true returns can_resell=true"""
        response = api_client.post(
            f"{BASE_URL}/api/marketplace/game/{GAME_ALLOWS_DERIVATIVES}/fork",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["can_resell"] == True
        print("Fork from game with derivatives allowed correctly shows can_resell=True")
    
    def test_fork_game_returns_can_resell_false(self, api_client, user2_token):
        """Forking game with allow_derivative_sales=false returns can_resell=false"""
        response = api_client.post(
            f"{BASE_URL}/api/marketplace/game/{GAME_NO_DERIVATIVES}/fork",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["can_resell"] == False
        print("Fork from game without derivatives allowed correctly shows can_resell=False")
    
    def test_cannot_fork_own_game(self, api_client, user1_token):
        """User cannot fork their own game"""
        response = api_client.post(
            f"{BASE_URL}/api/marketplace/game/{GAME_ALLOWS_DERIVATIVES}/fork",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 400
        assert "cannot fork your own game" in response.json().get("detail", "").lower()
        print("Correctly blocked user from forking own game")
    
    def test_fork_requires_auth(self, api_client):
        """Fork endpoint requires authentication"""
        response = api_client.post(f"{BASE_URL}/api/marketplace/game/{GAME_ALLOWS_DERIVATIVES}/fork")
        assert response.status_code in [401, 403]
        print("Fork endpoint correctly requires authentication")


class TestPublishForkedGame:
    """Test publishing forked games - derivative sales restrictions"""
    
    def test_publish_forked_game_allowed(self, api_client, user2_token):
        """Can publish forked game if original allows derivatives"""
        # First fork the game
        fork_response = api_client.post(
            f"{BASE_URL}/api/marketplace/game/{GAME_ALLOWS_DERIVATIVES}/fork",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert fork_response.status_code == 200
        forked_game_id = fork_response.json()["forked_game_id"]
        
        # Try to publish the forked game
        publish_response = api_client.post(
            f"{BASE_URL}/api/marketplace/publish",
            headers={"Authorization": f"Bearer {user2_token}"},
            json={
                "game_id": forked_game_id,
                "category": "mathematics",
                "tags": ["test-forked"],
                "is_free": True,
                "allow_derivative_sales": False
            }
        )
        assert publish_response.status_code == 200
        
        data = publish_response.json()
        assert data["is_forked"] == True
        assert data["forked_from_id"] == GAME_ALLOWS_DERIVATIVES
        print(f"Successfully published forked game: {forked_game_id}")
    
    def test_publish_forked_game_blocked(self, api_client, user2_token):
        """Cannot publish forked game if original doesn't allow derivatives"""
        # First fork the game
        fork_response = api_client.post(
            f"{BASE_URL}/api/marketplace/game/{GAME_NO_DERIVATIVES}/fork",
            headers={"Authorization": f"Bearer {user2_token}"}
        )
        assert fork_response.status_code == 200
        forked_game_id = fork_response.json()["forked_game_id"]
        
        # Try to publish the forked game - should be blocked
        publish_response = api_client.post(
            f"{BASE_URL}/api/marketplace/publish",
            headers={"Authorization": f"Bearer {user2_token}"},
            json={
                "game_id": forked_game_id,
                "category": "science",
                "tags": ["test-forked"],
                "is_free": True,
                "allow_derivative_sales": False
            }
        )
        assert publish_response.status_code == 403
        assert "derivative" in publish_response.json().get("detail", "").lower()
        print("Correctly blocked publishing of forked game from original that disallows derivatives")


class TestPublishOriginalGame:
    """Test publishing original games with derivative sales flag"""
    
    def test_publish_with_allow_derivative_sales_true(self, api_client, user1_token):
        """Can publish game with allow_derivative_sales=true"""
        # Create a new test game first
        game_response = api_client.post(
            f"{BASE_URL}/api/games",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={
                "title": f"TEST_Derivative_True_{uuid.uuid4().hex[:8]}",
                "description": "Test game for derivative sales",
                "spec": {
                    "meta": {"title": "Test", "game_type": "quiz"},
                    "content": {"questions": [{"id": "q1", "stem": "Test?", "options": [{"id": "a", "text": "Yes", "is_correct": True}]}]},
                    "settings": {}
                }
            }
        )
        assert game_response.status_code in [200, 201]
        game_id = game_response.json()["id"]
        
        # Publish with allow_derivative_sales=true
        publish_response = api_client.post(
            f"{BASE_URL}/api/marketplace/publish",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={
                "game_id": game_id,
                "category": "mathematics",
                "tags": ["test"],
                "is_free": True,
                "allow_derivative_sales": True
            }
        )
        assert publish_response.status_code == 200
        
        data = publish_response.json()
        assert data["allow_derivative_sales"] == True
        print(f"Published game {game_id} with allow_derivative_sales=True")
    
    def test_publish_with_allow_derivative_sales_false(self, api_client, user1_token):
        """Can publish game with allow_derivative_sales=false"""
        # Create a new test game first
        game_response = api_client.post(
            f"{BASE_URL}/api/games",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={
                "title": f"TEST_Derivative_False_{uuid.uuid4().hex[:8]}",
                "description": "Test game - no derivative sales",
                "spec": {
                    "meta": {"title": "Test", "game_type": "quiz"},
                    "content": {"questions": [{"id": "q1", "stem": "Test?", "options": [{"id": "a", "text": "Yes", "is_correct": True}]}]},
                    "settings": {}
                }
            }
        )
        assert game_response.status_code in [200, 201]
        game_id = game_response.json()["id"]
        
        # Publish with allow_derivative_sales=false
        publish_response = api_client.post(
            f"{BASE_URL}/api/marketplace/publish",
            headers={"Authorization": f"Bearer {user1_token}"},
            json={
                "game_id": game_id,
                "category": "mathematics",
                "tags": ["test"],
                "is_free": True,
                "allow_derivative_sales": False
            }
        )
        assert publish_response.status_code == 200
        
        data = publish_response.json()
        assert data["allow_derivative_sales"] == False
        print(f"Published game {game_id} with allow_derivative_sales=False")


class TestCategories:
    """Test marketplace categories endpoint"""
    
    def test_get_categories(self, api_client):
        """Categories endpoint returns valid data"""
        response = api_client.get(f"{BASE_URL}/api/marketplace/categories")
        assert response.status_code == 200
        
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) > 0
        
        # Check structure
        cat = data["categories"][0]
        assert "id" in cat
        assert "name" in cat
        print(f"Found {len(data['categories'])} categories")
