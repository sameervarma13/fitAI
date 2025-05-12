
import os
import io
import base64
import zipfile
import requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request


SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
UPLOAD_ENDPOINT = 'http://localhost:8000/upload/nutrition-csv'

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

def find_mfp_zip(service):
    results = service.users().messages().list(userId='me', q='filename:zip has:attachment').execute()
    messages = results.get('messages', [])

    for msg in messages:
        msg_data = service.users().messages().get(userId='me', id=msg['id']).execute()
        for part in msg_data['payload'].get('parts', []):
            filename = part.get('filename', '')
            if filename.lower().startswith('file-export') and filename.endswith('.zip'):
                attachment_id = part['body'].get('attachmentId')
                attachment = service.users().messages().attachments().get(
                    userId='me', messageId=msg['id'], id=attachment_id
                ).execute()
                data = base64.urlsafe_b64decode(attachment['data'])
                return filename, data
    return None, None

def extract_nutrition_csv(zip_bytes):
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as z:
        for name in z.namelist():
            if name.lower().startswith("nutrition-summary") and name.endswith(".csv"):
                with z.open(name) as f:
                    return name, f.read()
    return None, None

def upload_csv_to_fastapi(filename, csv_bytes):
    files = {'file': (filename, csv_bytes, 'text/csv')}
    response = requests.post(UPLOAD_ENDPOINT, files=files)
    if response.status_code == 200:
        print(f"✅ Successfully uploaded: {filename}")
    else:
        print(f"❌ Upload failed: {response.status_code} - {response.text}")

def main():
    print("🔐 Authenticating Gmail...")
    service = authenticate_gmail()
    print("📥 Looking for MyFitnessPal ZIP...")
    zip_name, zip_data = find_mfp_zip(service)
    if not zip_data:
        print("❌ No ZIP file found.")
        return

    print(f"📦 Found ZIP: {zip_name}")
    csv_name, csv_bytes = extract_nutrition_csv(zip_data)
    if not csv_bytes:
        print("❌ No Nutrition-Summary CSV found in ZIP.")
        return

    print(f"⬆️ Uploading CSV: {csv_name}")
    upload_csv_to_fastapi(csv_name, csv_bytes)

if __name__ == '__main__':
    main()
