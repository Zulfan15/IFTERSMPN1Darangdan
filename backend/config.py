# Backend Configuration
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
DATA_DIR = ROOT_DIR / "data"

# Data directories
EXAMS_DIR = DATA_DIR / "exams"
RESULTS_DIR = DATA_DIR / "results"
IMAGES_DIR = DATA_DIR / "images"
TEMPLATES_DIR = IMAGES_DIR / "templates"
UPLOADS_DIR = IMAGES_DIR / "uploads"
PROCESSED_DIR = IMAGES_DIR / "processed"
EXPORTS_DIR = DATA_DIR / "exports"

# Ensure directories exist
for directory in [EXAMS_DIR, RESULTS_DIR, TEMPLATES_DIR, UPLOADS_DIR, PROCESSED_DIR, EXPORTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# LJK Settings
MAX_QUESTIONS = 180
FILLED_THRESHOLD = 205  # Bubble intensity threshold (lower = darker = filled)

# API Settings
API_PREFIX = "/api"
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Upload limits
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
