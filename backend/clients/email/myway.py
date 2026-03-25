import requests

class GmailSender:
    """
    Sends emails via your Django backend using the user's Gmail OAuth token.
    The user must have logged in with Google at least once to link their Gmail.
    """

    BASE_URL = "http://localhost:8000"

    def __init__(self, username: str, password: str):
        self.username = username
        self.password = password
        self.access_token = None
        self._login()

    def _login(self) -> None:
        """Login to your Django backend and store the JWT access token."""
        url = f"{self.BASE_URL}/auth/simple/login/"
        response = requests.post(url, json={
            "username": self.username,
            "password": self.password,
        })

        if response.status_code == 200:
            self.access_token = response.json().get("access")
            print(f"✅ Logged in as {self.username}")
        else:
            raise Exception(f"❌ Login failed: {response.json()}")

    def _get_headers(self) -> dict:
        """Build auth headers using the stored JWT token."""
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    def send(self, to: str, subject: str, body: str) -> dict:
        """
        Send a single email via the Django backend.

        Args:
            to:      recipient email e.g. "friend@example.com"
            subject: email subject line
            body:    plain text email body

        Returns:
            dict with success status and message or error detail
        """
        url = f"{self.BASE_URL}/auth/send-email/"

        payload = {
            "to": to,
            "subject": subject,
            "body": body,
        }

        try:
            response = requests.post(url, json=payload, headers=self._get_headers())

            # Token might have expired — try re-logging in once and retry
            if response.status_code == 401:
                print("🔄 Token expired, re-logging in...")
                self._login()
                response = requests.post(url, json=payload, headers=self._get_headers())

            response.raise_for_status()
            return {"success": True, "message": f"Email sent to {to}"}

        except requests.exceptions.HTTPError:
            return {
                "success": False,
                "error": f"HTTP {response.status_code}",
                "detail": response.json(),
            }
        except requests.exceptions.ConnectionError:
            return {
                "success": False,
                "error": "Could not connect to backend. Is Django running?",
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
            }


# ── Example usage ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    sender = GmailSender(username="alfa9259659@gmail.com", password="Alfa0616")
    # sender = GmailSender(username="alfa9259659@gmail.com", password="Aziz0616")

    result = sender.send(
        to="aziz9259657@gmail.com",
        subject="Hello from Gmail API!",
        body="This email was sent via Django + Gmail OAuth2 🎉"
    )

    print(result)