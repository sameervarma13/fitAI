from fastapi import FastAPI
from sqlmodel import SQLModel, Session, create_engine, select
from typing import List
import openai
from openai import OpenAI
import os
from models import NutritionEntry, BodyEntry, WorkoutEntry, Goal, WeeklyReport, MacroGoal, MacroGoalCreate
from fastapi import Body
from fastapi import APIRouter
from fastapi import UploadFile, File
from io import StringIO
from datetime import datetime
from collections import defaultdict
from fastapi import Depends, HTTPException
import requests
from fastapi.responses import RedirectResponse
from fastapi import Request
from datetime import date
from fastapi.responses import JSONResponse




from fastapi.middleware.cors import CORSMiddleware



api_key = ""
access_token = ""
# Ensure that the OpenAI API key is set in your environment variable
openai.api_key = api_key
os.environ["OPENAI_API_KEY"] = api_key



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 👈 this must match your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db_path = "/Users/sameervarma/Desktop/side_projects/app/fitness.db"
print("💾 Using DB at:", db_path)
engine = create_engine(f"sqlite:///{db_path}", echo=True)


OURA_CLIENT_ID = "Y5RZCMIJEN7CKNAQ"
OURA_CLIENT_SECRET = "3AFIX2LD4CKA5MIAVT2YPQC5RI35ZV4J"
OURA_REDIRECT_URI = "http://localhost:8000/oura/callback"

# Redirect to Oura login
@app.get("/oura/login")
def login_to_oura():
    auth_url = (
        "https://cloud.ouraring.com/oauth/authorize"
        f"?client_id={OURA_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={OURA_REDIRECT_URI}"
        f"&scope=email+personal+daily"
    )
    return RedirectResponse(auth_url)

# Callback to get access token
@app.get("/oura/callback")
def oura_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return {"error": "Missing code"}

    token_url = "https://api.ouraring.com/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": OURA_REDIRECT_URI,
        "client_id": OURA_CLIENT_ID,
        "client_secret": OURA_CLIENT_SECRET,
    }

    response = requests.post(token_url, data=data)
    token_data = response.json()

    # 🔐 Save access_token for later use (in-memory, file, or DB)
    access_token = token_data.get("access_token")
    print("✅ Oura Access Token:", access_token)

    return {"message": "Oura login successful!", "token": access_token}



OURA_REDIRECT_URI = "http://localhost:8000/oura/callback"
OURA_TOKEN_URL = "https://api.ouraring.com/oauth/token"

@app.get("/oura/callback")
async def oura_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return {"error": "Authorization code not found in callback."}

    # Exchange code for token
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": OURA_REDIRECT_URI,
        "client_id": OURA_CLIENT_ID,
        "client_secret": OURA_CLIENT_SECRET
    }

    token_response = requests.post(OURA_TOKEN_URL, data=data)
    if token_response.status_code != 200:
        return {"error": "Token exchange failed", "details": token_response.text}

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    # 🛠️ For now, print the token (we'll store it later)
    print("🔑 Access Token:", access_token)

    # Redirect back to frontend after successful login
    return RedirectResponse(url="http://localhost:5173/oura")


from datetime import datetime, timedelta

from fastapi import APIRouter
from datetime import datetime
import pytz
import requests
from fastapi.responses import JSONResponse

@app.get("/oura/data")
def get_oura_data(start_date: str = None):
    # ⏱️ Determine today in Pacific Time (default)
    pacific = pytz.timezone("America/Los_Angeles")
    today = datetime.now(pacific).date()

    # Parse or default to today
    if start_date:
        date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
    else:
        date_obj = today

    date_str = date_obj.isoformat()
    next_day_str = (date_obj + timedelta(days=1)).isoformat()

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    # 🛏️ Sleep
    sleep_resp = requests.get(
        "https://api.ouraring.com/v2/usercollection/daily_sleep",
        headers=headers,
        params={"start_date": date_str, "end_date": date_str}
    )
    sleep_data = sleep_resp.json().get("data", [])

    # 💡 Readiness
    readiness_resp = requests.get(
        "https://api.ouraring.com/v2/usercollection/daily_readiness",
        headers=headers,
        params={"start_date": date_str, "end_date": date_str}
    )
    readiness_data = readiness_resp.json().get("data", [])

    # 🔥 Activity (end = next day)
    activity_resp = requests.get(
        "https://api.ouraring.com/v2/usercollection/daily_activity",
        headers=headers,
        params={"start_date": date_str, "end_date": next_day_str}
    )
    activity_data = activity_resp.json().get("data", [])

    return JSONResponse({
        "date": date_str,
        "sleep": sleep_data,
        "readiness": readiness_data,
        "activity": activity_data
    })

@app.get("/oura/sleep")
def get_oura_sleep():
      # replace this if still hardcoded

    headers = {"Authorization": f"Bearer {access_token}"}
    end = datetime.now().date()
    start = end - timedelta(days=7)
    params = {
        "start_date": start.isoformat(),
        "end_date": end.isoformat()
    }

    response = requests.get("https://api.ouraring.com/v2/usercollection/sleep", headers=headers, params=params)
    return response.json()



@app.get("/report/context")
def get_report_context():
    with Session(engine) as session:
        goal = session.exec(select(Goal).order_by(Goal.id.desc())).first()
        nutrition = session.exec(select(NutritionEntry).order_by(NutritionEntry.date.desc()).limit(7)).all()
        body = session.exec(select(BodyEntry).order_by(BodyEntry.date.desc()).limit(2)).all()
        workouts = session.exec(select(WorkoutEntry).order_by(WorkoutEntry.date.desc()).limit(5)).all()

    if not goal or len(body) < 2 or not nutrition or not workouts:
        return {"error": "Not enough data for report."}

    prompt = build_prompt(nutrition[::-1], body[::-1], workouts[::-1], goal)

    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a fitness coach helping users achieve body composition goals."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )

    return {
        "prompt": prompt,
        "report": response.choices[0].message.content
    }


def get_session():
    with Session(engine) as session:
        yield session

@app.get("/nutrition/trends")
def get_nutrition_trends(days: int = 7, session: Session = Depends(get_session)):
    from datetime import date, timedelta

    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    entries = session.exec(
        select(NutritionEntry)
        .where(NutritionEntry.date >= start_date, NutritionEntry.date <= end_date)
        .order_by(NutritionEntry.date)
    ).all()

    trend = []
    for e in entries:
        trend.append({
            "date": e.date.isoformat() if hasattr(e.date, "isoformat") else e.date,
            "calories": e.calories,
            "protein": e.protein,
            "carbs": e.carbs,
            "fat": e.fat
        })

    return trend

@app.get("/nutrition/summary/{date}")
def get_nutrition_summary(date: str, session: Session = Depends(get_session)):
    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    nutrition = session.exec(
        select(NutritionEntry).where(NutritionEntry.date == parsed_date)
    ).first()

    if not nutrition:
        raise HTTPException(status_code=404, detail="No nutrition entry found for this date.")

    goal = session.exec(
        select(MacroGoal).where(MacroGoal.start_date <= parsed_date).order_by(MacroGoal.start_date.desc())
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="No macro goal set.")

    def percent(actual, target):
        return round((actual / target) * 100, 1) if target > 0 else 0

    return {
        "date": parsed_date.isoformat(),
        "macros": {
            "calories": {
                "actual": nutrition.calories,
                "target": goal.calories_target,
                "percent": percent(nutrition.calories, goal.calories_target)
            },
            "protein": {
                "actual": nutrition.protein,
                "target": goal.protein_target,
                "percent": percent(nutrition.protein, goal.protein_target)
            },
            "carbs": {
                "actual": nutrition.carbs,
                "target": goal.carbs_target,
                "percent": percent(nutrition.carbs, goal.carbs_target)
            },
            "fat": {
                "actual": nutrition.fat,
                "target": goal.fat_target,
                "percent": percent(nutrition.fat, goal.fat_target)
            }
        }
    }

@app.post("/macro-goals/")
def create_macro_goal(goal_data: MacroGoalCreate, session: Session = Depends(get_session)):
    goal = MacroGoal(**goal_data.dict())
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal

@app.get("/macro-goals/current")
def get_current_macro_goal(session: Session = Depends(get_session)):
    today = date.today()
    statement = select(MacroGoal).where(
    MacroGoal.start_date <= today
    ).order_by(MacroGoal.start_date.desc())
    result = session.exec(statement).first()
    return result




# Nutrition
@app.post("/nutrition")
def log_bulk_nutrition(entries: List[NutritionEntry]):
    with Session(engine) as session:
        updated = 0
        for entry in entries:
            # ✅ Ensure date is parsed correctly
            if isinstance(entry.date, str):
                try:
                    entry.date = datetime.strptime(entry.date, "%Y-%m-%d").date()
                except ValueError:
                    print(f"❌ Invalid date format: {entry.date}")
                    continue

            print(f"⏱️ Checking entry for date: {entry.date}")

            # ✅ Check for existing entry by date
            existing = session.exec(
                select(NutritionEntry).where(NutritionEntry.date == entry.date)
            ).first()

            if existing:
                print("🔁 Existing entry found — updating.")
                for field, value in entry.dict(exclude_unset=True).items():
                    if field != "id":
                        setattr(existing, field, value)
            else:
                print("➕ No entry found — adding new entry.")
                session.add(entry)

            updated += 1

        session.commit()
        print(f"✅ Done. {updated} nutrition entries saved or updated.")
    return {"message": f"{updated} nutrition entries saved or updated."}


@app.get("/nutrition")
def get_nutrition():
    with Session(engine) as session:
        return session.exec(select(NutritionEntry)).all()

# Body Comp
@app.post("/body-composition")
def log_bulk_body(entries: List[BodyEntry]):
    with Session(engine) as session:
        session.add_all(entries)
        session.commit()
    return {"message": f"{len(entries)} body entries saved."}

@app.get("/body-composition")
def get_body():
    with Session(engine) as session:
        return session.exec(select(BodyEntry)).all()

# Workouts
from datetime import datetime, date

@app.post("/workout")
def log_bulk_workout(entries: List[WorkoutEntry]):
    with Session(engine) as session:
        for entry in entries:
            if isinstance(entry.date, str):
                entry.date = datetime.strptime(entry.date, "%Y-%m-%d").date()
        session.add_all(entries)
        session.commit()
    return {"message": f"{len(entries)} workouts saved."}

@app.get("/workout")
def get_workouts():
    with Session(engine) as session:
        return session.exec(select(WorkoutEntry)).all()

# Goal
@app.post("/user/goal")
def set_goal(goal: Goal):
    with Session(engine) as session:
        session.add(goal)
        session.commit()
    return {"message": "Goal saved."}


@app.get("/user/goal")
def get_goal():
    with Session(engine) as session:
        goal = session.exec(select(Goal).order_by(Goal.id.desc())).first()
        return goal or {"message": "No goal set"}

# Report
from datetime import date, timedelta

@app.get("/report/latest")
def get_latest_report():
    with Session(engine) as session:
        latest = session.exec(select(WeeklyReport).order_by(WeeklyReport.created_at.desc())).first()
        if not latest:
            return {"error": "No report available"}
        return {
            "report": latest.content,
            "prompt": latest.prompt
        }

@app.get("/report")
def generate_report():
    with Session(engine) as session:
        goal = session.exec(select(Goal).order_by(Goal.id.desc())).first()
        nutrition = session.exec(select(NutritionEntry).where(NutritionEntry.date >= date.today() - timedelta(days=7))).all()
        body = session.exec(select(BodyEntry).where(BodyEntry.date >= date.today() - timedelta(days=7))).all()
        workouts = session.exec(select(WorkoutEntry).where(WorkoutEntry.date >= date.today() - timedelta(days=7))).all()

        if not goal or len(nutrition) < 1 or len(body) < 2 or len(workouts) < 1:
            return {"error": "Not enough data for report"}

        prompt = build_prompt(nutrition[::-1], body[::-1], workouts[::-1], goal)
        client = OpenAI()

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a fitness coach helping users achieve body composition goals."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )

        report_text = response.choices[0].message.content

        # Save to DB
        report_entry = WeeklyReport(content=report_text, prompt=prompt)
        session.add(report_entry)
        session.commit()

        return {"report": report_text, "prompt": prompt}



@app.post("/report/chat")
def chat_with_coach(data: dict = Body(...)):
    report = data["report"]
    prompt = data["prompt"]
    question = data["question"]

    messages = [
        {"role": "system", "content": (
            "You are a friendly and supportive AI fitness coach. "
            "Your goal is to help users based on their fitness reports, but always respond in a casual, natural, and encouraging tone. "
            "Avoid using structured report formatting like numbered or bulleted lists unless the user explicitly asks for a list. "
            "Use short paragraphs and conversational language, as if texting or chatting with a friend."
        )},
        {"role": "user", "content": prompt},
        {"role": "assistant", "content": report},
        {"role": "user", "content": question}
    ]

    client = OpenAI()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7
    )
    return {"response": response.choices[0].message.content}

def build_prompt(nutrition, body, workouts, goal):
    return f"""
Here is a user's fitness data for the past week:

🔹 Nutrition (avg daily):
{average_macros(nutrition)}

🔹 Body Composition:
Previous: {body[0].weight} lbs, {body[0].body_fat}% fat, {body[0].muscle_mass} lbs muscle
Current: {body[1].weight} lbs, {body[1].body_fat}% fat, {body[1].muscle_mass} lbs muscle

🔹 Workouts:
{format_workouts(workouts)}

🔹 Goal:
User is trying to {goal.goal_type} to {goal.target_weight} lbs and {goal.target_body_fat}% body fat in {goal.timeframe_weeks} weeks.

---

Please analyze this data and respond in **Markdown format** using **the following 4 sections** with clear headings:

### ✅ What's Going Well
(Bullet point list of positive trends or consistent habits)

### ⚠️ What Could Be Improved
(Bullet point list of areas that need attention or adjustment)

### 📊 Progress Summary
(A paragraph summarizing trends in weight, body fat, muscle)

### 🎯 Recommendations for Next Week
(A bullet list of specific, actionable suggestions tailored to the user’s goal)

Only include these 4 sections using the same exact headings shown above. Keep it concise, supportive, and data-informed.
"""

from fastapi import UploadFile
import csv
from io import StringIO
from datetime import datetime
from dateutil import parser  # ✅ for robust date parsing

@app.post("/upload/body-csv")
async def upload_body_csv(file: UploadFile):
    contents = await file.read()
    decoded = contents.decode('utf-8')
    reader = csv.DictReader(StringIO(decoded))

    # ✅ Normalize headers (strip spaces)
    rows = []
    for row in reader:
        cleaned = {k.strip(): v for k, v in row.items()}
        rows.append(cleaned)

    # ✅ Field mapping from cleaned CSV headers to model field names
    field_map = {
        "Time of Measurement": "date",
        "Weight(lb)": "weight",
        "Body Fat(%)": "body_fat",
        "Muscle Mass(lb)": "muscle_mass",
        "Skeletal Muscle(%)": "skeletal_muscle",
        "BMI": "bmi",
        "Visceral Fat": "visceral_fat",
        "Body Water(%)": "body_water",
        "Bone Mass(lb)": "bone_mass",
        "BMR(kcal)": "bmr",
        "Metabolic Age": "metabolic_age",
        "Protein (%)": "protein",
    }

    updated = 0
    with Session(engine) as session:
        for row in rows:
            # Parse and normalize date
            try:
                raw_date = row.get("Time of Measurement", "").replace("  ", " ")
                date_obj = parser.parse(raw_date).date()
            except Exception:
                continue  # skip invalid date rows

            # Check for existing entry
            existing = session.exec(select(BodyEntry).where(BodyEntry.date == date_obj)).first()

            # Build entry data dict
            entry_data = {"date": date_obj}
            for csv_key, model_key in field_map.items():
                if model_key == "date":
                    continue
                raw_val = row.get(csv_key, "").strip()
                if raw_val:
                    try:
                        entry_data[model_key] = float(raw_val) if "." in raw_val or "e" in raw_val.lower() else int(raw_val)
                    except ValueError:
                        continue

            # Save or update
            if existing:
                for key, value in entry_data.items():
                    setattr(existing, key, value)
            else:
                session.add(BodyEntry(**entry_data))

            updated += 1

        session.commit()

    return {"message": f"{updated} body composition entries uploaded/updated."}



@app.get("/body-composition/full")
def get_body_full():
    with Session(engine) as session:
        return session.exec(select(BodyEntry).order_by(BodyEntry.date.desc())).all()




@app.post("/upload/nutrition-csv")
async def upload_nutrition_csv(file: UploadFile = File(...)):
    contents = await file.read()
    decoded = contents.decode('utf-8')
    reader = csv.DictReader(StringIO(decoded))

    # Field mapping: CSV column → model field
    field_map = {
        "Date": "date",
        "Calories": "calories",
        "Fat (g)": "fat",
        "Saturated Fat": "saturated_fat",
        "Polyunsaturated Fat": "polyunsaturated_fat",
        "Monounsaturated Fat": "monounsaturated_fat",
        "Trans Fat": "trans_fat",
        "Cholesterol": "cholesterol",
        "Sodium (mg)": "sodium",
        "Potassium": "potassium",
        "Carbohydrates (g)": "carbs",
        "Fiber": "fiber",
        "Sugar": "sugar",
        "Protein (g)": "protein",
        "Vitamin A": "vitamin_a",
        "Vitamin C": "vitamin_c",
        "Calcium": "calcium",
        "Iron": "iron"
    }

    # Step 1: Group and sum by date
    grouped = defaultdict(lambda: defaultdict(float))
    for row in reader:
        date_str = row.get("Date", "").strip()
        if not date_str:
            continue

        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            try:
                date_obj = datetime.strptime(date_str, "%m/%d/%Y").date()
            except Exception as e:
                print("❌ Failed to parse date:", date_str)
                continue

        for csv_key, model_key in field_map.items():
            if csv_key == "Date":
                continue
            val = row.get(csv_key, "").strip()
            try:
                grouped[date_obj][model_key] += float(val)
            except:
                continue

    # Step 2: Write to DB
    updated = 0
    with Session(engine) as session:
        for date_obj, data in grouped.items():
            existing = session.exec(select(NutritionEntry).where(NutritionEntry.date == date_obj)).first()
            entry_data = {"date": date_obj, **data}

            if existing:
                for k, v in entry_data.items():
                    setattr(existing, k, v)
            else:
                session.add(NutritionEntry(**entry_data))

            updated += 1
        session.commit()

    return {"message": f"{updated} daily nutrition summaries uploaded."}




def average_macros(entries):
    if not entries:
        return "No nutrition data"
    total = {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
    for e in entries:
        total["calories"] += e.calories
        total["protein"] += e.protein
        total["carbs"] += e.carbs
        total["fat"] += e.fat
    n = len(entries)
    return f"{total['calories']//n} kcal, {total['protein']//n}g protein, {total['carbs']//n}g carbs, {total['fat']//n}g fat"

def format_workouts(workouts):
    return "\n".join([f"{w.date}: {w.exercise} — {w.sets}x{w.reps} @ {w.weight} lbs" for w in workouts])
