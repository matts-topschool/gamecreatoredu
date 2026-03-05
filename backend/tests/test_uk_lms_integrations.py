"""
UK LMS/SIS Integration Tests - UK providers, CTF import, CSV import.
Tests: 16 providers, region filtering, UK providers, file import endpoints.
"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_USER = {"email": "testuser@example.com", "password": "testpassword123"}


@pytest.fixture(scope="module")
def auth_token():
    """Get auth token for authenticated requests."""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=TEST_USER)
    if response.status_code == 200:
        token_data = response.json().get("token", {})
        return token_data.get("access_token")
    pytest.fail(f"Login failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Get headers with auth token."""
    return {"Authorization": f"Bearer {auth_token}"}


# ==================== Provider List Tests - 16 Providers ====================

class TestProviderCount:
    """Tests for GET /api/integrations/providers - verify 16 providers."""

    def test_providers_returns_sixteen_total(self):
        """Test that all 16 LMS/SIS providers are returned."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "providers" in data
        assert "total" in data
        assert data["total"] == 16, f"Expected 16 providers, got {data['total']}"
        assert len(data["providers"]) == 16

    def test_all_expected_providers_present(self):
        """Test all expected providers are present."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        provider_ids = [p["id"] for p in response.json()["providers"]]
        
        expected_providers = [
            # US & Global
            "google_classroom", "canvas", "clever", "classlink", 
            "powerschool", "schoology", "alma",
            # UK
            "arbor", "sims", "bromcom", "scholarpack", "isams", 
            "groupcall", "wonde",
            # File Import
            "ctf_import", "csv_import"
        ]
        
        for pid in expected_providers:
            assert pid in provider_ids, f"Missing provider: {pid}"


# ==================== Region Filtering Tests ====================

class TestRegionFiltering:
    """Tests for region filtering on /api/integrations/providers."""

    def test_filter_uk_region(self):
        """Test filtering by UK region returns UK providers + global."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers?region=uk")
        
        assert response.status_code == 200
        data = response.json()
        
        # UK filter should return UK providers + global providers
        provider_ids = [p["id"] for p in data["providers"]]
        
        # UK-specific providers must be present
        uk_required = ["arbor", "sims", "bromcom", "scholarpack", "isams", 
                       "groupcall", "wonde", "ctf_import"]
        for pid in uk_required:
            assert pid in provider_ids, f"UK provider missing: {pid}"
        
        # Global providers should also be included
        assert "google_classroom" in provider_ids
        assert "canvas" in provider_ids

    def test_filter_us_region(self):
        """Test filtering by US region returns US providers + global."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers?region=us")
        
        assert response.status_code == 200
        provider_ids = [p["id"] for p in response.json()["providers"]]
        
        # US-specific providers
        us_required = ["clever", "classlink", "powerschool", "schoology", "alma"]
        for pid in us_required:
            assert pid in provider_ids, f"US provider missing: {pid}"
        
        # Global providers included
        assert "google_classroom" in provider_ids
        assert "canvas" in provider_ids

    def test_filter_global_region(self):
        """Test filtering by global region returns only global providers."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers?region=global")
        
        assert response.status_code == 200
        providers = response.json()["providers"]
        
        # Should include global providers
        provider_ids = [p["id"] for p in providers]
        assert "google_classroom" in provider_ids
        assert "canvas" in provider_ids
        assert "csv_import" in provider_ids  # csv_import is global


# ==================== UK Provider Tests ====================

class TestUKProviders:
    """Tests for UK-specific providers."""

    def test_arbor_provider(self):
        """Test Arbor Education provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        arbor = next(p for p in providers if p["id"] == "arbor")
        
        assert arbor["name"] == "Arbor Education"
        assert arbor["region"] == "uk"
        assert arbor["category"] == "mis"
        assert "roster_sync" in arbor.get("features", [])
        assert "ctf_import" in arbor.get("features", [])

    def test_sims_provider(self):
        """Test SIMS (Capita) provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        sims = next(p for p in providers if p["id"] == "sims")
        
        assert sims["name"] == "SIMS (Capita)"
        assert sims["region"] == "uk"
        assert sims["category"] == "mis"
        assert "roster_sync" in sims.get("features", [])
        assert "ctf_import" in sims.get("features", [])
        assert "ctf_export" in sims.get("features", [])

    def test_bromcom_provider(self):
        """Test Bromcom MIS provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        bromcom = next(p for p in providers if p["id"] == "bromcom")
        
        assert bromcom["name"] == "Bromcom MIS"
        assert bromcom["region"] == "uk"
        assert bromcom["category"] == "mis"

    def test_scholarpack_provider(self):
        """Test ScholarPack provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        scholarpack = next(p for p in providers if p["id"] == "scholarpack")
        
        assert scholarpack["region"] == "uk"
        assert scholarpack["category"] == "mis"

    def test_isams_provider(self):
        """Test iSAMS provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        isams = next(p for p in providers if p["id"] == "isams")
        
        assert isams["name"] == "iSAMS"
        assert isams["region"] == "uk"
        assert isams["category"] == "mis"

    def test_groupcall_provider(self):
        """Test Groupcall Xporter provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        groupcall = next(p for p in providers if p["id"] == "groupcall")
        
        assert groupcall["name"] == "Groupcall Xporter"
        assert groupcall["region"] == "uk"
        assert groupcall["category"] == "integration"

    def test_wonde_provider(self):
        """Test Wonde provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        wonde = next(p for p in providers if p["id"] == "wonde")
        
        assert wonde["name"] == "Wonde"
        assert wonde["region"] == "uk"
        assert wonde["category"] == "integration"
        assert "universal_connector" in wonde.get("features", [])


# ==================== US Provider Tests ====================

class TestUSProviders:
    """Tests for US-specific providers including Alma."""

    def test_alma_provider(self):
        """Test Alma SIS provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        alma = next(p for p in providers if p["id"] == "alma")
        
        assert alma["name"] == "Alma SIS"
        assert alma["region"] == "us"
        assert alma["category"] == "sis"
        assert alma.get("available") is True
        assert "roster_sync" in alma.get("features", [])
        assert "grade_submission" in alma.get("features", [])


# ==================== File Import Provider Tests ====================

class TestFileImportProviders:
    """Tests for file import providers (CTF, CSV)."""

    def test_ctf_import_provider(self):
        """Test CTF File Import provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        ctf = next(p for p in providers if p["id"] == "ctf_import")
        
        assert ctf["name"] == "CTF File Import"
        assert ctf["region"] == "uk"
        assert ctf["category"] == "file_import"
        assert ctf.get("requires_oauth") is False
        assert ctf.get("requires_api_token") is False
        assert "file_import" in ctf.get("features", [])

    def test_csv_import_provider(self):
        """Test CSV/Excel Import provider."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        providers = response.json()["providers"]
        csv = next(p for p in providers if p["id"] == "csv_import")
        
        assert csv["name"] == "CSV/Excel Import"
        assert csv["region"] == "global"
        assert csv["category"] == "file_import"
        assert "file_import" in csv.get("features", [])


# ==================== Integration Status with Region/Category ====================

class TestIntegrationStatusFields:
    """Tests for /api/integrations/status - verify region and category fields."""

    def test_status_includes_region_field(self, auth_headers):
        """Test status returns providers with region field."""
        response = requests.get(
            f"{BASE_URL}/api/integrations/status",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        providers = response.json()["providers"]
        
        for p in providers:
            assert "region" in p, f"Provider {p['id']} missing region field"
            assert p["region"] in ["global", "us", "uk"]

    def test_status_includes_category_field(self, auth_headers):
        """Test status returns providers with category field."""
        response = requests.get(
            f"{BASE_URL}/api/integrations/status",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        providers = response.json()["providers"]
        
        for p in providers:
            assert "category" in p, f"Provider {p['id']} missing category field"
            assert p["category"] in ["lms", "sis", "mis", "integration", "file_import"]


# ==================== CSV Formats Endpoint ====================

class TestCSVFormats:
    """Tests for GET /api/integrations/import/csv-formats."""

    def test_csv_formats_endpoint(self):
        """Test CSV formats endpoint returns all formats."""
        response = requests.get(f"{BASE_URL}/api/integrations/import/csv-formats")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "formats" in data
        formats = data["formats"]
        
        # Should have 4 formats: SIMS, Arbor, Bromcom, Generic
        assert len(formats) == 4
        
        format_ids = [f["id"] for f in formats]
        assert "sims" in format_ids
        assert "arbor" in format_ids
        assert "bromcom" in format_ids
        assert "generic" in format_ids

    def test_csv_format_sims(self):
        """Test SIMS format details."""
        response = requests.get(f"{BASE_URL}/api/integrations/import/csv-formats")
        
        formats = response.json()["formats"]
        sims = next(f for f in formats if f["id"] == "sims")
        
        assert sims["name"] == "SIMS"
        assert "columns" in sims
        assert "Forename" in sims["columns"]
        assert "Surname" in sims["columns"]
        assert "UPN" in sims["columns"]

    def test_csv_format_arbor(self):
        """Test Arbor format details."""
        response = requests.get(f"{BASE_URL}/api/integrations/import/csv-formats")
        
        formats = response.json()["formats"]
        arbor = next(f for f in formats if f["id"] == "arbor")
        
        assert arbor["name"] == "Arbor Education"
        assert "First name" in arbor["columns"]
        assert "Year group" in arbor["columns"]

    def test_csv_format_bromcom(self):
        """Test Bromcom format details."""
        response = requests.get(f"{BASE_URL}/api/integrations/import/csv-formats")
        
        formats = response.json()["formats"]
        bromcom = next(f for f in formats if f["id"] == "bromcom")
        
        assert bromcom["name"] == "Bromcom"
        assert "FirstName" in bromcom["columns"]
        assert "StudentEmail" in bromcom["columns"]


# ==================== File Import Preview Endpoint ====================

class TestFileImportPreview:
    """Tests for POST /api/integrations/import/preview."""

    def test_preview_requires_auth(self):
        """Test preview endpoint requires authentication."""
        # Create a dummy CSV file
        files = {'file': ('test.csv', 'Name,Email\nJohn,john@test.com', 'text/csv')}
        response = requests.post(
            f"{BASE_URL}/api/integrations/import/preview",
            files=files
        )
        assert response.status_code in [401, 403]

    def test_preview_csv_file(self, auth_headers):
        """Test preview with CSV file."""
        csv_content = "First Name,Last Name,Email\nJohn,Doe,john@test.com\nJane,Smith,jane@test.com"
        files = {'file': ('students.csv', csv_content, 'text/csv')}
        data = {'file_type': 'csv', 'csv_format': 'generic'}
        
        response = requests.post(
            f"{BASE_URL}/api/integrations/import/preview",
            headers=auth_headers,
            files=files,
            data=data
        )
        
        assert response.status_code == 200
        result = response.json()
        
        assert result["success"] is True
        assert result["file_type"] == "csv"
        assert result["students_found"] >= 0
        assert "students" in result

    def test_preview_ctf_file(self, auth_headers):
        """Test preview with CTF/XML file."""
        ctf_content = """<?xml version="1.0" encoding="UTF-8"?>
<CTF>
    <Header>
        <CTFversion>18.0</CTFversion>
    </Header>
    <Pupil>
        <Forename>Test</Forename>
        <Surname>Student</Surname>
        <UPN>A123456789012</UPN>
    </Pupil>
</CTF>"""
        files = {'file': ('students.ctf', ctf_content, 'text/xml')}
        data = {'file_type': 'ctf'}
        
        response = requests.post(
            f"{BASE_URL}/api/integrations/import/preview",
            headers=auth_headers,
            files=files,
            data=data
        )
        
        assert response.status_code == 200
        result = response.json()
        
        assert result["success"] is True
        assert result["file_type"] == "ctf"
        # Should find at least the test student
        assert result["students_found"] >= 1

    def test_preview_auto_detect_csv(self, auth_headers):
        """Test auto-detection of CSV files."""
        csv_content = "First Name,Last Name,Email\nAuto,Detect,auto@test.com"
        files = {'file': ('students.csv', csv_content, 'text/csv')}
        data = {'file_type': 'auto'}
        
        response = requests.post(
            f"{BASE_URL}/api/integrations/import/preview",
            headers=auth_headers,
            files=files,
            data=data
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["file_type"] == "csv"


# ==================== Categories and Regions Metadata ====================

class TestCategoriesAndRegions:
    """Tests for categories and regions metadata in responses."""

    def test_providers_includes_categories(self):
        """Test providers response includes categories."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "categories" in data
        categories = data["categories"]
        
        assert "lms" in categories
        assert "sis" in categories
        assert "mis" in categories
        assert "integration" in categories
        assert "file_import" in categories

    def test_providers_includes_regions(self):
        """Test providers response includes regions."""
        response = requests.get(f"{BASE_URL}/api/integrations/providers")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "regions" in data
        regions = data["regions"]
        
        assert "global" in regions
        assert "us" in regions
        assert "uk" in regions


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
