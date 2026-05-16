import requests

BASE_URL = "http://localhost:3000"
CHECKOUT_ENDPOINT = "/api/checkout"
TIMEOUT = 30

def test_postapi_checkout_submitorderform():
    url = BASE_URL + CHECKOUT_ENDPOINT
    headers = {
        "Content-Type": "application/json"
    }
    # Sample valid order form data
    payload = {
        "name": "John Doe",
        "phone": "1234567890",
        "delivery_address": "123 Main Street",
        "wilaya": "Algiers"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

    # Validate HTTP status code - expecting success (likely 200 or 201)
    assert response.status_code in (200, 201), f"Unexpected status code: {response.status_code}"

    # The response should indicate successful order processing
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Check for 'success' key and it should be True
    assert data.get("success") is True, "Response JSON does not indicate successful order"

    # If redirectUrl provided, validate it's the success confirmation page
    redirect_url = data.get("redirectUrl")
    if redirect_url:
        assert redirect_url.endswith("/success"), f"Redirect URL does not point to success page: {redirect_url}"


test_postapi_checkout_submitorderform()
