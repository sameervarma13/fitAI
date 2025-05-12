import os
import json
import csv
from sqlmodel import Session, create_engine, select
from models import NutritionEntry, BodyEntry, WorkoutEntry, Goal

engine = create_engine("sqlite:///fitness.db")
export_folder = "exports"
os.makedirs(export_folder, exist_ok=True)

def export_to_json(data, filename):
    with open(os.path.join(export_folder, filename), "w") as f:
        json.dump([d.model_dump() for d in data], f, indent=2, default=str)


def export_to_csv(data, filename):
    if not data:
        return
    with open(os.path.join(export_folder, filename), "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].model_dump().keys())
        writer.writeheader()
        for item in data:
            writer.writerow(item.model_dump())

def export_all():
    with Session(engine) as session:
        # nutrition = session.exec(select(NutritionEntry)).all()
        workout = session.exec(select(WorkoutEntry)).all()
        goal = session.exec(select(Goal)).all()

        # export_to_json(nutrition, "nutrition.json")
        # export_to_csv(nutrition, "nutrition.csv")

        # ⚠️ Temporarily skip BodyEntry to avoid schema mismatch
        # body = session.exec(select(BodyEntry)).all()
        # export_to_json(body, "body_composition.json")
        # export_to_csv(body, "body_composition.csv")

        export_to_json(workout, "workouts.json")
        export_to_csv(workout, "workouts.csv")

        export_to_json(goal, "goal.json")
        export_to_csv(goal, "goal.csv")

        print("✅ Exported nutrition, workout, and goal data")


if __name__ == "__main__":
    export_all()
