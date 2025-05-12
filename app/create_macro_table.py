from sqlmodel import SQLModel, create_engine
from models import MacroGoal

engine = create_engine("sqlite:////Users/sameervarma/Desktop/side_projects/app/fitness.db")
SQLModel.metadata.create_all(engine)
