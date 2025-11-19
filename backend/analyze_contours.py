"""
Script untuk analyze ukuran contour di ROI
"""
import json
import cv2
import numpy as np
import os
import imutils

def analyze_contours():
    """Analyze all contours in ROI to determine bubble size"""
    
    # Load ROI config
    with open("data/images/templates/roi_config.json", 'r') as f:
        roi = json.load(f)
    
    # Load image
    image = cv2.imread("data/images/templates/ljk_template.jpg")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Crop to ROI
    x1, y1, x2, y2 = roi['x1'], roi['y1'], roi['x2'], roi['y2']
    answer_region = gray[y1:y2, x1:x2]
    
    # Apply preprocessing
    blurred = cv2.GaussianBlur(answer_region, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blurred, 255,
                                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    cv2.THRESH_BINARY_INV, 11, 2)
    
    # Find all contours
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    
    print("="*70)
    print("📊 CONTOUR ANALYSIS")
    print("="*70)
    print(f"Total contours found: {len(cnts)}")
    print()
    
    # Analyze all contours
    sizes = []
    aspect_ratios = []
    areas = []
    
    for c in cnts:
        (x, y, w, h) = cv2.boundingRect(c)
        ar = w / float(h) if h > 0 else 0
        area = cv2.contourArea(c)
        
        sizes.append((w, h))
        aspect_ratios.append(ar)
        areas.append(area)
    
    if sizes:
        widths = [s[0] for s in sizes]
        heights = [s[1] for s in sizes]
        
        print("📏 Size Statistics:")
        print(f"   Width:  min={min(widths)}, max={max(widths)}, avg={np.mean(widths):.1f}")
        print(f"   Height: min={min(heights)}, max={max(heights)}, avg={np.mean(heights):.1f}")
        print()
        print(f"📐 Aspect Ratio Statistics:")
        print(f"   min={min(aspect_ratios):.2f}, max={max(aspect_ratios):.2f}, avg={np.mean(aspect_ratios):.2f}")
        print()
        print(f"📦 Area Statistics:")
        print(f"   min={min(areas):.0f}, max={max(areas):.0f}, avg={np.mean(areas):.0f}")
        print()
        
        # Find potential bubbles (circular shapes)
        print("🎯 Potential Bubble Candidates:")
        print("   (Looking for circular contours with aspect ratio ~1.0)")
        print()
        
        candidates = []
        for c in cnts:
            (x, y, w, h) = cv2.boundingRect(c)
            ar = w / float(h) if h > 0 else 0
            area = cv2.contourArea(c)
            
            # More relaxed filters
            if 0.7 <= ar <= 1.3 and area >= 100:
                candidates.append({
                    'x': x, 'y': y, 'w': w, 'h': h,
                    'ar': ar, 'area': area
                })
        
        print(f"   Found {len(candidates)} circular contours")
        
        if candidates:
            # Group by size
            size_groups = {}
            for c in candidates:
                size_key = (c['w'] // 5) * 5  # Group by 5 pixel buckets
                if size_key not in size_groups:
                    size_groups[size_key] = []
                size_groups[size_key].append(c)
            
            print(f"\n   Size Distribution:")
            for size, group in sorted(size_groups.items()):
                print(f"      {size}-{size+4}px: {len(group)} contours")
            
            # Find most common size (likely to be bubbles)
            most_common_size = max(size_groups.items(), key=lambda x: len(x[1]))
            print(f"\n   🔍 Most common size: {most_common_size[0]}-{most_common_size[0]+4}px ({len(most_common_size[1])} contours)")
            
            sample = most_common_size[1][0]
            print(f"      Sample: width={sample['w']}, height={sample['h']}, area={sample['area']:.0f}")
            
            print(f"\n💡 Recommended filter settings:")
            print(f"   width: {most_common_size[0]-5} to {most_common_size[0]+10}")
            print(f"   height: {most_common_size[0]-5} to {most_common_size[0]+10}")
            print(f"   area: >= {sample['area'] * 0.8:.0f}")
            
        # Draw candidates on debug image
        debug = answer_region.copy()
        debug = cv2.cvtColor(debug, cv2.COLOR_GRAY2BGR)
        
        for c in candidates:
            cv2.rectangle(debug, (c['x'], c['y']), 
                         (c['x']+c['w'], c['y']+c['h']), (0, 255, 0), 1)
        
        os.makedirs("debug_output", exist_ok=True)
        cv2.imwrite("debug_output/7_contour_analysis.jpg", debug)
        print(f"\n📁 Visualization saved: debug_output/7_contour_analysis.jpg")
    
    print("\n" + "="*70)


if __name__ == "__main__":
    analyze_contours()
