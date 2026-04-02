import requests

# Replace with your actual login endpoint
url = "http://localhost:8000/api-token-auth/"

# Your user credentials
credentials = {
    "username": "admin",
    "password": "qweqweqwe"
}

response = requests.post(url, data=credentials)

if response.status_code == 200:
    token = response.json().get('token')
    print(f"Your token: {token}")
else:
    print(f"Failed to get token: {response.status_code} - {response.text}")