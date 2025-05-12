import requests

file_path = "new_body_comp_data.csv"

with open(file_path, "rb") as f:
    files = {"file": ("new_body_comp_data.csv", f, "text/csv")}
    response = requests.post("http://localhost:8000/upload/body-csv", files=files)

if response.status_code == 200:
    print("✅ Upload successful!")
    print(response.json())
else:
    print("❌ Upload failed")
    print(response.status_code, response.text)
