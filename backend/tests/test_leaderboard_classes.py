"""
Test Leaderboard and Classes APIs
Features:
1. Leaderboard Submit: POST /api/leaderboard/results
2. Leaderboard Fetch: GET /api/leaderboard/game/{gameId}
3. Player Stats: GET /api/leaderboard/player/stats
4. Class Create: POST /api/classes
5. Class Join: POST /api/classes/join/{code}
6. Integration Providers: GET /api/classes/integrations/providers
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123456"
TEST_GAME_ID = "09feb8bd-0074-414f-8b58-bfbc7159f935"
TEST_JOIN_CODE = "6222DD75"


class TestAuthFixture:
    """Authentication helper"""
    
    @staticmethod
    def get_auth_token():
        """Get auth token for test user"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            # Token may be in {"token": "..."} or {"token": {"access_token": "..."}}
            token_data = data.get("token")
            if isinstance(token_data, dict):
                return token_data.get("access_token")
            return token_data
        return None


@pytest.fixture(scope="module")
def auth_token():
    """Module-scoped auth token"""
    token = TestAuthFixture.get_auth_token()
    if not token:
        pytest.skip("Authentication failed - cannot get token")
    return token


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestLeaderboardSubmit:
    """Test POST /api/leaderboard/results - Submit game result"""
    
    def test_submit_game_result_authenticated(self, auth_headers):
        """Submit a game result with authentication"""
        unique_name = f"TEST_Player_{uuid.uuid4().hex[:8]}"
        payload = {
            "game_id": TEST_GAME_ID,
            "player_name": unique_name,
            "score": 85,
            "accuracy": 0.85,
            "questions_total": 10,
            "questions_correct": 8,
            "time_taken_seconds": 120,
            "max_combo": 5,
            "hints_used": 1,
            "damage_dealt": 0,
            "enemy_defeated": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leaderboard/results",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should have 'id'"
        assert data["game_id"] == TEST_GAME_ID, "game_id should match"
        assert data["player_name"] == unique_name, "player_name should match"
        assert data["score"] == 85, "score should match"
        assert data["accuracy"] == 0.85, "accuracy should match"
        assert data["questions_total"] == 10, "questions_total should match"
        assert data["questions_correct"] == 8, "questions_correct should match"
        assert data["questions_wrong"] == 2, "questions_wrong should be calculated (10-8=2)"
        print(f"✓ Game result submitted with id: {data['id']}")
    
    def test_submit_game_result_unauthenticated(self):
        """Submit a game result without authentication (should still work for guests)"""
        unique_name = f"TEST_Guest_{uuid.uuid4().hex[:8]}"
        payload = {
            "game_id": TEST_GAME_ID,
            "player_name": unique_name,
            "score": 50,
            "accuracy": 0.5,
            "questions_total": 10,
            "questions_correct": 5,
            "time_taken_seconds": 180,
            "max_combo": 2
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leaderboard/results",
            json=payload
        )
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["player_id"] is None, "player_id should be None for guest"
        assert data["player_name"] == unique_name, "player_name should match"
        print(f"✓ Guest game result submitted with id: {data['id']}")
    
    def test_submit_game_result_invalid_game(self, auth_headers):
        """Submit result for non-existent game should fail"""
        payload = {
            "game_id": "non-existent-game-id",
            "player_name": "Test Player",
            "score": 100,
            "accuracy": 1.0,
            "questions_total": 10,
            "questions_correct": 10,
            "time_taken_seconds": 60
        }
        
        response = requests.post(
            f"{BASE_URL}/api/leaderboard/results",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 404, f"Expected 404 for non-existent game, got {response.status_code}"
        print("✓ Submit result for non-existent game returns 404")


class TestLeaderboardFetch:
    """Test GET /api/leaderboard/game/{gameId} - Get leaderboard for a game"""
    
    def test_get_game_leaderboard(self):
        """Get leaderboard for a game (no auth required)"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/game/{TEST_GAME_ID}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "game_id" in data, "Response should have 'game_id'"
        assert data["game_id"] == TEST_GAME_ID, "game_id should match"
        assert "game_title" in data, "Response should have 'game_title'"
        assert "entries" in data, "Response should have 'entries'"
        assert isinstance(data["entries"], list), "entries should be a list"
        assert "total_players" in data, "Response should have 'total_players'"
        assert "leaderboard_type" in data, "Response should have 'leaderboard_type'"
        assert "scope" in data, "Response should have 'scope'"
        
        # Check entries are sorted by rank
        if len(data["entries"]) > 1:
            for i in range(len(data["entries"]) - 1):
                assert data["entries"][i]["rank"] < data["entries"][i+1]["rank"], "Entries should be sorted by rank"
        
        print(f"✓ Leaderboard retrieved: {len(data['entries'])} entries, {data['total_players']} total players")
    
    def test_get_game_leaderboard_with_limit(self):
        """Get leaderboard with custom limit"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/game/{TEST_GAME_ID}?limit=5")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert len(data["entries"]) <= 5, "Should return at most 5 entries"
        print(f"✓ Leaderboard with limit=5: {len(data['entries'])} entries")
    
    def test_get_game_leaderboard_by_accuracy(self):
        """Get leaderboard sorted by accuracy"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/game/{TEST_GAME_ID}?type=accuracy")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["leaderboard_type"] == "accuracy", "leaderboard_type should be 'accuracy'"
        print(f"✓ Leaderboard by accuracy retrieved")
    
    def test_get_game_leaderboard_invalid_game(self):
        """Get leaderboard for non-existent game should fail"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/game/non-existent-game")
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Get leaderboard for non-existent game returns 404")


class TestPlayerStats:
    """Test GET /api/leaderboard/player/stats - Get player stats"""
    
    def test_get_player_stats_authenticated(self, auth_headers):
        """Get stats for current authenticated user"""
        response = requests.get(
            f"{BASE_URL}/api/leaderboard/player/stats",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "player_id" in data, "Response should have 'player_id'"
        assert "player_name" in data, "Response should have 'player_name'"
        assert "total_games_played" in data, "Response should have 'total_games_played'"
        assert "unique_games" in data, "Response should have 'unique_games'"
        assert "total_score" in data, "Response should have 'total_score'"
        assert "avg_score" in data, "Response should have 'avg_score'"
        assert "avg_accuracy" in data, "Response should have 'avg_accuracy'"
        assert "highest_score" in data, "Response should have 'highest_score'"
        assert "highest_accuracy" in data, "Response should have 'highest_accuracy'"
        assert "recent_games" in data, "Response should have 'recent_games'"
        
        print(f"✓ Player stats retrieved: {data['total_games_played']} games, avg score {data['avg_score']:.1f}")
    
    def test_get_player_stats_unauthenticated(self):
        """Get stats without authentication should fail"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/player/stats")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Get player stats without auth returns 401/403")


class TestClassCreate:
    """Test POST /api/classes - Create a class"""
    
    def test_create_class(self, auth_headers):
        """Create a new class"""
        unique_name = f"TEST_Class_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name,
            "description": "Test class for API testing",
            "grade_level": 5,
            "subject": "Mathematics"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/classes",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "id" in data, "Response should have 'id'"
        assert "teacher_id" in data, "Response should have 'teacher_id'"
        assert data["name"] == unique_name, "name should match"
        assert data["description"] == "Test class for API testing", "description should match"
        assert data["grade_level"] == 5, "grade_level should match"
        assert data["subject"] == "Mathematics", "subject should match"
        assert "join_code" in data, "Response should have 'join_code'"
        assert len(data["join_code"]) == 8, "join_code should be 8 characters"
        assert data["student_count"] == 0, "student_count should be 0 for new class"
        
        print(f"✓ Class created: {data['id']}, join_code: {data['join_code']}")
        return data
    
    def test_create_class_minimal(self, auth_headers):
        """Create a class with minimal required fields"""
        unique_name = f"TEST_MinClass_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique_name
        }
        
        response = requests.post(
            f"{BASE_URL}/api/classes",
            json=payload,
            headers=auth_headers
        )
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == unique_name, "name should match"
        assert "join_code" in data, "join_code should be auto-generated"
        print(f"✓ Minimal class created: {data['id']}")
    
    def test_create_class_unauthenticated(self):
        """Create class without auth should fail"""
        payload = {
            "name": "Unauthorized Class"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/classes",
            json=payload
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✓ Create class without auth returns 401/403")


class TestClassJoin:
    """Test POST /api/classes/join/{code} - Join a class"""
    
    def test_join_class_with_code(self, auth_headers):
        """Join a class using join code"""
        unique_name = f"TEST_Student_{uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{BASE_URL}/api/classes/join/{TEST_JOIN_CODE}",
            params={"display_name": unique_name, "email": f"{unique_name}@test.com"},
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "success" in data, "Response should have 'success'"
        assert data["success"] == True, "success should be True"
        assert "class_id" in data, "Response should have 'class_id'"
        
        # May return "Already enrolled" message if already in class
        if "message" in data and "Already enrolled" in data["message"]:
            print(f"✓ Already enrolled in class: {data['class_id']}")
        else:
            assert "class_name" in data, "Response should have 'class_name'"
            assert "student_id" in data, "Response should have 'student_id'"
            print(f"✓ Joined class: {data['class_name']} ({data['class_id']})")
    
    def test_join_class_invalid_code(self, auth_headers):
        """Join class with invalid code should fail"""
        response = requests.post(
            f"{BASE_URL}/api/classes/join/INVALID1",
            params={"display_name": "Test Student"},
            headers=auth_headers
        )
        
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Join with invalid code returns 404")
    
    def test_join_class_as_guest(self):
        """Join a class without authentication"""
        unique_name = f"TEST_GuestStudent_{uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{BASE_URL}/api/classes/join/{TEST_JOIN_CODE}",
            params={"display_name": unique_name}
        )
        
        # Guest join may require auth depending on implementation
        # Accept either 200 (success) or 401/403 (auth required)
        assert response.status_code in [200, 401, 403], f"Expected 200/401/403, got {response.status_code}"
        
        if response.status_code == 200:
            data = response.json()
            assert data["success"] == True, "success should be True"
            print(f"✓ Guest joined class successfully")
        else:
            print("✓ Guest join requires authentication (401/403)")


class TestIntegrationProviders:
    """Test GET /api/classes/integrations/providers - List LMS/SIS providers"""
    
    def test_list_integration_providers(self):
        """Get list of supported integration providers"""
        response = requests.get(f"{BASE_URL}/api/classes/integrations/providers")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "providers" in data, "Response should have 'providers'"
        
        providers = data["providers"]
        assert isinstance(providers, list), "providers should be a list"
        assert len(providers) >= 6, f"Expected at least 6 providers, got {len(providers)}"
        
        # Check expected providers exist
        provider_ids = [p["id"] for p in providers]
        expected_providers = ["google_classroom", "canvas", "clever", "classlink", "powerschool", "schoology"]
        
        for expected in expected_providers:
            assert expected in provider_ids, f"Provider '{expected}' should be in list"
        
        # Check provider structure
        for provider in providers:
            assert "id" in provider, "Each provider should have 'id'"
            assert "name" in provider, "Each provider should have 'name'"
            assert "description" in provider, "Each provider should have 'description'"
            assert "features" in provider, "Each provider should have 'features'"
            assert isinstance(provider["features"], list), "features should be a list"
        
        print(f"✓ Integration providers listed: {len(providers)} providers")
        print(f"  Providers: {', '.join(provider_ids)}")
    
    def test_provider_features(self):
        """Verify providers have expected features"""
        response = requests.get(f"{BASE_URL}/api/classes/integrations/providers")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        providers = {p["id"]: p for p in data["providers"]}
        
        # Google Classroom should have roster_sync, assignment_creation, grade_submission
        google = providers.get("google_classroom")
        assert google is not None, "google_classroom should exist"
        assert "roster_sync" in google["features"], "google_classroom should have roster_sync"
        assert "assignment_creation" in google["features"], "google_classroom should have assignment_creation"
        assert "grade_submission" in google["features"], "google_classroom should have grade_submission"
        assert google.get("requires_oauth") == True, "google_classroom should require OAuth"
        
        # Canvas should have roster_sync, assignment_creation, grade_submission
        canvas = providers.get("canvas")
        assert canvas is not None, "canvas should exist"
        assert "roster_sync" in canvas["features"], "canvas should have roster_sync"
        assert canvas.get("requires_api_token") == True, "canvas should require API token"
        
        # Clever should have roster_sync and SSO
        clever = providers.get("clever")
        assert clever is not None, "clever should exist"
        assert "roster_sync" in clever["features"], "clever should have roster_sync"
        assert "sso" in clever["features"], "clever should have sso"
        
        print("✓ Provider features verified")


class TestMyRank:
    """Test GET /api/leaderboard/game/{gameId}/my-rank - Get user's rank"""
    
    def test_get_my_rank(self, auth_headers):
        """Get current user's rank for a game"""
        response = requests.get(
            f"{BASE_URL}/api/leaderboard/game/{TEST_GAME_ID}/my-rank",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "has_played" in data, "Response should have 'has_played'"
        assert "total_players" in data, "Response should have 'total_players'"
        
        if data["has_played"]:
            assert "rank" in data, "Response should have 'rank' if has_played"
            assert "best_score" in data, "Response should have 'best_score'"
            print(f"✓ My rank: #{data['rank']} of {data['total_players']}, best score: {data['best_score']}")
        else:
            assert data["rank"] is None, "rank should be None if not played"
            print(f"✓ User has not played this game (total players: {data['total_players']})")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
