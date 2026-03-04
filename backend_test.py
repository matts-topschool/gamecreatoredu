#!/usr/bin/env python3
"""
Backend API Testing for GameCraft EDU
Tests authentication and game management endpoints
"""
import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional


class GameCraftEduAPITester:
    def __init__(self, base_url: str = "https://impl-framework.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: Dict[str, Any] = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "status": "PASS" if success else "FAIL",
            "details": details or {}
        }
        self.test_results.append(result)
        
        status_emoji = "✅" if success else "❌"
        print(f"{status_emoji} {name}")
        if details and not success:
            print(f"   Details: {details}")

    def make_request(self, method: str, endpoint: str, data: Dict[str, Any] = None, 
                    expected_status: int = 200) -> tuple[bool, Dict[str, Any], int]:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}/api{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}, 0

            try:
                response_data = response.json() if response.text else {}
            except json.JSONDecodeError:
                response_data = {"raw_response": response.text}

            success = response.status_code == expected_status
            return success, response_data, response.status_code

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}, 0

    def test_health_check(self):
        """Test health check endpoint"""
        success, data, status = self.make_request("GET", "/health", expected_status=200)
        self.log_test("Health Check", success, {"status_code": status, "response": data})
        return success

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, data, status = self.make_request("GET", "/", expected_status=200)
        expected_keys = ["message", "version"]
        has_expected_keys = all(key in data for key in expected_keys) if success else False
        
        final_success = success and has_expected_keys
        self.log_test("Root Endpoint", final_success, {
            "status_code": status, 
            "has_expected_fields": has_expected_keys,
            "response": data
        })
        return final_success

    def test_register_user(self, email: str, password: str, display_name: str):
        """Test user registration"""
        data = {
            "email": email,
            "password": password,
            "display_name": display_name,
            "role": "teacher"
        }
        
        success, response, status = self.make_request("POST", "/auth/register", data, expected_status=201)
        
        if success and "user" in response and "token" in response:
            self.token = response["token"]["access_token"]
            self.user_id = response["user"]["id"]
            
        self.log_test("User Registration", success, {
            "status_code": status,
            "has_token": bool(self.token),
            "has_user": "user" in response if success else False,
            "response": response
        })
        return success

    def test_login_user(self, email: str, password: str):
        """Test user login"""
        data = {
            "email": email,
            "password": password
        }
        
        success, response, status = self.make_request("POST", "/auth/login", data, expected_status=200)
        
        if success and "user" in response and "token" in response:
            self.token = response["token"]["access_token"]
            self.user_id = response["user"]["id"]
            
        self.log_test("User Login", success, {
            "status_code": status,
            "has_token": bool(self.token),
            "has_user": "user" in response if success else False,
            "response": response
        })
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            self.log_test("Get Current User", False, {"error": "No auth token"})
            return False
            
        success, response, status = self.make_request("GET", "/auth/me", expected_status=200)
        
        has_user_fields = False
        if success:
            required_fields = ["id", "email", "display_name", "role"]
            has_user_fields = all(field in response for field in required_fields)
        
        final_success = success and has_user_fields
        self.log_test("Get Current User", final_success, {
            "status_code": status,
            "has_required_fields": has_user_fields,
            "response": response
        })
        return final_success

    def test_create_game(self):
        """Test creating a game"""
        if not self.token:
            self.log_test("Create Game", False, {"error": "No auth token"})
            return False, None
            
        data = {
            "title": f"Test Game {datetime.now().strftime('%H%M%S')}",
            "description": "A test game created by automated testing",
            "grade_levels": [3, 4],
            "subjects": ["math"]
        }
        
        success, response, status = self.make_request("POST", "/games", data, expected_status=201)
        
        game_id = None
        has_game_fields = False
        
        if success:
            game_id = response.get("id")
            required_fields = ["id", "title", "description", "status", "owner_id"]
            has_game_fields = all(field in response for field in required_fields)
        
        final_success = success and has_game_fields and game_id
        self.log_test("Create Game", final_success, {
            "status_code": status,
            "has_required_fields": has_game_fields,
            "game_id": game_id,
            "response": response
        })
        return final_success, game_id

    def test_get_games_list(self):
        """Test getting games list"""
        if not self.token:
            self.log_test("Get Games List", False, {"error": "No auth token"})
            return False
            
        success, response, status = self.make_request("GET", "/games", expected_status=200)
        
        is_list = isinstance(response, list) if success else False
        
        self.log_test("Get Games List", success and is_list, {
            "status_code": status,
            "is_list": is_list,
            "games_count": len(response) if is_list else 0,
            "response": response if not is_list else f"List with {len(response)} games"
        })
        return success and is_list

    def test_get_game_by_id(self, game_id: str):
        """Test getting a specific game"""
        if not self.token or not game_id:
            self.log_test("Get Game By ID", False, {"error": "No auth token or game_id"})
            return False
            
        success, response, status = self.make_request("GET", f"/games/{game_id}", expected_status=200)
        
        has_game_fields = False
        if success:
            required_fields = ["id", "title", "description", "status"]
            has_game_fields = all(field in response for field in required_fields)
        
        final_success = success and has_game_fields
        self.log_test("Get Game By ID", final_success, {
            "status_code": status,
            "has_required_fields": has_game_fields,
            "game_id": game_id,
            "response": response
        })
        return final_success

    def test_update_game(self, game_id: str):
        """Test updating a game"""
        if not self.token or not game_id:
            self.log_test("Update Game", False, {"error": "No auth token or game_id"})
            return False
            
        data = {
            "title": f"Updated Test Game {datetime.now().strftime('%H%M%S')}",
            "description": "Updated description for test game"
        }
        
        success, response, status = self.make_request("PUT", f"/games/{game_id}", data, expected_status=200)
        
        title_updated = False
        if success:
            title_updated = response.get("title") == data["title"]
        
        final_success = success and title_updated
        self.log_test("Update Game", final_success, {
            "status_code": status,
            "title_updated": title_updated,
            "response": response
        })
        return final_success

    def test_delete_game(self, game_id: str):
        """Test deleting a game"""
        if not self.token or not game_id:
            self.log_test("Delete Game", False, {"error": "No auth token or game_id"})
            return False
            
        success, response, status = self.make_request("DELETE", f"/games/{game_id}", expected_status=200)
        
        has_success_message = False
        if success:
            has_success_message = "message" in response
        
        final_success = success and has_success_message
        self.log_test("Delete Game", final_success, {
            "status_code": status,
            "has_success_message": has_success_message,
            "response": response
        })
        return final_success

    def run_full_test_suite(self):
        """Run complete test suite"""
        print(f"🚀 Starting GameCraft EDU API Test Suite")
        print(f"📍 Testing: {self.base_url}")
        print("=" * 50)
        
        # Basic endpoints
        self.test_health_check()
        self.test_root_endpoint()
        
        # Test with existing user first (as mentioned in requirements)
        print("\n🔐 Testing with existing user...")
        login_success = self.test_login_user("teacher@example.com", "password123")
        
        if login_success:
            self.test_get_current_user()
            
            # Game management tests
            print("\n🎮 Testing game management...")
            create_success, game_id = self.test_create_game()
            
            if create_success and game_id:
                self.test_get_games_list()
                self.test_get_game_by_id(game_id)
                self.test_update_game(game_id)
                self.test_delete_game(game_id)
            else:
                print("❌ Skipping game tests due to create failure")
        else:
            # If existing user login fails, try to register new user
            print("\n📝 Trying user registration...")
            test_email = f"test{datetime.now().strftime('%H%M%S')}@example.com"
            register_success = self.test_register_user(test_email, "testpass123", "Test User")
            
            if register_success:
                self.test_get_current_user()
                
                # Game management tests
                print("\n🎮 Testing game management...")
                create_success, game_id = self.test_create_game()
                
                if create_success and game_id:
                    self.test_get_games_list()
                    self.test_get_game_by_id(game_id)
                    self.test_update_game(game_id)
                    self.test_delete_game(game_id)

        # Summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("✅ All tests passed!")
            return True
        else:
            print("❌ Some tests failed!")
            failed_tests = [r for r in self.test_results if r["status"] == "FAIL"]
            print("Failed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return False


def main():
    """Main test runner"""
    base_url = "https://impl-framework.preview.emergentagent.com"
    
    tester = GameCraftEduAPITester(base_url)
    success = tester.run_full_test_suite()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())