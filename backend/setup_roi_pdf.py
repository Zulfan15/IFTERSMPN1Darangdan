# ROI Selector for PDF LJK - 60 Questions
# Support untuk file PDF hasil scan dengan 60 soal pilihan ganda A-E

import cv2
import numpy as np
import json
import sys
from pathlib import Path

# Import ROI selector dari ljk_manual_roi
sys.path.insert(0, str(Path(__file__).parent))
from core.ljk_manual_roi import ROISelector
from pdf_utils import pdf_to_images, is_pdf_file

def setup_roi_for_pdf(pdf_or_image_path: str, output_config: str = "roi_config_60.json"):
    """
    Setup ROI configuration untuk LJK 60 soal dari PDF atau gambar
    
    Args:
        pdf_or_image_path: Path ke PDF atau gambar template
        output_config: Path output file konfigurasi ROI
    
    Returns:
        ROI configuration dict
    """
    print("="*70)
    print("ROI SELECTOR - LJK 60 SOAL (PDF/Image)")
    print("="*70)
    print(f"\nFile: {pdf_or_image_path}")
    
    # Check if PDF - convert to image
    if is_pdf_file(pdf_or_image_path):
        print("\n📄 PDF file detected - converting to image...")
        temp_dir = Path(pdf_or_image_path).parent / "temp_roi_setup"
        images = pdf_to_images(pdf_or_image_path, output_dir=str(temp_dir), dpi=200)
        
        if not images:
            print("❌ Failed to convert PDF")
            return None
        
        image_path = images[0]
        print(f"✓ Using first page: {image_path}")
    else:
        image_path = pdf_or_image_path
    
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        print(f"❌ Cannot read image: {image_path}")
        return None
    
    print(f"Image size: {image.shape[1]} x {image.shape[0]} pixels")
    print("\n" + "="*70)
    print("PILIH AREA JAWABAN (ROI)")
    print("="*70)
    print("Format LJK: 60 soal dengan pilihan A, B, C, D, E")
    print("Biasanya tersusun dalam 2-3 kolom vertikal")
    print("\nSilakan pilih area yang mencakup SEMUA bubble jawaban:")
    print("  1. Klik KIRI-ATAS area jawaban")
    print("  2. Klik KANAN-BAWAH area jawaban")
    print("  3. Tekan ENTER untuk konfirmasi")
    print("  4. Tekan R untuk reset")
    print("="*70 + "\n")
    
    # Use ROISelector
    selector = ROISelector(image)
    roi = selector.select_roi()
    
    if roi is None:
        print("❌ ROI selection cancelled")
        return None
    
    # Save configuration
    with open(output_config, 'w') as f:
        json.dump(roi, f, indent=4)
    
    print(f"\n✅ ROI configuration saved: {output_config}")
    print(f"   Coordinates: ({roi['x1']}, {roi['y1']}) - ({roi['x2']}, {roi['y2']})")
    print(f"   Size: {roi['width']} x {roi['height']} pixels")
    
    return roi


def main():
    """
    Main function untuk setup ROI dari PDF
    """
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python setup_roi_pdf.py <pdf_or_image_path> [output_config.json]")
        print("\nExample:")
        print("  python setup_roi_pdf.py ljk_smp1darangdan.pdf")
        print("  python setup_roi_pdf.py ljk_smp1darangdan.pdf roi_custom.json")
        return
    
    pdf_path = sys.argv[1]
    output_config = sys.argv[2] if len(sys.argv) > 2 else "roi_config_60.json"
    
    roi = setup_roi_for_pdf(pdf_path, output_config)
    
    if roi:
        print("\n✅ Setup ROI selesai!")
        print("\n💡 Langkah selanjutnya:")
        print(f"   1. Gunakan '{output_config}' untuk memproses LJK lainnya")
        print("   2. Upload PDF siswa ke API dengan exam yang sesuai")
        print("   3. Sistem akan otomatis extract & grade semua jawaban")
    else:
        print("\n❌ Setup ROI gagal")


if __name__ == "__main__":
    main()
