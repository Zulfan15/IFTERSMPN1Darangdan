# LJK Processor Service - Wrapper for ljk_manual_roi.py

import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import sys
import json
import os

# Add core directory to path
sys.path.insert(0, str(Path(__file__).parent / "core"))

# Import from core
from core.ljk_manual_roi import (
    find_answer_bubbles_manual_roi,
    organize_bubbles_into_columns,
    load_roi_config
)
import config
from pdf_utils import pdf_to_images, is_pdf_file, get_pdf_page_count

class LJKProcessor:
    """Process LJK images using ljk_manual_roi.py core"""
    
    def __init__(self):
        # Load ROI configuration
        roi_path = config.TEMPLATES_DIR / "roi_config.json"
        print(f"🔍 Loading ROI from: {roi_path}")
        print(f"🔍 ROI path exists: {roi_path.exists()}")
        self.roi_config = self.load_roi_config(roi_path)
        
        if self.roi_config:
            print(f"✓ ROI loaded: x1={self.roi_config['x1']}, y1={self.roi_config['y1']}, x2={self.roi_config['x2']}, y2={self.roi_config['y2']}")
            print(f"✓ ROI size: {self.roi_config.get('width', 0)}x{self.roi_config.get('height', 0)}")
        else:
            print("⚠️  Warning: ROI config not found. Please setup template first.")
    
    def load_roi_config(self, config_path: Path) -> Optional[Dict]:
        """Load ROI configuration from JSON"""
        if not config_path.exists():
            return None
        
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading ROI config: {e}")
            return None
    
    def process_ljk(
        self, 
        image_path: str, 
        answer_key: Dict[int, int], 
        active_questions: int
    ) -> Dict:
        """
        Process single LJK image or PDF
        
        Args:
            image_path: Path to LJK image or PDF file
            answer_key: Dict of {question_num: answer_index (0-4)}
            active_questions: Number of questions to grade
        
        Returns:
            Dict with answers, score, and marked image
        """
        if not self.roi_config:
            raise Exception("ROI configuration not found")
        
        # Convert answer_key keys to integers (JSON loads them as strings)
        answer_key = {int(k): v for k, v in answer_key.items()}
        
        # Check if PDF - convert to images
        if is_pdf_file(image_path):
            print(f"📄 PDF detected: {image_path}")
            page_count = get_pdf_page_count(image_path)
            print(f"   Pages: {page_count}")
            
            # Convert PDF to images
            temp_dir = Path(image_path).parent / "temp_pdf_pages"
            image_paths = pdf_to_images(image_path, output_dir=str(temp_dir))
            
            print(f"✓ Extracted {len(image_paths)} pages from PDF")
            
            # Process first page (or you can process all pages and combine)
            # For now, we'll process the first page only
            if image_paths:
                image_path = image_paths[0]
                print(f"   Processing first page: {image_path}")
            else:
                raise Exception("Failed to extract images from PDF")
        
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise Exception(f"Cannot read image: {image_path}")
        
        # Detect bubbles in ROI
        result = find_answer_bubbles_manual_roi(image_path, self.roi_config)
        if result is None:
            raise Exception("Failed to detect bubbles")
        
        bubbles, img, thresh, roi_info = result
        
        if len(bubbles) == 0:
            raise Exception("No bubbles detected")
        
        # Organize into columns
        column_rows = organize_bubbles_into_columns(bubbles)
        
        # Log detection summary
        print(f"✓ Bubble detected: {len(bubbles)} total")
        print(f"✓ Organized into {len(column_rows)} columns")
        print(f"✓ Using FILLED_THRESHOLD: {config.FILLED_THRESHOLD}")
        for col_idx, rows in enumerate(column_rows):
            rows_with_5 = sum(1 for row in rows if len(row) == 5)
            rows_with_4 = sum(1 for row in rows if len(row) == 4)
            rows_with_less = sum(1 for row in rows if len(row) < 4)
            print(f"  Kolom {col_idx+1}: {len(rows)} rows total (5-bubble: {rows_with_5}, 4-bubble: {rows_with_4}, <4: {rows_with_less})")
        
        # Extract answers
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        student_answers = {}
        unanswered = []
        
        question_num = 0
        for col_idx, rows in enumerate(column_rows):
            for row_idx, row in enumerate(rows):
                if question_num >= active_questions:
                    break
                
                # Skip rows with less than 4 bubbles (likely detection error)
                if len(row) < 4:
                    continue
                
                # Pad row to 5 bubbles if needed (add dummy bubbles for missing ones)
                while len(row) < 5:
                    row.append({'x': 0, 'y': 0, 'w': 0, 'h': 0})  # Dummy bubble
                
                # Find filled bubble (lowest intensity = darkest)
                min_intensity = 255
                max_intensity = 0
                bubbled_idx = 0
                intensities = []
                
                for j, bubble in enumerate(row):
                    x, y, w, h = bubble['x'], bubble['y'], bubble['w'], bubble['h']
                    roi_bubble = gray[y:y+h, x:x+w]
                    
                    if roi_bubble.size == 0:
                        continue
                    
                    intensity = np.mean(roi_bubble)
                    intensities.append(intensity)
                    
                    if intensity < min_intensity:
                        min_intensity = intensity
                        bubbled_idx = j
                    
                    if intensity > max_intensity:
                        max_intensity = intensity
                
                # Check if actually filled
                # Bubble yang benar-benar diisi pensil punya intensity < 150
                # Bubble kosong (tidak diisi) punya intensity 203-208
                # Jadi cek: min_intensity < 150 untuk memastikan benar-benar diisi
                intensity_diff = max_intensity - min_intensity
                
                if min_intensity < 150:  # Benar-benar diisi pensil
                    student_answers[question_num] = bubbled_idx
                    # Debug logging
                    if question_num < 5 or question_num >= 50:
                        print(f"  Q{question_num+1}: FILLED (min={min_intensity:.1f}, max={max_intensity:.1f}, diff={intensity_diff:.1f}, answer={chr(65+bubbled_idx)})")
                else:  # Tidak diisi (intensity terlalu tinggi)
                    unanswered.append(question_num)
                    # Debug logging
                    if question_num < 5 or question_num >= 50:
                        print(f"  Q{question_num+1}: UNANSWERED (min={min_intensity:.1f}, max={max_intensity:.1f}, diff={intensity_diff:.1f})")
                
                question_num += 1
        
        # Calculate score
        correct = 0
        wrong = 0
        details = []
        
        for q_num in range(active_questions):
            key = answer_key.get(q_num, -1)
            student_ans = student_answers.get(q_num, -1)
            
            is_correct = (student_ans == key and student_ans != -1)
            
            if is_correct:
                correct += 1
            elif student_ans != -1:
                wrong += 1
            
            details.append({
                'question_num': q_num + 1,
                'answer_key': chr(65 + key) if key >= 0 else '?',
                'student_answer': chr(65 + student_ans) if student_ans >= 0 else '-',
                'is_correct': is_correct,
                'points': 1.0 if is_correct else 0.0
            })
        
        # Mark image
        output_image = self.mark_image(
            img, 
            column_rows, 
            student_answers, 
            unanswered, 
            answer_key, 
            active_questions,
            gray
        )
        
        return {
            'answers': student_answers,
            'unanswered': unanswered,
            'score': {
                'correct': correct,
                'wrong': wrong,
                'unanswered': len(unanswered),
                'total': active_questions,
                'percentage': (correct / active_questions * 100) if active_questions > 0 else 0
            },
            'details': details,
            'marked_image': output_image
        }
    
    def mark_image(
        self,
        image: np.ndarray,
        column_rows: List,
        student_answers: Dict,
        unanswered: List,
        answer_key: Dict,
        active_questions: int,
        gray: np.ndarray
    ) -> np.ndarray:
        """Mark image with colored rectangles"""
        output = image.copy()
        question_num = 0
        
        for col_idx, rows in enumerate(column_rows):
            for row_idx, row in enumerate(rows):
                if question_num >= active_questions:
                    break
                
                if len(row) < 5:
                    continue
                
                if question_num in unanswered:
                    # Mark as unanswered (orange)
                    color = (0, 165, 255)
                    first_bubble = row[0]
                    cv2.putText(
                        output,
                        f"{question_num+1}:?",
                        (first_bubble['x']-25, first_bubble['y']+first_bubble['h']//2),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.4,
                        color,
                        2
                    )
                else:
                    # Mark answered bubble
                    ans_idx = student_answers[question_num]
                    key = answer_key.get(question_num, -1)
                    is_correct = (ans_idx == key)
                    
                    color = (0, 255, 0) if is_correct else (0, 0, 255)
                    bubble = row[ans_idx]
                    
                    cv2.rectangle(
                        output,
                        (bubble['x']-2, bubble['y']-2),
                        (bubble['x']+bubble['w']+2, bubble['y']+bubble['h']+2),
                        color,
                        2
                    )
                    
                    cv2.putText(
                        output,
                        str(question_num+1),
                        (bubble['x']-20, bubble['y']+bubble['h']//2),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.4,
                        color,
                        1
                    )
                
                question_num += 1
        
        return output
