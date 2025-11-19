"""
Script untuk melihat visualisasi ROI yang sudah dipilih
"""
import json
import cv2
import os

def visualize_roi(image_path, roi_config_path):
    """Show ROI on image"""
    
    # Load ROI config
    if not os.path.exists(roi_config_path):
        print(f"❌ ROI config not found: {roi_config_path}")
        return
    
    with open(roi_config_path, 'r') as f:
        roi = json.load(f)
    
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Cannot read image: {image_path}")
        return
    
    height, width = image.shape[:2]
    print("="*70)
    print("📊 ROI CONFIGURATION CHECK")
    print("="*70)
    print(f"\n📄 Image: {image_path}")
    print(f"   Size: {width} x {height} pixels")
    print(f"\n🎯 ROI Selected:")
    print(f"   Top-Left (x1, y1): ({roi['x1']}, {roi['y1']})")
    print(f"   Bottom-Right (x2, y2): ({roi['x2']}, {roi['y2']})")
    print(f"   Area Size: {roi['width']} x {roi['height']} pixels")
    print(f"   Config File: {roi_config_path}")
    
    # Draw ROI rectangle
    output = image.copy()
    cv2.rectangle(output, 
                  (roi['x1'], roi['y1']), 
                  (roi['x2'], roi['y2']), 
                  (0, 255, 0), 3)
    
    # Add labels
    cv2.putText(output, "ROI - AREA JAWABAN", 
                (roi['x1'], roi['y1']-10),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
    
    cv2.putText(output, f"Pojok Kiri Atas ({roi['x1']}, {roi['y1']})", 
                (roi['x1'], roi['y1']+30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    
    cv2.putText(output, f"Pojok Kanan Bawah ({roi['x2']}, {roi['y2']})", 
                (roi['x2']-400, roi['y2']-10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    
    # Draw corner markers
    marker_size = 30
    # Top-left corner
    cv2.line(output, (roi['x1'], roi['y1']), (roi['x1']+marker_size, roi['y1']), (0, 0, 255), 3)
    cv2.line(output, (roi['x1'], roi['y1']), (roi['x1'], roi['y1']+marker_size), (0, 0, 255), 3)
    
    # Bottom-right corner
    cv2.line(output, (roi['x2'], roi['y2']), (roi['x2']-marker_size, roi['y2']), (0, 0, 255), 3)
    cv2.line(output, (roi['x2'], roi['y2']), (roi['x2'], roi['y2']-marker_size), (0, 0, 255), 3)
    
    # Save output
    output_path = "data/images/templates/roi_visualization.jpg"
    cv2.imwrite(output_path, output)
    print(f"\n💾 Visualization saved: {output_path}")
    
    # Crop ROI area
    roi_cropped = image[roi['y1']:roi['y2'], roi['x1']:roi['x2']]
    crop_path = "data/images/templates/roi_cropped.jpg"
    cv2.imwrite(crop_path, roi_cropped)
    print(f"💾 Cropped ROI area saved: {crop_path}")
    
    # Display image
    print(f"\n🖼️  Opening visualization window...")
    print(f"   - GREEN RECTANGLE = Selected ROI area")
    print(f"   - RED MARKERS = Corner points")
    print(f"\n⌨️  Press any key to close the window")
    
    # Resize for display if too large
    max_height = 900
    if output.shape[0] > max_height:
        scale = max_height / output.shape[0]
        new_width = int(output.shape[1] * scale)
        output_display = cv2.resize(output, (new_width, max_height))
    else:
        output_display = output
    
    cv2.imshow("ROI Visualization - Press any key to close", output_display)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
    
    print("\n" + "="*70)
    print("✅ ROI CHECK COMPLETE")
    print("="*70)
    print("\n📝 Apakah ROI sudah tepat?")
    print("   - Jika SUDAH TEPAT: ROI siap digunakan untuk upload LJK")
    print("   - Jika BELUM TEPAT: Jalankan setup_roi.py lagi untuk pilih ulang")
    print()


if __name__ == "__main__":
    image_path = "data/images/templates/ljk_template.jpg"
    roi_config_path = "data/images/templates/roi_config.json"
    
    visualize_roi(image_path, roi_config_path)
