
import base64
import os
import requests
import time
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
import mimetypes

# Constants
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
API_ENDPOINT = 'http://localhost:8000/upload/body-csv'  # Your FastAPI endpoint

def authenticate_gmail():
    creds = None
    token_path = 'token.json'
    creds_path = 'credentials.json'

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(creds_path, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)

def find_renpho_csvs(service):
    results = service.users().messages().list(userId='me', q='filename:csv has:attachment').execute()
    messages = results.get('messages', [])
    renpho_csvs = []

    for msg in messages:
        msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
        for part in msg_data['payload'].get('parts', []):
            filename = part.get('filename')
            if filename and 'renpho' in filename.lower() and part['body'].get('attachmentId'):
                attachment = service.users().messages().attachments().get(
                    userId='me',
                    messageId=msg['id'],
                    id=part['body']['attachmentId']
                ).execute()

                file_data = base64.urlsafe_b64decode(attachment['data'])
                renpho_csvs.append((filename, file_data))

    return renpho_csvs

def upload_to_fastapi(filename, file_data):
    files = {
        'file': (filename, file_data, 'text/csv')
    }
    response = requests.post(API_ENDPOINT, files=files)
    return response

def main():
    print("🔐 Authenticating with Gmail...")
    service = authenticate_gmail()
    print("📥 Searching for Renpho CSV attachments...")
    csvs = find_renpho_csvs(service)

    if not csvs:
        print("❌ No Renpho CSV attachments found.")
        return

    for filename, file_data in csvs:
        print(f"⬆️ Uploading {filename} to FastAPI...")
        res = upload_to_fastapi(filename, file_data)
        if res.status_code == 200:
            print(f"✅ {filename} uploaded successfully!")
        else:
            print(f"❌ Failed to upload {filename}: {res.status_code} - {res.text}")

if __name__ == '__main__':
    main()
