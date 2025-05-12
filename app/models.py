from sqlmodel import SQLModel, Field, UniqueConstraint
from typing import Optional
from datetime import date
from pydantic import BaseModel
from datetime import date




class WeeklyReport(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    content: str
    prompt: str
    created_at: date = Field(default_factory=date.today)

class NutritionEntry(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("date"),)  # ✅ Ensure only one entry per day

    id: Optional[int] = Field(default=None, primary_key=True)
    date: str
    calories: Optional[int]
    protein: Optional[float]
    carbs: Optional[float]
    fat: Optional[float]
    
    # 🔽 Add any new fields you're parsing
    meal: Optional[str] = None
    saturated_fat: Optional[float] = None
    polyunsaturated_fat: Optional[float] = None
    monounsaturated_fat: Optional[float] = None
    trans_fat: Optional[float] = None
    cholesterol: Optional[float] = None
    sodium: Optional[float] = None
    potassium: Optional[float] = None
    fiber: Optional[float] = None
    sugar: Optional[float] = None
    vitamin_a: Optional[float] = None
    vitamin_c: Optional[float] = None
    calcium: Optional[float] = None
    iron: Optional[float] = None
    note: Optional[str] = None


class BodyEntry(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("date"),)  # ✅ Ensure only one entry per day
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    weight: float
    body_fat: float
    muscle_mass: float

    # New optional Renpho fields
    bmi: Optional[float] = None
    visceral_fat: Optional[float] = None
    body_water: Optional[float] = None
    bone_mass: Optional[float] = None
    bmr: Optional[int] = None
    metabolic_age: Optional[int] = None
    protein: Optional[float] = None
    skeletal_muscle: Optional[float] = None


class MacroGoal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    start_date: date
    calories_target: int
    protein_target: int
    carbs_target: int
    fat_target: int



class MacroGoalCreate(BaseModel):
    start_date: date
    calories_target: int
    protein_target: int
    carbs_target: int
    fat_target: int




class WorkoutEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    exercise: str
    sets: int
    reps: int
    weight: float


class Goal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    goal_type: str
    target_weight: float
    target_body_fat: float
    timeframe_weeks: int
