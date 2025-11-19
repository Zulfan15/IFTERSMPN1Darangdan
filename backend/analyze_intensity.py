"""
Analyze bubble intensity to find optimal FILLED_THRESHOLD
"""
import cv2
import numpy as np
from core.ljk_manual_roi import load_roi_config, find_answer_bubbles_manual_roi, organize_bubbles_into_columns

TEST_IMAGE = r"temp_test_pdf\ljk_smp1darangdan_page_1.jpg"
ROI_CONFIG = r"data/images/templates/roi_config.json"

def analyze_bubble_intensities():
    """Analyze intensity of filled vs empty bubbles"""
    print("="*70)
    print("🔬 BUBBLE INTENSITY ANALYSIS")
    print("="*70)
    
    # Load ROI and detect bubbles
    roi = load_roi_config(ROI_CONFIG)
    result = find_answer_bubbles_manual_roi(TEST_IMAGE, roi)
    
    if result is None:
        print("ERROR: Failed to detect bubbles")
        return
    
    bubbles, image, thresh, roi_used = result
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Organize bubbles
    column_rows = organize_bubbles_into_columns(bubbles)
    
    # Sample bubble intensities
    filled_intensities = []
    empty_intensities = []
    
    print(f"\nAnalyzing {len(bubbles)} bubbles...")
    print("\nSample intensities (first 5 rows):")
    print("-"*70)
    print("Row | Bubble A | Bubble B | Bubble C | Bubble D | Bubble E | Filled?")
    print("-"*70)
    
    row_count = 0
    for col_idx, rows in enumerate(column_rows):
        for row_idx, row in enumerate(rows):
            if row_count >= 5:  # Only analyze first 5 rows for display
                break
            
            if len(row) < 5:
                continue
            
            intensities = []
            for bubble in row:
                x, y, w, h = bubble['x'], bubble['y'], bubble['w'], bubble['h']
                roi_bubble = gray[y:y+h, x:x+w]
                intensity = np.mean(roi_bubble)
                intensities.append(intensity)
                
                # Classify based on visual inspection from image
                # We need to manually check which are filled
                # For now, collect all intensities
            
            # Find min intensity (darkest = likely filled)
            min_intensity = min(intensities)
            min_idx = intensities.index(min_intensity)
            
            # Print row analysis
            row_num = col_idx * 20 + row_idx + 1
            intensity_str = " | ".join([f"{int(i):3d}" for i in intensities])
            filled_bubble = chr(65 + min_idx)  # A-E
            print(f" {row_num:2d}  | {intensity_str} | {filled_bubble} ({int(min_intensity)})")
            
            # Collect intensities
            for i, intensity in enumerate(intensities):
                if i == min_idx:
                    filled_intensities.append(intensity)
                else:
                    empty_intensities.append(intensity)
            
            row_count += 1
    
    print("-"*70)
    
    # Statistical analysis
    if filled_intensities:
        print(f"\n📊 FILLED BUBBLES (darkest in each row):")
        print(f"   Count: {len(filled_intensities)}")
        print(f"   Min: {min(filled_intensities):.1f}")
        print(f"   Max: {max(filled_intensities):.1f}")
        print(f"   Mean: {np.mean(filled_intensities):.1f}")
        print(f"   Median: {np.median(filled_intensities):.1f}")
        print(f"   Std Dev: {np.std(filled_intensities):.1f}")
    
    if empty_intensities:
        print(f"\n📊 EMPTY BUBBLES:")
        print(f"   Count: {len(empty_intensities)}")
        print(f"   Min: {min(empty_intensities):.1f}")
        print(f"   Max: {max(empty_intensities):.1f}")
        print(f"   Mean: {np.mean(empty_intensities):.1f}")
        print(f"   Median: {np.median(empty_intensities):.1f}")
        print(f"   Std Dev: {np.std(empty_intensities):.1f}")
    
    # Recommend threshold
    if filled_intensities and empty_intensities:
        # Threshold should be between max(filled) and min(empty)
        max_filled = max(filled_intensities)
        min_empty = min(empty_intensities)
        recommended_threshold = (max_filled + min_empty) / 2
        
        print(f"\n🎯 RECOMMENDED THRESHOLD:")
        print(f"   Max filled intensity: {max_filled:.1f}")
        print(f"   Min empty intensity: {min_empty:.1f}")
        print(f"   Suggested threshold: {recommended_threshold:.1f}")
        print(f"   (Bubbles with intensity < {recommended_threshold:.0f} = FILLED)")
        print(f"\n   Current threshold in config: 220")
        
        if recommended_threshold < 220:
            print(f"   ⚠️  Threshold too high! Lower to {recommended_threshold:.0f}")
        elif recommended_threshold > 220:
            print(f"   ⚠️  Threshold too low! Raise to {recommended_threshold:.0f}")
        else:
            print(f"   ✅ Threshold is optimal!")
    
    print("\n" + "="*70)

if __name__ == "__main__":
    analyze_bubble_intensities()
