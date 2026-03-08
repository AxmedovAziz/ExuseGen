import requests

# The token you got after login
token = "your_user_token_here"

# API endpoint to get the current user
url = "http://127.0.0.1:8000/auth/user/"

# Send GET request with token
response = requests.get(url, headers={"Authorization": f"Token {token}"})

if response.status_code == 200:
    user_data = response.json()
    print("Logged in user's name:", user_data.get("username"))
else:
    print("Error:", response.status_code, response.text)
