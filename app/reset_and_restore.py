import os
import subprocess
from sqlmodel import SQLModel, Session, create_engine
from models import BodyEntry, NutritionEntry, WorkoutEntry, Goal
import csv
from datetime import datetime

DB_PATH = "fitness.db"
EXPORT_FOLDER = "exports"
engine = create_engine(f"sqlite:///{DB_PATH}")

def export_existing_data():
    print("📦 Exporting existing data...")
    subprocess.run(["python", "exports.py"], check=True)

def delete_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("🗑️  Deleted old fitness.db")

def recreate_tables():
    print("🛠️  Recreating database schema...")
    SQLModel.metadata.create_all(engine)

def import_csv_to_table(model_class, filename, parse_row_fn):
    path = os.path.join(EXPORT_FOLDER, filename)
    if not os.path.exists(path):
        print(f"⚠️  Skipping {filename} (not found)")
        return
    with open(path, newline='') as f:
        reader = csv.DictReader(f)
        entries = [parse_row_fn(row) for row in reader]

    with Session(engine) as session:
        session.add_all(entries)
        session.commit()
        print(f"✅ Restored {len(entries)} rows to {model_class.__name__}")

def parse_body(row):
    return BodyEntry(
        date=datetime.strptime(row["date"], "%Y-%m-%d").date(),
        weight=float(row["weight"]),
        body_fat=float(row["body_fat"]),
        muscle_mass=float(row["muscle_mass"]),
        bmi=float(row.get("bmi", 0) or 0),
        visceral_fat=float(row.get("visceral_fat", 0) or 0),
        body_water=float(row.get("body_water", 0) or 0),
        bone_mass=float(row.get("bone_mass", 0) or 0),
        bmr=int(row.get("bmr", 0) or 0),
        metabolic_age=int(row.get("metabolic_age", 0) or 0),
        protein=float(row.get("protein", 0) or 0),
        skeletal_muscle=float(row.get("skeletal_muscle", 0) or 0)
    )

def parse_nutrition(row):
    return NutritionEntry(
        date=datetime.strptime(row["date"], "%Y-%m-%d").date(),
        calories=int(row.get("calories", 0)),
        protein=float(row.get("protein", 0)),
        carbs=float(row.get("carbs", 0)),
        fat=float(row.get("fat", 0)),
        meal=row.get("meal"),
        saturated_fat=float(row.get("saturated_fat", 0) or 0),
        sodium=float(row.get("sodium", 0) or 0),
        sugar=float(row.get("sugar", 0) or 0),
        note=row.get("note")
        # Add more fields if needed
    )


def parse_workout(row):
    return WorkoutEntry(
        date=datetime.strptime(row["date"], "%Y-%m-%d").date(),
        exercise=row["exercise"],
        sets=int(row["sets"]),
        reps=int(row["reps"]),
        weight=float(row["weight"])
    )

def parse_goal(row):
    return Goal(
        goal_type=row["goal_type"],
        target_weight=float(row["target_weight"]),
        target_body_fat=float(row["target_body_fat"]),
        timeframe_weeks=int(row["timeframe_weeks"])
    )

def restore_data():
    import_csv_to_table(BodyEntry, "body_composition.csv", parse_body)
    import_csv_to_table(NutritionEntry, "nutrition.csv", parse_nutrition)
    import_csv_to_table(WorkoutEntry, "workouts.csv", parse_workout)
    import_csv_to_table(Goal, "goal.csv", parse_goal)

if __name__ == "__main__":
    delete_db()
    recreate_tables()
    restore_data()
    print("🎉 Reset and restore complete!")
