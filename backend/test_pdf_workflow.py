"""
Test PDF upload and processing workflow
"""
import requests
import os
from pathlib import Path

# Test configuration
API_URL = "http://localhost:8000/api"
TEST_PDF = r"temp_test_pdf\ljk_smp1darangdan_test1.pdf"  # Will use JPG if PDF not available
TEST_JPG = r"temp_test_pdf\ljk_smp1darangdan_test1.jpg"
EXAM_ID = "exam_024a7e44"  # UTS IPA 7B

def test_pdf_upload():
    """Test uploading PDF and auto-conversion"""
    print("="*70)
    print("🧪 TEST: PDF Upload & Auto-Conversion")
    print("="*70)
    
    # Use JPG for now (we'll convert to PDF later if needed)
    if os.path.exists(TEST_JPG):
        test_file = TEST_JPG
        print(f"📄 Using test file: {test_file}")
    else:
        print(f"❌ Test file not found: {TEST_JPG}")
        return
    
    # Prepare form data
    with open(test_file, 'rb') as f:
        files = {'file': (Path(test_file).name, f, 'image/jpeg')}
        data = {
            'exam_id': EXAM_ID,
            'student_name': 'Test Student PDF',
            'student_number': 'TEST001'
        }
        
        print(f"\n📤 Uploading to: {API_URL}/process-ljk")
        print(f"   Exam ID: {EXAM_ID}")
        print(f"   Student: Test Student PDF")
        
        try:
            response = requests.post(
                f"{API_URL}/process-ljk",
                files=files,
                data=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"\n✅ SUCCESS!")
                print(f"   Result ID: {result.get('result_id')}")
                print(f"   Score: {result.get('score', {})}")
                print(f"   Marked Image: {result.get('marked_image_url')}")
                print(f"\n📊 Details:")
                print(f"   Correct: {result.get('score', {}).get('correct', 0)}")
                print(f"   Wrong: {result.get('score', {}).get('wrong', 0)}")
                print(f"   Unanswered: {result.get('score', {}).get('unanswered', 0)}")
                print(f"   Percentage: {result.get('score', {}).get('percentage', 0):.1f}%")
            else:
                print(f"\n❌ FAILED!")
                print(f"   Status: {response.status_code}")
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
    
    print("\n" + "="*70)


def test_pdf_conversion():
    """Test standalone PDF to JPG conversion"""
    from pdf_converter import convert_pdf_to_jpg
    
    print("\n" + "="*70)
    print("🧪 TEST: PDF to JPG Conversion")
    print("="*70)
    
    # Check if we have a PDF to test
    pdf_path = "../file pdf/ljk_smp1darangdan.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF not found: {pdf_path}")
        print("   Skipping PDF conversion test")
        return
    
    try:
        print(f"📄 Converting: {pdf_path}")
        jpg_path = convert_pdf_to_jpg(
            pdf_path,
            output_dir="temp_test_pdf",
            dpi=300
        )
        print(f"✅ Converted to: {jpg_path}")
        
        # Check file size
        if os.path.exists(jpg_path):
            size_mb = os.path.getsize(jpg_path) / (1024 * 1024)
            print(f"   File size: {size_mb:.2f} MB")
        
    except Exception as e:
        print(f"❌ Conversion failed: {str(e)}")
    
    print("="*70)


if __name__ == "__main__":
    print("\n🚀 Starting PDF Workflow Tests\n")
    
    # Test 1: PDF conversion
    test_pdf_conversion()
    
    # Test 2: Upload and process
    test_pdf_upload()
    
    print("\n✅ All tests completed!\n")
