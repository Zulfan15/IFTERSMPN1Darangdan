import cv2
import json

# Load converted PDF image
img_path = 'temp_test_pdf/ljk_smp1darangdan_page_1.jpg'
img = cv2.imread(img_path)

if img is not None:
    h, w = img.shape[:2]
    print(f'Image size: {w} x {h}')
    
    # Estimate ROI for 60-question LJK
    roi_x1 = int(w * 0.1)
    roi_y1 = int(h * 0.25)
    roi_x2 = int(w * 0.65)
    roi_y2 = int(h * 0.90)
    
    roi = {
        'x1': roi_x1,
        'y1': roi_y1,
        'x2': roi_x2,
        'y2': roi_y2,
        'width': roi_x2 - roi_x1,
        'height': roi_y2 - roi_y1
    }
    
    print(f'Estimated ROI: ({roi_x1}, {roi_y1}) - ({roi_x2}, {roi_y2})')
    print(f'ROI size: {roi["width"]} x {roi["height"]}')
    
    # Draw ROI
    img_copy = img.copy()
    cv2.rectangle(img_copy, (roi_x1, roi_y1), (roi_x2, roi_y2), (0, 255, 0), 3)
    cv2.putText(img_copy, 'ROI - Answer Area', (roi_x1, roi_y1-10),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    cv2.imwrite('temp_test_pdf/roi_visualization.jpg', img_copy)
    print('Saved: temp_test_pdf/roi_visualization.jpg')
    
    with open('roi_config_60_estimated.json', 'w') as f:
        json.dump(roi, f, indent=4)
    print('Saved: roi_config_60_estimated.json')
