# Pydantic models for API

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class ExamCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    date: str
    subject: str
    class_name: str = Field(..., alias="class")
    total_questions: int = Field(default=180, ge=1, le=180)
    active_questions: int = Field(..., ge=1, le=180)
    scoring: Dict[str, float] = Field(default={
        "correct": 1.0,
        "wrong": 0.0,
        "unanswered": 0.0
    })
    answer_key: Dict[int, int]  # {question_num: answer_index (0-4 for A-E)}

class ExamResponse(ExamCreate):
    exam_id: str
    created_at: datetime
    
    # Pydantic v2 configuration
    model_config = {
        "populate_by_name": True
    }

class ProcessLJKRequest(BaseModel):
    exam_id: str
    student_name: Optional[str] = None
    student_number: Optional[str] = None

class AnswerDetail(BaseModel):
    question_num: int
    answer_key: str
    student_answer: str
    is_correct: bool
    points: float

class ResultResponse(BaseModel):
    result_id: str
    exam_id: str
    student_name: Optional[str] = None
    student_number: Optional[str] = None
    answers: Dict[int, int]
    unanswered: List[int]
    score: Dict[str, Any]
    details: List[AnswerDetail]
    image_path: str
    processed_image_path: str
    processed_at: datetime
