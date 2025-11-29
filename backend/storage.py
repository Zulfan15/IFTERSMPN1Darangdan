# Storage service untuk menyimpan dan membaca JSON files

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import config

class StorageService:
    """Handle JSON file storage for exams and results"""
    
    def __init__(self):
        self.exams_dir = config.EXAMS_DIR
        self.results_dir = config.RESULTS_DIR
    
    # ============ EXAM OPERATIONS ============
    
    def save_exam(self, exam_data: Dict) -> str:
        """Save exam configuration to JSON"""
        exam_id = f"exam_{uuid.uuid4().hex[:8]}"
        exam_data['exam_id'] = exam_id
        exam_data['created_at'] = datetime.now().isoformat()
        
        file_path = self.exams_dir / f"{exam_id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(exam_data, f, indent=2, ensure_ascii=False)
        
        return exam_id
    
    def load_exam(self, exam_id: str) -> Optional[Dict]:
        """Load exam configuration"""
        file_path = self.exams_dir / f"{exam_id}.json"
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def list_exams(self) -> List[Dict]:
        """List all exams"""
        exams = []
        for file_path in self.exams_dir.glob("exam_*.json"):
            with open(file_path, 'r', encoding='utf-8') as f:
                exams.append(json.load(f))
        
        # Sort by created_at descending
        exams.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        return exams
    
    def delete_exam(self, exam_id: str) -> bool:
        """Delete exam and all associated results"""
        file_path = self.exams_dir / f"{exam_id}.json"
        if file_path.exists():
            file_path.unlink()
            
            # Delete associated results
            for result_file in self.results_dir.glob(f"{exam_id}_*.json"):
                result_file.unlink()
            
            return True
        return False
    
    def update_exam(self, exam_id: str, exam_data: Dict) -> bool:
        """Update exam configuration"""
        file_path = self.exams_dir / f"{exam_id}.json"
        if not file_path.exists():
            return False
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(exam_data, f, indent=2, ensure_ascii=False)
        
        return True
    
    # ============ RESULT OPERATIONS ============
    
    def save_result(self, result_data: Dict) -> str:
        """Save processing result to JSON"""
        exam_id = result_data['exam_id']
        result_id = f"{exam_id}_{uuid.uuid4().hex[:8]}"
        result_data['result_id'] = result_id
        result_data['processed_at'] = datetime.now().isoformat()
        
        file_path = self.results_dir / f"{result_id}.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, indent=2, ensure_ascii=False)
        
        return result_id
    
    def load_result(self, result_id: str) -> Optional[Dict]:
        """Load result by ID"""
        file_path = self.results_dir / f"{result_id}.json"
        if not file_path.exists():
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def list_results_by_exam(self, exam_id: str) -> List[Dict]:
        """List all results for an exam"""
        results = []
        for file_path in self.results_dir.glob(f"{exam_id}_*.json"):
            with open(file_path, 'r', encoding='utf-8') as f:
                results.append(json.load(f))
        
        # Sort by processed_at descending
        results.sort(key=lambda x: x.get('processed_at', ''), reverse=True)
        return results
    
    def delete_result(self, result_id: str) -> bool:
        """Delete a result"""
        file_path = self.results_dir / f"{result_id}.json"
        if file_path.exists():
            file_path.unlink()
            return True
        return False
    
    # ============ STATISTICS ============
    
    def get_exam_statistics(self, exam_id: str) -> Dict:
        """Calculate statistics for an exam"""
        results = self.list_results_by_exam(exam_id)
        
        if not results:
            return {
                'total_students': 0,
                'average_score': 0,
                'highest_score': 0,
                'lowest_score': 0,
                'pass_rate': 0
            }
        
        scores = [r['score']['percentage'] for r in results]
        passing_threshold = 75.0
        passed = sum(1 for s in scores if s >= passing_threshold)
        
        return {
            'total_students': len(results),
            'average_score': sum(scores) / len(scores),
            'highest_score': max(scores),
            'lowest_score': min(scores),
            'pass_rate': (passed / len(results)) * 100 if results else 0
        }
