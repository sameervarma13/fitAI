from sqlmodel import Session, create_engine
from models import NutritionEntry, BodyEntry, WorkoutEntry, Goal
from datetime import date, timedelta

engine = create_engine("sqlite:///fitness.db")

def seed():
    today = date.today()
    with Session(engine) as session:
        # Nutrition entries
        for i in range(7):
            session.add(NutritionEntry(
                date=today - timedelta(days=i),
                calories=2300 + i * 10,
                protein=140 + i,
                carbs=250 - i * 2,
                fat=70 - i
            ))

        # Body comp entries (2 for report)
        for i in range(7):
            session.add(BodyEntry(
                date=today - timedelta(days=i),
                weight=168 - i * 0.3,
                body_fat=16.0 - i * 0.1,
                muscle_mass=134 - i * 0.2
            ))

        # Workouts
        exercises = ["Bench Press", "Squat", "RDL", "Pull-ups", "Overhead Press", "Incline Bench", "Barbell Row"]
        for i in range(7):
            session.add(WorkoutEntry(
                date=today - timedelta(days=i),
                exercise=exercises[i % len(exercises)],
                sets=3 + (i % 2),
                reps=8 + (i % 3),
                weight=95 + i * 5
            ))

        # Goal
        session.add(Goal(
            goal_type="cut",
            target_weight=160.0,
            target_body_fat=12.0,
            timeframe_weeks=8
        ))

        session.commit()
        print("✅ Seeded database with mock data.")

if __name__ == "__main__":
    seed()
