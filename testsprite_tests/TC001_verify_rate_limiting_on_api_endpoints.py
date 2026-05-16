import requests
import time

BASE_URL = "http://localhost:3000"

def test_verify_rate_limiting_on_api_endpoints():
    """
    Test the global rate limiting middleware on /api/* endpoints:
    - 100 requests per minute for general endpoints
    - 5 requests per 15 minutes for authentication endpoints
    Expect HTTP 429 when limit exceeded.
    """

    session = requests.Session()
    timeout = 30
    headers = {
        "Accept": "application/json"
    }

    # Test endpoints under /api/, assumed for limit enforcement.
    # Since PRD does not define explicit API endpoints,
    # we assume typical endpoints for auth and general.

    # Example authentication endpoint (under /api/auth)
    auth_endpoint = f"{BASE_URL}/api/auth/login"
    auth_payload = {
        "username": "testuser",
        "password": "password"
    }

    # Example general API endpoint
    general_endpoint = f"{BASE_URL}/api/products"
    
    # Helper function to send requests and count 429 responses
    def flood_requests(url, method="GET", data=None, max_reqs=120):
        """Send up to max_reqs and collect responses."""
        status_codes = []
        for i in range(max_reqs):
            try:
                if method == "POST":
                    resp = session.post(url, json=data, headers=headers, timeout=timeout)
                else:
                    resp = session.get(url, headers=headers, timeout=timeout)

                status_codes.append(resp.status_code)
                if resp.status_code == 429:
                    # Limit hit
                    break
            except requests.RequestException as e:
                # Treat exceptions as failure to send
                raise AssertionError(f"Request failed unexpectedly: {e}") from e
        return status_codes

    # Test rate limit on auth endpoint: max 5 requests per 15 minutes

    auth_status_codes = flood_requests(auth_endpoint, method="POST", data=auth_payload, max_reqs=10)
    # There should be at least one 429 after 5 requests
    auth_429_count = auth_status_codes.count(429)
    auth_success_count = sum(1 for code in auth_status_codes if code != 429)
    assert auth_success_count <= 5, f"Auth endpoint allowed more than 5 successful requests: {auth_success_count}"
    assert auth_429_count >= 1, "Auth endpoint did not return 429 status code after exceeding rate limit"

    # Test rate limit on general endpoint: max 100 requests per minute
    general_status_codes = flood_requests(general_endpoint, method="GET", max_reqs=120)
    general_429_count = general_status_codes.count(429)
    general_success_count = sum(1 for code in general_status_codes if code != 429)
    assert general_success_count <= 100, f"General endpoint allowed more than 100 successful requests: {general_success_count}"
    assert general_429_count >= 1, "General endpoint did not return 429 status code after exceeding rate limit"

test_verify_rate_limiting_on_api_endpoints()