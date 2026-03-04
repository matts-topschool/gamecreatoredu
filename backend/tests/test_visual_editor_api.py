"""
Backend API tests for Visual Editor functionality.
Tests game spec CRUD operations.
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://impl-framework.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "test@example.com"
TEST_PASSWORD = "test123456"
TEST_GAME_ID = "09feb8bd-0074-414f-8b58-bfbc7159f935"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for testing"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    return data["token"]["access_token"]


@pytest.fixture(scope="module")
def api_client(auth_token):
    """Create authenticated session"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    })
    return session


class TestGameSpecAPI:
    """Tests for game spec operations - Visual Editor backend"""
    
    def test_get_game_returns_spec(self, api_client):
        """Test GET /api/games/:gameId returns game with spec"""
        response = api_client.get(f"{BASE_URL}/api/games/{TEST_GAME_ID}")
        
        assert response.status_code == 200, f"Get game failed: {response.text}"
        data = response.json()
        
        # Verify game structure
        assert data["id"] == TEST_GAME_ID
        assert "spec" in data
        assert "meta" in data["spec"]
        assert "content" in data["spec"]
        
        # Verify spec meta
        assert "title" in data["spec"]["meta"]
        assert "game_type" in data["spec"]["meta"]
        
        # Verify questions exist
        assert "questions" in data["spec"]["content"]
        assert len(data["spec"]["content"]["questions"]) >= 1
        
        print(f"✓ Game fetched successfully: {data['spec']['meta']['title']}")
        print(f"✓ Questions count: {len(data['spec']['content']['questions'])}")
    
    def test_get_game_spec_endpoint(self, api_client):
        """Test GET /api/games/:gameId/spec returns just the spec"""
        response = api_client.get(f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec")
        
        assert response.status_code == 200, f"Get spec failed: {response.text}"
        data = response.json()
        
        # Should return spec and spec_version
        assert "spec" in data
        assert "spec_version" in data
        assert data["spec_version"] >= 1
        
        print(f"✓ Spec endpoint working. Version: {data['spec_version']}")
    
    def test_update_game_spec(self, api_client):
        """Test PUT /api/games/:gameId/spec updates spec and increments version"""
        
        # First get current spec
        get_response = api_client.get(f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec")
        assert get_response.status_code == 200
        current_data = get_response.json()
        original_version = current_data["spec_version"]
        current_spec = current_data["spec"]
        
        # Update title in spec
        test_title = f"Visual Editor Test - {original_version + 1}"
        updated_spec = current_spec.copy()
        updated_spec["meta"]["title"] = test_title
        
        # Update spec
        put_response = api_client.put(
            f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec",
            json={"spec": updated_spec}
        )
        
        assert put_response.status_code == 200, f"Update spec failed: {put_response.text}"
        data = put_response.json()
        
        # Verify update
        assert data["spec"]["meta"]["title"] == test_title
        assert data["spec_version"] == original_version + 1
        
        print(f"✓ Spec updated successfully. New version: {data['spec_version']}")
    
    def test_update_questions_in_spec(self, api_client):
        """Test updating questions through spec update API"""
        
        # Get current spec
        get_response = api_client.get(f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec")
        current_data = get_response.json()
        current_spec = current_data["spec"]
        
        # Modify a question
        if current_spec["content"]["questions"]:
            current_spec["content"]["questions"][0]["stem"] = "Updated Question: What is 5 x 6?"
        
        # Update spec
        put_response = api_client.put(
            f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec",
            json={"spec": current_spec}
        )
        
        assert put_response.status_code == 200
        data = put_response.json()
        
        # Verify question updated
        assert "Updated Question" in data["spec"]["content"]["questions"][0]["stem"]
        
        print(f"✓ Question updated in spec successfully")
    
    def test_spec_persistence_after_update(self, api_client):
        """Test that spec changes persist after update"""
        
        # Get current spec
        get_response = api_client.get(f"{BASE_URL}/api/games/{TEST_GAME_ID}")
        assert get_response.status_code == 200
        
        original_data = get_response.json()
        original_version = original_data["spec_version"]
        
        # Make a change
        updated_spec = original_data["spec"].copy()
        updated_spec["settings"]["allow_hints"] = False
        
        # Update
        put_response = api_client.put(
            f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec",
            json={"spec": updated_spec}
        )
        assert put_response.status_code == 200
        
        # Verify persistence with GET
        verify_response = api_client.get(f"{BASE_URL}/api/games/{TEST_GAME_ID}")
        assert verify_response.status_code == 200
        verified_data = verify_response.json()
        
        assert verified_data["spec"]["settings"]["allow_hints"] == False
        assert verified_data["spec_version"] == original_version + 1
        
        # Restore original setting
        updated_spec["settings"]["allow_hints"] = True
        api_client.put(
            f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec",
            json={"spec": updated_spec}
        )
        
        print(f"✓ Spec changes persist correctly after update")
    
    def test_spec_update_404_for_nonexistent_game(self, api_client):
        """Test that spec update returns 404 for non-existent game"""
        fake_id = "00000000-0000-0000-0000-000000000000"
        
        response = api_client.put(
            f"{BASE_URL}/api/games/{fake_id}/spec",
            json={"spec": {"meta": {"title": "test"}}}
        )
        
        assert response.status_code == 404
        print(f"✓ Correctly returns 404 for non-existent game")
    
    def test_spec_update_requires_auth(self):
        """Test that spec update requires authentication"""
        unauthenticated_session = requests.Session()
        unauthenticated_session.headers.update({"Content-Type": "application/json"})
        
        response = unauthenticated_session.put(
            f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec",
            json={"spec": {"meta": {"title": "test"}}}
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403 but got {response.status_code}"
        print(f"✓ Spec update correctly requires authentication")


class TestGameSpecCleanup:
    """Cleanup tests - restore game to original state"""
    
    def test_restore_original_spec(self, api_client):
        """Restore game to original state after tests"""
        original_spec = {
            "version": "2.0",
            "meta": {
                "title": "Test Math Game",
                "description": "A test math game",
                "game_type": "quiz",
                "educational": {
                    "grade_levels": [4, 5],
                    "subjects": ["math"],
                    "learning_objectives": ["Learn multiplication", "Practice times tables"]
                },
                "gameplay": {
                    "estimated_duration_minutes": 15
                }
            },
            "content": {
                "questions": [
                    {
                        "id": "q1",
                        "type": "multiple_choice",
                        "stem": "What is 5 x 6?",
                        "options": [
                            {"id": "a", "text": "25", "is_correct": False},
                            {"id": "b", "text": "30", "is_correct": True},
                            {"id": "c", "text": "35", "is_correct": False},
                            {"id": "d", "text": "36", "is_correct": False}
                        ],
                        "explanation": "5 times 6 equals 30",
                        "difficulty": 2,
                        "hints": ["Count by 5s six times"]
                    },
                    {
                        "id": "q2",
                        "type": "multiple_choice",
                        "stem": "What is 7 x 8?",
                        "options": [
                            {"id": "a", "text": "54", "is_correct": False},
                            {"id": "b", "text": "56", "is_correct": True},
                            {"id": "c", "text": "58", "is_correct": False},
                            {"id": "d", "text": "64", "is_correct": False}
                        ],
                        "explanation": "7 times 8 equals 56",
                        "difficulty": 3,
                        "hints": ["Remember: 7x8=56"]
                    }
                ]
            },
            "settings": {
                "allow_hints": True,
                "shuffle_questions": True,
                "show_explanation": True,
                "leaderboard": {
                    "enabled": True,
                    "type": "score"
                }
            }
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/games/{TEST_GAME_ID}/spec",
            json={"spec": original_spec}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["spec"]["meta"]["title"] == "Test Math Game"
        
        print(f"✓ Game restored to original state. Final version: {data['spec_version']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
