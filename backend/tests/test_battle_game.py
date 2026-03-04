"""
Backend tests for Battle Game features and AI Compilation with OpenAI GPT-5.1.
Tests: AI compile endpoint, battle game spec generation, game type detection.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123456"

# Game IDs
BATTLE_GAME_ID = "1697f068-82bf-4a3b-9f52-f27231840200"
QUIZ_GAME_ID = "09feb8bd-0074-414f-8b58-bfbc7159f935"


class TestHealthAndAuth:
    """Basic health and authentication tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        print("✓ API health check passed")
    
    def test_login(self):
        """Test login endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "access_token" in data["token"]
        assert "user" in data
        print("✓ Login successful")


@pytest.fixture
def auth_token():
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["token"]["access_token"]
    pytest.skip("Authentication failed")


@pytest.fixture
def auth_headers(auth_token):
    """Get authentication headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestAICompileBattleGame:
    """Test AI compilation endpoint for battle games - Using OpenAI GPT-5.1"""
    
    def test_ai_compile_battle_game(self, auth_headers):
        """Test AI compile endpoint generates valid battle game spec"""
        response = requests.post(
            f"{BASE_URL}/api/ai/compile",
            headers=auth_headers,
            json={
                "prompt": "Create a simple math battle game about multiplication",
                "grade_levels": [4],
                "subjects": ["math"],
                "game_type": "battle",
                "question_count": 5,
                "duration_minutes": 10
            },
            timeout=120
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify success response
        assert data.get("success") is True, "Expected success: true"
        spec = data.get("spec", {})
        
        # Verify game_type is battle
        meta = spec.get("meta", {})
        assert meta.get("game_type") == "battle", f"Expected game_type=battle, got {meta.get('game_type')}"
        print("✓ AI compile returns game_type=battle")
        
        # Verify entities (enemy data)
        entities = spec.get("entities", {})
        assert entities, "Expected entities in battle game spec"
        enemy = entities.get("enemy", {})
        assert enemy, "Expected enemy in entities"
        assert enemy.get("name"), "Expected enemy.name"
        assert enemy.get("health", {}).get("max"), "Expected enemy.health.max"
        print(f"✓ Enemy generated: {enemy.get('name')}")
        
        # Verify battle_config
        battle_config = spec.get("battle_config", {})
        assert battle_config, "Expected battle_config in spec"
        assert "damage_per_correct" in battle_config, "Expected damage_per_correct"
        assert "bonus_damage_per_combo" in battle_config, "Expected bonus_damage_per_combo"
        print(f"✓ Battle config: damage={battle_config.get('damage_per_correct')}, combo_bonus={battle_config.get('bonus_damage_per_combo')}")
        
        # Verify questions exist
        content = spec.get("content", {})
        questions = content.get("questions", [])
        assert len(questions) >= 3, f"Expected at least 3 questions, got {len(questions)}"
        print(f"✓ Generated {len(questions)} questions")
        
        # Verify question structure
        q1 = questions[0]
        assert q1.get("id"), "Expected question.id"
        assert q1.get("stem"), "Expected question.stem"
        assert q1.get("options"), "Expected question.options"
        assert len(q1.get("options", [])) == 4, "Expected 4 options per question"
        print("✓ Question structure valid")
    
    def test_ai_compile_quiz_game(self, auth_headers):
        """Test AI compile endpoint generates valid quiz game spec"""
        response = requests.post(
            f"{BASE_URL}/api/ai/compile",
            headers=auth_headers,
            json={
                "prompt": "Create a quiz about US geography",
                "grade_levels": [5],
                "subjects": ["social studies"],
                "game_type": "quiz",
                "question_count": 5,
                "duration_minutes": 10
            },
            timeout=120
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        
        spec = data.get("spec", {})
        meta = spec.get("meta", {})
        
        # Quiz type should not have battle-specific fields as primary
        game_type = meta.get("game_type", "quiz")
        assert game_type == "quiz", f"Expected quiz type, got {game_type}"
        print("✓ Quiz game type correctly identified")


class TestExistingGameFetch:
    """Test fetching existing games and their types"""
    
    def test_fetch_quiz_game(self, auth_headers):
        """Test fetching existing quiz game"""
        response = requests.get(
            f"{BASE_URL}/api/games/{QUIZ_GAME_ID}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify game structure
        assert data.get("id") == QUIZ_GAME_ID
        assert data.get("spec")
        
        spec = data.get("spec", {})
        meta = spec.get("meta", {})
        game_type = meta.get("game_type", "quiz")
        
        assert game_type == "quiz", f"Expected quiz type, got {game_type}"
        print(f"✓ Quiz game '{data.get('title')}' fetched with game_type=quiz")
        
        # Verify questions exist
        questions = spec.get("content", {}).get("questions", [])
        assert len(questions) > 0, "Quiz game should have questions"
        print(f"✓ Quiz has {len(questions)} questions")
    
    def test_fetch_battle_game(self, auth_headers):
        """Test fetching existing battle game - Note: May not have game_type set if created before update"""
        response = requests.get(
            f"{BASE_URL}/api/games/{BATTLE_GAME_ID}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data.get("id") == BATTLE_GAME_ID
        print(f"✓ Battle game '{data.get('title')}' fetched")
        
        spec = data.get("spec", {})
        meta = spec.get("meta", {})
        
        # Check game_type - may be missing on older games
        game_type = meta.get("game_type")
        if game_type:
            print(f"✓ Game has game_type={game_type}")
        else:
            print("⚠ WARNING: Battle game missing game_type in spec.meta - will default to quiz in frontend")
        
        # Check for battle entities
        entities = spec.get("entities")
        battle_config = spec.get("battle_config")
        
        if entities and entities.get("enemy"):
            print(f"✓ Has enemy: {entities['enemy'].get('name')}")
        else:
            print("⚠ WARNING: Battle game missing entities.enemy")
        
        if battle_config:
            print(f"✓ Has battle_config")
        else:
            print("⚠ WARNING: Battle game missing battle_config")


class TestGameCreationWithBattleType:
    """Test creating a new battle game with proper type"""
    
    def test_create_battle_game_via_api(self, auth_headers):
        """Create a new battle game and verify type is persisted"""
        # First generate a battle spec
        compile_response = requests.post(
            f"{BASE_URL}/api/ai/compile",
            headers=auth_headers,
            json={
                "prompt": "Create a science battle game about the water cycle",
                "grade_levels": [4],
                "subjects": ["science"],
                "game_type": "battle",
                "question_count": 5,
                "duration_minutes": 10
            },
            timeout=120
        )
        
        assert compile_response.status_code == 200
        spec = compile_response.json().get("spec")
        assert spec
        
        # Create a new game with this spec
        import uuid
        game_title = f"Test Battle Game {uuid.uuid4().hex[:8]}"
        
        create_response = requests.post(
            f"{BASE_URL}/api/games",
            headers=auth_headers,
            json={
                "title": game_title,
                "description": "Test battle game for verification",
                "spec": spec,
                "grade_levels": [4],
                "subjects": ["science"]
            }
        )
        
        assert create_response.status_code == 201, f"Expected 201, got {create_response.status_code}: {create_response.text}"
        created_game = create_response.json()
        game_id = created_game.get("id")
        print(f"✓ Created battle game: {game_id}")
        
        # Fetch and verify the game type persisted
        fetch_response = requests.get(
            f"{BASE_URL}/api/games/{game_id}",
            headers=auth_headers
        )
        
        assert fetch_response.status_code == 200
        fetched_game = fetch_response.json()
        
        fetched_spec = fetched_game.get("spec", {})
        fetched_meta = fetched_spec.get("meta", {})
        fetched_type = fetched_meta.get("game_type")
        
        assert fetched_type == "battle", f"Expected game_type=battle after fetch, got {fetched_type}"
        print("✓ Game type 'battle' persisted correctly")
        
        # Verify entities persisted
        fetched_entities = fetched_spec.get("entities", {})
        assert fetched_entities.get("enemy"), "Expected enemy data to persist"
        print(f"✓ Enemy persisted: {fetched_entities.get('enemy', {}).get('name')}")
        
        # Cleanup - delete test game
        delete_response = requests.delete(
            f"{BASE_URL}/api/games/{game_id}",
            headers=auth_headers
        )
        if delete_response.status_code in [200, 204]:
            print("✓ Test game cleaned up")
        else:
            print(f"⚠ Could not delete test game: {delete_response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
