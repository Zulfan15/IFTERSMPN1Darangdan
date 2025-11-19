"""
Script untuk convert PDF LJK ke gambar dan setup ROI (Region of Interest)
"""
import os
import sys
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
from core.ljk_manual_roi import ROISelector
import cv2

def convert_pdf_to_image(pdf_path, output_dir="data/images/templates"):
    """Convert PDF to JPG image using PyMuPDF"""
    print(f"📄 Converting PDF to image...")
    print(f"   PDF: {pdf_path}")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Open PDF
    doc = fitz.open(pdf_path)
    
    if len(doc) == 0:
        print("❌ Failed to convert PDF - no pages found")
        return None
    
    page_count = len(doc)
    
    # Get first page
    page = doc[0]
    
    # Render page to image (zoom=3 for high quality, ~300 DPI)
    mat = fitz.Matrix(3, 3)
    pix = page.get_pixmap(matrix=mat)
    
    # Save as JPG
    output_path = os.path.join(output_dir, "ljk_template.jpg")
    pix.save(output_path)
    
    doc.close()
    
    print(f"✅ Image saved: {output_path}")
    print(f"   Total pages: {page_count} (using page 1)")
    print(f"   Size: {pix.width} x {pix.height} pixels")
    
    return output_path


def setup_roi(image_path):
    """Setup ROI using interactive selector"""
    print(f"\n🎯 Starting ROI Selection Tool...")
    print(f"   Image: {image_path}")
    
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Cannot read image: {image_path}")
        return None
    
    height, width = image.shape[:2]
    print(f"   Size: {width} x {height} pixels")
    
    # Create ROI selector
    selector = ROISelector(image)
    
    print("\n" + "="*70)
    print("📋 INSTRUKSI PEMILIHAN ROI:")
    print("="*70)
    print("1. Klik pada POJOK KIRI ATAS area jawaban (bubble A kolom 1 soal 1)")
    print("2. Klik pada POJOK KANAN BAWAH area jawaban (bubble E kolom 6 soal 180)")
    print("3. Tekan ENTER untuk konfirmasi")
    print("4. Tekan R untuk reset (pilih ulang)")
    print("5. Tekan ESC untuk keluar")
    print("="*70)
    print()
    
    # Select ROI interactively
    roi = selector.select_roi()
    
    if roi:
        print(f"\n✅ ROI Selected:")
        print(f"   Top-Left: ({roi['x1']}, {roi['y1']})")
        print(f"   Bottom-Right: ({roi['x2']}, {roi['y2']})")
        print(f"   Size: {roi['width']} x {roi['height']} pixels")
        
        # Save ROI config
        config_path = "data/images/templates/roi_config.json"
        from core.ljk_manual_roi import save_roi_config
        save_roi_config(roi, config_path)
        
        print(f"\n💾 ROI configuration saved to: {config_path}")
        print(f"\n✅ Setup complete! You can now upload LJK images.")
        
        return roi
    else:
        print("\n⚠️  No ROI selected")
        return None


def main():
    print("="*70)
    print("🔧 LJK ROI SETUP TOOL")
    print("="*70)
    print()
    
    # Check if image exists - use test image
    image_path = r"temp_test_pdf\ljk_smp1darangdan_page_1.jpg"
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return
    
    print(f"📄 Using image: {image_path}")
    print()
    
    # Setup ROI directly
    roi = setup_roi(image_path)
    
    if roi:
        print("\n" + "="*70)
        print("🎉 SUCCESS!")
        print("="*70)
        print("\n📝 Next steps:")
        print("   1. Go to the web application")
        print("   2. Create a new exam")
        print("   3. Upload LJK images")
        print("   4. The system will use this ROI configuration automatically")
        print()


if __name__ == "__main__":
    main()
