# PDF Processing Utilities
# Convert PDF pages to images for LJK processing

import fitz  # PyMuPDF
from pathlib import Path
from typing import List
import cv2
import numpy as np


def pdf_to_images(pdf_path: str, output_dir: str = None, dpi: int = 200) -> List[str]:
    """
    Convert PDF pages to images
    
    Args:
        pdf_path: Path to PDF file
        output_dir: Directory to save images (optional)
        dpi: Resolution for conversion (default 200 for good quality)
    
    Returns:
        List of image file paths or numpy arrays
    """
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    # Open PDF
    doc = fitz.open(str(pdf_path))
    image_paths = []
    
    # Convert each page
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        
        # Get pixmap with specified DPI
        # zoom = dpi / 72 (72 is default DPI)
        zoom = dpi / 72
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        
        if output_dir:
            # Save to file
            output_path = Path(output_dir) / f"{pdf_path.stem}_page_{page_num + 1}.jpg"
            output_path.parent.mkdir(parents=True, exist_ok=True)
            pix.save(str(output_path))
            image_paths.append(str(output_path))
        else:
            # Convert to numpy array (for in-memory processing)
            img_data = pix.tobytes("jpg")
            nparr = np.frombuffer(img_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Save temporarily for processing
            temp_path = Path(output_dir or ".") / f"temp_{pdf_path.stem}_page_{page_num + 1}.jpg"
            temp_path.parent.mkdir(parents=True, exist_ok=True)
            cv2.imwrite(str(temp_path), img)
            image_paths.append(str(temp_path))
    
    doc.close()
    
    print(f"✓ Converted PDF to {len(image_paths)} images")
    return image_paths


def get_pdf_page_count(pdf_path: str) -> int:
    """Get number of pages in PDF"""
    doc = fitz.open(pdf_path)
    count = len(doc)
    doc.close()
    return count


def is_pdf_file(file_path: str) -> bool:
    """Check if file is PDF"""
    return Path(file_path).suffix.lower() == '.pdf'


def extract_first_page(pdf_path: str, output_path: str = None, dpi: int = 200) -> str:
    """
    Extract first page of PDF as image
    Useful for ROI selection on template
    """
    images = pdf_to_images(pdf_path, output_dir=str(Path(output_path).parent) if output_path else None, dpi=dpi)
    
    if images:
        if output_path and images[0] != output_path:
            # Rename to desired path
            Path(images[0]).rename(output_path)
            return output_path
        return images[0]
    
    return None
