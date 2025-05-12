
import os
import base64
import requests
import mimetypes
from email import message_from_bytes
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these SCOPES, delete the token.json file
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def authenticate_gmail():
    flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
    creds = flow.run_local_server(port=0)
    return build('gmail', 'v1', credentials=creds)

def get_renpho_csv_attachments(service, user_id='me'):
    results = service.users().messages().list(userId=user_id, q="filename:csv").execute()
    messages = results.get('messages', [])
    
    for msg in messages:
        msg_data = service.users().messages().get(userId=user_id, id=msg['id']).execute()
        parts = msg_data.get('payload', {}).get('parts', [])
        for part in parts:
            filename = part.get('filename')
            if filename and "renpho" in filename.lower() and filename.endswith('.csv'):
                attachment_id = part['body'].get('attachmentId')
                attachment = service.users().messages().attachments().get(userId=user_id, messageId=msg['id'], id=attachment_id).execute()
                data = base64.urlsafe_b64decode(attachment['data'].encode('UTF-8'))
                
                with open(filename, 'wb') as f:
                    f.write(data)
                print(f"✅ Saved attachment: {filename}")
                return filename
    return None

if __name__ == '__main__':
    gmail_service = authenticate_gmail()
    get_renpho_csv_attachments(gmail_service)
