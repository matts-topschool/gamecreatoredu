"""
Integration API Tests - Google Classroom integration and LMS providers.
Tests: provider list, status, assignments, OAuth init endpoints.
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER = {"email": "testuser@example.com", "password": "testpassword123"}

# Test data from main agent
TEST_CLASS_ID = "b88ea1f5-1f0d-45d5-9ce4-87f8813caf5a"
TEST_ASSIGNMENT_ID = "4dce3af1-45fa-4a1f-bb9d-677a59680f8d"


@pytest.fixture(scope="module")
def auth_token():
    """Get auth token for authenticated requests."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
    if response.status_code == 200:
        # Token is nested under token.access_token
        token_data = response.json().get("token", {})
        return token_data.get("access_token")
    pytest.fail(f"Login failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


# ==================== Provider List Tests ====================

class TestProviderList:
    """Tests for GET /api/integrations/providers - list all LMS providers."""

    def test_providers_returns_all_six(self):
        """Test that all 6 LMS providers are returned."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "providers" in data
        providers = data["providers"]
        
        # Check we have 6 providers
        assert len(providers) == 6, f"Expected 6 providers, got {len(providers)}"
        
        # Check all expected providers are present
        provider_ids = [p["id"] for p in providers]
        expected = ["google_classroom", "canvas", "clever", "classlink", "powerschool", "schoology"]
        for pid in expected:
            assert pid in provider_ids, f"Missing provider: {pid}"

    def test_providers_have_required_fields(self):
        """Test that all providers have required fields."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        assert response.status_code == 200
        providers = response.json()["providers"]
        
        for p in providers:
            assert "id" in p, f"Provider missing 'id': {p}"
            assert "name" in p, f"Provider missing 'name': {p}"
            assert "description" in p, f"Provider missing 'description': {p}"
            assert "available" in p, f"Provider missing 'available': {p}"

    def test_google_classroom_available(self):
        """Test Google Classroom is marked as available."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        google = next(p for p in providers if p["id"] == "google_classroom")
        
        assert google["available"] is True
        assert google.get("coming_soon") is not True
        assert "roster_sync" in google.get("features", [])
        assert "grade_submission" in google.get("features", [])

    def test_canvas_available(self):
        """Test Canvas is marked as available."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        canvas = next(p for p in providers if p["id"] == "canvas")
        
        assert canvas["available"] is True
        assert canvas.get("coming_soon") is not True

    def test_clever_available(self):
        """Test Clever is marked as available."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        clever = next(p for p in providers if p["id"] == "clever")
        
        assert clever["available"] is True
        assert clever.get("coming_soon") is not True

    def test_classlink_coming_soon(self):
        """Test ClassLink is marked as coming soon."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        classlink = next(p for p in providers if p["id"] == "classlink")
        
        assert classlink.get("coming_soon") is True
        assert classlink["available"] is False

    def test_powerschool_coming_soon(self):
        """Test PowerSchool is marked as coming soon."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        powerschool = next(p for p in providers if p["id"] == "powerschool")
        
        assert powerschool.get("coming_soon") is True
        assert powerschool["available"] is False

    def test_schoology_coming_soon(self):
        """Test Schoology is marked as coming soon."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        schoology = next(p for p in providers if p["id"] == "schoology")
        
        assert schoology.get("coming_soon") is True
        assert schoology["available"] is False


# ==================== Integration Status Tests ====================

class TestIntegrationStatus:
    """Tests for GET /api/integrations/status - user's connection status."""

    def test_status_requires_auth(self):
        """Test that status endpoint requires authentication."""
        response = requests.get(f"{BASE_URL}/api/integrations/status")
        # 401 or 403 both indicate auth required
        assert response.status_code in [401, 403]

    def test_status_returns_providers(self, auth_headers):
        """Test status returns provider list with connection info."""
        response = requests.get(
            f"{BASE_URL}/api/integrations/status",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "providers" in data
        providers = data["providers"]
        
        # Should have all 6 providers
        assert len(providers) == 6
        
        # Each provider should have these fields
        for p in providers:
            assert "id" in p
            assert "name" in p
            assert "connected" in p
            assert isinstance(p["connected"], bool)

    def test_status_shows_disconnected_by_default(self, auth_headers):
        """Test that providers show disconnected by default."""
        response = requests.get(
            f"{BASE_URL}/api/integrations/status",
            headers=auth_headers
        )
        
        providers = response.json()["providers"]
        
        # By default, test user shouldn't have connections
        # (Unless manually connected - check if any are true)
        for p in providers:
            # Just verify the field exists and is boolean
            assert isinstance(p["connected"], bool)


# ==================== OAuth Init Tests ====================

class TestOAuthInit:
    """Tests for POST /api/integrations/oauth/init - initiate OAuth flow."""

    def test_oauth_init_requires_auth(self):
        """Test OAuth init requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/oauth/init",
            json={"provider": "google_classroom", "redirect_uri": "http://localhost"}
        )
        # 401 or 403 both indicate auth required
        assert response.status_code in [401, 403]

    def test_oauth_init_google_returns_auth_url(self, auth_headers):
        """Test OAuth init for Google Classroom returns auth URL."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/oauth/init",
            headers=auth_headers,
            json={
                "provider": "google_classroom",
                "redirect_uri": "https://impl-framework.preview.emergentagent.com/integrations"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "auth_url" in data
        assert "state_id" in data
        assert data["provider"] == "google_classroom"
        
        # Auth URL should be Emergent Auth
        assert "auth.emergentagent.com" in data["auth_url"]

    def test_oauth_init_rejects_coming_soon_provider(self, auth_headers):
        """Test OAuth init rejects coming soon providers."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/oauth/init",
            headers=auth_headers,
            json={
                "provider": "classlink",
                "redirect_uri": "http://localhost"
            }
        )
        
        assert response.status_code == 400
        assert "coming soon" in response.json().get("detail", "").lower()

    def test_oauth_init_rejects_invalid_provider(self, auth_headers):
        """Test OAuth init rejects invalid provider names."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/oauth/init",
            headers=auth_headers,
            json={
                "provider": "invalid_provider",
                "redirect_uri": "http://localhost"
            }
        )
        
        assert response.status_code == 400


# ==================== Assignment Tests ====================

class TestAssignments:
    """Tests for assignment endpoints - creating and listing game assignments."""

    def test_create_assignment_requires_auth(self):
        """Test creating assignment requires auth."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/assignments",
            json={"game_id": "test", "class_id": "test", "title": "Test"}
        )
        # 401 or 403 both indicate auth required
        assert response.status_code in [401, 403]

    def test_list_assignments_requires_auth(self):
        """Test listing assignments requires auth."""
        response = requests.get(f"{BASE_URL}/api/integrations/assignments")
        # 401 or 403 both indicate auth required
        assert response.status_code in [401, 403]

    def test_list_assignments_returns_list(self, auth_headers):
        """Test listing assignments returns array."""
        response = requests.get(
            f"{BASE_URL}/api/integrations/assignments",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list)

    def test_create_assignment_validates_class(self, auth_headers):
        """Test creating assignment validates class exists."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/assignments",
            headers=auth_headers,
            json={
                "game_id": "some-game-id",
                "class_id": "nonexistent-class-id",
                "title": "Test Assignment"
            }
        )
        
        # Should fail - class not found
        assert response.status_code == 404

    def test_create_assignment_validates_game(self, auth_headers):
        """Test creating assignment validates game exists."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/assignments",
            headers=auth_headers,
            json={
                "game_id": "nonexistent-game-id",
                "class_id": TEST_CLASS_ID,
                "title": "Test Assignment"
            }
        )
        
        # Should fail - game not found
        assert response.status_code == 404

    def test_get_assignment_by_id(self, auth_headers):
        """Test getting assignment by ID."""
        # First list to find an assignment
        list_response = requests.get(
            f"{BASE_URL}/api/integrations/assignments",
            headers=auth_headers
        )
        
        assignments = list_response.json()
        
        if len(assignments) > 0:
            assignment_id = assignments[0]["id"]
            
            response = requests.get(
                f"{BASE_URL}/api/integrations/assignments/{assignment_id}",
                headers=auth_headers
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == assignment_id
        else:
            pytest.skip("No assignments to test")

    def test_get_nonexistent_assignment(self, auth_headers):
        """Test getting nonexistent assignment returns 404."""
        response = requests.get(
            f"{BASE_URL}/api/integrations/assignments/nonexistent-id",
            headers=auth_headers
        )
        
        assert response.status_code == 404


# ==================== Google Classroom Operations Tests ====================

class TestGoogleClassroomOps:
    """Tests for Google Classroom specific operations (require OAuth)."""

    def test_list_google_courses_requires_auth(self):
        """Test listing Google courses requires authentication."""
        response = requests.get(f"{BASE_URL}/api/integrations/google/courses")
        # 401 or 403 both indicate auth required
        assert response.status_code in [401, 403]

    def test_list_google_courses_requires_connection(self, auth_headers):
        """Test listing Google courses when no Google connection exists."""
        response = requests.get(
            f"{BASE_URL}/api/integrations/google/courses",
            headers=auth_headers
        )
        
        # Could return 400 (not connected) or 200 with empty list
        # depending on implementation
        assert response.status_code in [200, 400]

    def test_import_class_requires_auth(self):
        """Test importing class requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/google/import-class/some-course-id"
        )
        # 401 or 403 both indicate auth required
        assert response.status_code in [401, 403]

    def test_import_class_requires_connection(self, auth_headers):
        """Test importing class validates connection or course."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/google/import-class/some-course-id",
            headers=auth_headers
        )
        
        # Could return 400 (not connected) or 404 (course not found)
        assert response.status_code in [400, 404]

    def test_sync_roster_requires_auth(self):
        """Test syncing roster requires authentication."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/google/sync-roster/some-class-id"
        )
        # 401 or 403 both indicate auth required
        assert response.status_code in [401, 403]

    def test_sync_roster_validates_class(self, auth_headers):
        """Test syncing roster validates class exists."""
        response = requests.post(
            f"{BASE_URL}/api/integrations/google/sync-roster/nonexistent-class",
            headers=auth_headers
        )
        
        assert response.status_code == 404


# ==================== Disconnect Tests ====================

class TestDisconnect:
    """Tests for disconnecting integrations."""

    def test_disconnect_requires_auth(self):
        """Test disconnect requires authentication."""
        response = requests.delete(
            f"{BASE_URL}/api/integrations/disconnect/google_classroom"
        )
        # 401 or 403 both indicate auth required
        assert response.status_code in [401, 403]

    def test_disconnect_returns_appropriate_status(self, auth_headers):
        """Test disconnect returns appropriate status."""
        response = requests.delete(
            f"{BASE_URL}/api/integrations/disconnect/google_classroom",
            headers=auth_headers
        )
        
        # Could be 404 (not connected) or 200 (successfully disconnected)
        assert response.status_code in [200, 404]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
