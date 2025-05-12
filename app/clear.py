from sqlmodel import Session, create_engine
from models import NutritionEntry, BodyEntry, WorkoutEntry, Goal

engine = create_engine("sqlite:///fitness.db")

def clear_all_data():
    with Session(engine) as session:
        session.exec("DELETE FROM nutritionentry")
        session.exec("DELETE FROM bodyentry")
        session.exec("DELETE FROM workoutentry")
        session.exec("DELETE FROM goal")
        session.commit()
        print("✅ All data cleared from the database.")

if __name__ == "__main__":
    clear_all_data()
