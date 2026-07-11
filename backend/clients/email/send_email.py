import requests

access_token = "1851397a532d80f119d56bd9a0ac2512e22ad7a6"
send_url = "http://localhost:8000/auth/api/send-email/"
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}
email_data = {
    "to_email": "reaziz9259658@gmail.com",
    "subject": "Test email",
    "message": "Hello from Gmail API via Python!"
}
resp = requests.post(send_url, json=email_data, headers=headers)
print(resp.status_code, resp.json())