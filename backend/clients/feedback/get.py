import requests

resp = requests.post("http://127.0.0.1:8000/auth/jwt/create/", json={
    "username": "admin",
    "password": "qweqweqwe"
})

tokens = resp.json()
access  = tokens["access"]   # short-lived, use for requests
refresh = tokens["refresh"]  # long-lived, use to renew access
# print("Access token:", access)
# print("Refresh token:", refresh)
headers = {"Authorization": f"Bearer {access}"}

me = requests.get("http://127.0.0.1:8000/auth/me/", headers=headers).json()
print(me)