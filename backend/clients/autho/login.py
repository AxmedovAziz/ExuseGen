import requests

url = "http://127.0.0.1:8000/auth/login/"
data = {
    # "email": "aziz@example.com",
    # "password": "StrongPass123!",
    "username": "admin",
    "password": "qweqwe"
}

response = requests.post(url, json=data)
token = response.json().get("key")
print("Token:", token)
