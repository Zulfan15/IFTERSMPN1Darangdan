"""
PDF Converter Utility
Converts PDF files to JPG images using PyMuPDF (fitz)
"""
import fitz  # PyMuPDF
import os
from pathlib import Path


def convert_pdf_to_jpg(pdf_path: str, output_dir: str = None, dpi: int = 300) -> str:
    """
    Convert first page of PDF to JPG image
    
    Args:
        pdf_path: Path to PDF file
        output_dir: Directory to save JPG (default: same as PDF)
        dpi: Resolution for conversion (default: 300)
    
    Returns:
        Path to converted JPG file
    
    Raises:
        Exception: If conversion fails
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    # Open PDF
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        raise Exception(f"Failed to open PDF: {str(e)}")
    
    if len(doc) == 0:
        doc.close()
        raise Exception("PDF has no pages")
    
    # Get first page
    page = doc[0]
    
    # Calculate zoom factor for desired DPI
    # fitz default is 72 DPI, so zoom = desired_dpi / 72
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    
    # Render page to image
    pix = page.get_pixmap(matrix=mat)
    
    # Determine output path
    if output_dir is None:
        output_dir = os.path.dirname(pdf_path)
    
    pdf_name = Path(pdf_path).stem
    jpg_path = os.path.join(output_dir, f"{pdf_name}.jpg")
    
    # Save as JPG
    pix.save(jpg_path)
    
    doc.close()
    
    print(f"✅ PDF converted: {pdf_path}")
    print(f"   → JPG: {jpg_path}")
    print(f"   Size: {pix.width} x {pix.height} pixels ({dpi} DPI)")
    
    return jpg_path


def convert_pdf_multipage(pdf_path: str, output_dir: str = None, dpi: int = 300) -> list:
    """
    Convert all pages of PDF to JPG images
    
    Args:
        pdf_path: Path to PDF file
        output_dir: Directory to save JPGs (default: same as PDF)
        dpi: Resolution for conversion (default: 300)
    
    Returns:
        List of paths to converted JPG files
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    
    doc = fitz.open(pdf_path)
    
    if len(doc) == 0:
        doc.close()
        raise Exception("PDF has no pages")
    
    if output_dir is None:
        output_dir = os.path.dirname(pdf_path)
    
    os.makedirs(output_dir, exist_ok=True)
    
    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)
    
    jpg_paths = []
    pdf_name = Path(pdf_path).stem
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(matrix=mat)
        
        if len(doc) == 1:
            jpg_path = os.path.join(output_dir, f"{pdf_name}.jpg")
        else:
            jpg_path = os.path.join(output_dir, f"{pdf_name}_page{page_num+1}.jpg")
        
        pix.save(jpg_path)
        jpg_paths.append(jpg_path)
    
    doc.close()
    
    print(f"✅ PDF converted: {pdf_path}")
    print(f"   Pages: {len(jpg_paths)}")
    print(f"   Output: {output_dir}")
    
    return jpg_paths
