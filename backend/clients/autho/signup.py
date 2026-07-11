import requests

url = "http://127.0.0.1:8000/auth/registration/"
data = {
    "username": "aziz",
    "email": "aziz@example.com",
    "password1": "StrongPass123!",
    "password2": "StrongPass123!"
}

response = requests.post(url, json=data)
print(response.status_code)
print(response.json())
