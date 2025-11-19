"""
Script untuk test ROI dan menghasilkan debug output lengkap
"""
import json
import cv2
import numpy as np
import os
import sys
from core.ljk_manual_roi import find_answer_bubbles_manual_roi, organize_bubbles_into_columns

def test_roi_with_debug():
    """Test ROI configuration dan generate debug output"""
    
    print("="*70)
    print("🔍 ROI DEBUG TEST")
    print("="*70)
    print()
    
    # Paths
    image_path = "data/images/templates/ljk_template.jpg"
    roi_config_path = "data/images/templates/roi_config.json"
    
    # Check files exist
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
    
    if not os.path.exists(roi_config_path):
        print(f"❌ ROI config not found: {roi_config_path}")
        print("   Run setup_roi.py first to select ROI")
        return
    
    # Load ROI config
    with open(roi_config_path, 'r') as f:
        roi = json.load(f)
    
    print(f"📄 Image: {image_path}")
    print(f"🎯 ROI Config: {roi_config_path}")
    print(f"   Area: ({roi['x1']}, {roi['y1']}) → ({roi['x2']}, {roi['y2']})")
    print(f"   Size: {roi['width']} x {roi['height']} pixels")
    print()
    
    # Process with debug output
    print("🔬 Running bubble detection...")
    print("   This will generate debug images in: debug_output/")
    print()
    
    result = find_answer_bubbles_manual_roi(image_path, roi)
    
    if result is None:
        print("❌ Failed to detect bubbles")
        return
    
    bubbles, image, thresh, roi_info = result
    
    print(f"✅ Bubble detection complete!")
    print(f"   Total bubbles detected: {len(bubbles)}")
    print()
    
    # Organize bubbles
    print("📊 Organizing bubbles into columns...")
    column_rows = organize_bubbles_into_columns(bubbles)
    
    total_questions = sum(len(rows) for rows in column_rows)
    print(f"   Total columns: {len(column_rows)}")
    print(f"   Total questions detected: {total_questions}")
    print()
    
    # Print per-column summary
    for col_idx, rows in enumerate(column_rows):
        if rows:
            bubble_counts = [len(r) for r in rows]
            avg_bubbles = sum(bubble_counts) / len(bubble_counts) if bubble_counts else 0
            print(f"   Kolom {col_idx+1}: {len(rows)} soal, avg {avg_bubbles:.1f} bubble/soal")
    print()
    
    # Create detailed visualization
    output_dir = "debug_output"
    print("🎨 Creating additional visualizations...")
    
    # 5. Column visualization
    debug_columns = image.copy()
    colors = [
        (255, 0, 0),    # Blue
        (0, 255, 0),    # Green
        (0, 0, 255),    # Red
        (255, 255, 0),  # Cyan
        (255, 0, 255),  # Magenta
        (0, 255, 255),  # Yellow
    ]
    
    for col_idx, rows in enumerate(column_rows):
        color = colors[col_idx % len(colors)]
        for row in rows:
            for bubble in row:
                cv2.rectangle(debug_columns,
                            (bubble['x'], bubble['y']),
                            (bubble['x']+bubble['w'], bubble['y']+bubble['h']),
                            color, 2)
    
    cv2.imwrite(os.path.join(output_dir, "5_columns_organized.jpg"), debug_columns)
    
    # 6. Grid layout visualization
    debug_grid = image.copy()
    question_num = 0
    
    for col_idx, rows in enumerate(column_rows):
        for row_idx, row in enumerate(rows):
            if len(row) >= 3:
                # Draw bounding box for question
                x_min = min(b['x'] for b in row)
                y_min = min(b['y'] for b in row)
                x_max = max(b['x']+b['w'] for b in row)
                y_max = max(b['y']+b['h'] for b in row)
                
                cv2.rectangle(debug_grid, (x_min-5, y_min-5), (x_max+5, y_max+5), (0, 255, 0), 1)
                
                # Add question number
                cv2.putText(debug_grid, str(question_num+1),
                           (x_min-20, y_min+10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 0, 0), 1)
                
                question_num += 1
    
    cv2.imwrite(os.path.join(output_dir, "6_grid_with_numbers.jpg"), debug_grid)
    
    print(f"✅ Debug output created in: {output_dir}/")
    print()
    
    # List all debug files
    print("📁 Debug files created:")
    debug_files = sorted([f for f in os.listdir(output_dir) if f.endswith('.jpg')])
    for file in debug_files:
        file_path = os.path.join(output_dir, file)
        size = os.path.getsize(file_path) / 1024  # KB
        print(f"   - {file} ({size:.1f} KB)")
    print()
    
    print("="*70)
    print("✅ DEBUG TEST COMPLETE")
    print("="*70)
    print()
    print("📋 Debug file descriptions:")
    print("   1_roi_selected.jpg      - ROI area marked on original image")
    print("   2_answer_region.jpg     - Cropped ROI area (grayscale)")
    print("   3_threshold.jpg         - Binary threshold (black bubbles)")
    print("   4_bubbles_detected.jpg  - All detected bubbles (green boxes)")
    print("   5_columns_organized.jpg - Bubbles grouped by columns (colored)")
    print("   6_grid_with_numbers.jpg - Questions numbered 1-180")
    print()
    print("💡 Tips:")
    print("   - Check if all bubbles are detected (file 4)")
    print("   - Check if columns are correctly organized (file 5)")
    print("   - Check if question numbers are correct (file 6)")
    print()
    print("🔄 If detection is not good:")
    print("   1. Run setup_roi.py to adjust ROI")
    print("   2. Ensure LJK scan is clear and high resolution")
    print("   3. Check bubble size is 15-40 pixels")
    print()


if __name__ == "__main__":
    test_roi_with_debug()
