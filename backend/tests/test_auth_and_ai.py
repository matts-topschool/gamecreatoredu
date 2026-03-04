"""
Backend API tests for GameCraft EDU
Testing: Auth endpoints, AI compile endpoint
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Health check - run first"""
    
    def test_health_endpoint(self):
        """Verify API is running"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        print(f"Health check passed: {data}")


class TestAuth:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123456"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "token" in data, "Response should contain token"
        assert "user" in data, "Response should contain user"
        assert "access_token" in data["token"], "Token should have access_token"
        assert data["user"]["email"] == "test@example.com"
        print(f"Login successful. User ID: {data['user']['id']}")
        
        # Store token for subsequent tests
        return data["token"]["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "wrong@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("Invalid login correctly rejected")
    
    def test_get_current_user_with_token(self):
        """Test /auth/me endpoint with valid token"""
        # First login to get token
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123456"
            }
        )
        assert login_response.status_code == 200
        token = login_response.json()["token"]["access_token"]
        
        # Get current user with token
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        user = response.json()
        assert user["email"] == "test@example.com"
        print(f"Current user fetched: {user['display_name']}")
    
    def test_protected_endpoint_without_token(self):
        """Test that protected endpoints reject requests without token"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        # API returns 403 Forbidden for missing auth
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("Protected endpoint correctly requires authentication")


class TestAICompile:
    """AI Compile endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123456"
            }
        )
        if response.status_code == 200:
            return response.json()["token"]["access_token"]
        pytest.skip("Authentication failed - skipping AI tests")
    
    def test_ai_compile_requires_auth(self):
        """Test that AI compile requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/ai/compile",
            json={
                "prompt": "Create a math quiz game for 5th graders"
            }
        )
        # API returns 403 Forbidden for missing auth
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("AI compile correctly requires authentication")
    
    def test_ai_compile_success(self, auth_token):
        """Test AI compile with valid prompt - NOTE: This takes 30-60 seconds"""
        response = requests.post(
            f"{BASE_URL}/api/ai/compile",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "prompt": "Create a simple multiplication quiz game for 4th graders with 5 questions about times tables",
                "grade_levels": [4],
                "subjects": ["math"],
                "game_type": "quiz",
                "question_count": 5,
                "duration_minutes": 10
            },
            timeout=120  # AI calls can take up to 2 minutes
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Response should have success=True"
        assert "spec" in data, "Response should contain spec"
        
        spec = data["spec"]
        assert "version" in spec, "Spec should have version"
        assert "meta" in spec, "Spec should have meta"
        assert "content" in spec, "Spec should have content"
        
        # Verify questions were generated
        questions = spec.get("content", {}).get("questions", [])
        assert len(questions) > 0, f"Spec should have questions, got {len(questions)}"
        
        print(f"AI compile successful. Game title: {spec.get('meta', {}).get('title')}")
        print(f"Generated {len(questions)} questions")
    
    def test_ai_compile_validation_short_prompt(self, auth_token):
        """Test that too-short prompts are rejected"""
        response = requests.post(
            f"{BASE_URL}/api/ai/compile",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "prompt": "short"  # Less than 10 characters
            }
        )
        # Should return 422 validation error
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        print("Short prompt correctly rejected with validation error")


class TestGameCRUD:
    """Game CRUD operations tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123456"
            }
        )
        if response.status_code == 200:
            return response.json()["token"]["access_token"]
        pytest.skip("Authentication failed")
    
    def test_create_and_get_game(self, auth_token):
        """Test creating a game and retrieving it"""
        # Create game
        create_payload = {
            "title": "TEST_Math Quiz Game",
            "description": "A test math quiz game",
            "grade_levels": [4, 5],
            "subjects": ["math"],
            "spec": {
                "version": "2.0",
                "meta": {
                    "title": "TEST_Math Quiz Game",
                    "description": "A test math quiz game",
                    "game_type": "quiz"
                },
                "content": {
                    "questions": [
                        {
                            "id": "q1",
                            "type": "multiple_choice",
                            "stem": "What is 2 + 2?",
                            "options": [
                                {"id": "a", "text": "3", "is_correct": False},
                                {"id": "b", "text": "4", "is_correct": True},
                                {"id": "c", "text": "5", "is_correct": False},
                                {"id": "d", "text": "6", "is_correct": False}
                            ]
                        }
                    ]
                },
                "state": {"variables": []},
                "settings": {"leaderboard": {"enabled": True}}
            }
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/games",
            headers={"Authorization": f"Bearer {auth_token}"},
            json=create_payload
        )
        
        assert create_response.status_code == 201, f"Expected 201, got {create_response.status_code}: {create_response.text}"
        
        created_game = create_response.json()
        assert "id" in created_game
        assert created_game["title"] == "TEST_Math Quiz Game"
        
        game_id = created_game["id"]
        print(f"Created game with ID: {game_id}")
        
        # Get game
        get_response = requests.get(
            f"{BASE_URL}/api/games/{game_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}"
        
        fetched_game = get_response.json()
        assert fetched_game["id"] == game_id
        assert fetched_game["title"] == "TEST_Math Quiz Game"
        print(f"Game fetched successfully: {fetched_game['title']}")
        
        # Cleanup - delete game
        delete_response = requests.delete(
            f"{BASE_URL}/api/games/{game_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert delete_response.status_code in [200, 204], f"Delete failed: {delete_response.status_code}"
        print(f"Test game deleted")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
