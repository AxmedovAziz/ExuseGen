import requests

BASE_URL = "http://127.0.0.1:8000/auth/me/"  # adjust if needed
# TOKEN = "989db7b34feead91ecf5ff0414ba02ed5e6c6aa6"  # e.g. DRF token or JWT
# TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90e…jEifQ.FyujVkS1ZmumENRaKlv-eGpLX7FJSFd_gt8y_HE0Ec8"      # e.g. DRF token or JWT
TOKEN = "8688c4cc93d0a0cd6620da82709b19f3e85d92f0"  # e.g. DRF token or JWT

headers = {
    "Authorization": f"Bearer {TOKEN}",   # or: f"Bearer {TOKEN}" for JWT
    "Accept": "application/json",
}

resp = requests.get(BASE_URL, headers=headers)
resp.raise_for_status()  # raise error if not 2xx

data = resp.json()
print("Full response:", data)

is_admin = bool(data.get("is_admin"))
print("Is admin:", is_admin)