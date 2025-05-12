
import requests
import json

# Load synthetic nutrition data
with open("synthetic_nutrition_data.json", "r") as f:
    data = json.load(f)

# Send to FastAPI bulk nutrition endpoint
response = requests.post("http://localhost:8000/nutrition", json=data)

# Print result
print("Status code:", response.status_code)
print("Response:", response.json())
