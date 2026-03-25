import os
import pickle
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from django.conf import settings

# If modifying these SCOPES, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service(user_email):
    """Get Gmail API service for a specific user"""
    creds = None
    token_path = f'token_{user_email}.pickle'
    
    # Token file stores the user's access and refresh tokens
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
    
    # If there are no (valid) credentials available, let the user log in
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=8080)
        
        # Save the credentials for the next run
        with open(token_path, 'wb') as token:
            pickle.dump(creds, token)
    
    return build('gmail', 'v1', credentials=creds)

def send_email_gmail(user_email, to_email, subject, message_text):
    """Send email using Gmail API"""
    try:
        service = get_gmail_service(user_email)
        
        # Create email message
        import base64
        from email.mime.text import MIMEText
        
        message = MIMEText(message_text)
        message['to'] = to_email
        message['from'] = user_email
        message['subject'] = subject
        
        # Encode the message
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        # Send the email
        sent_message = service.users().messages().send(
            userId='me',
            body={'raw': raw}
        ).execute()
        
        return {'success': True, 'message_id': sent_message['id']}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}
    
from excuses.gmail_service import send_email_gmail

# result = send_email_gmail(
#     user_email='aziz9259658@gmail.com',
#     to_email='aziz9259657@gmail.com',  # change to any recipient
#     subject='Hello from Gmail API',
#     message_text='This email was sent using the Gmail API!'
# )
# print(result)