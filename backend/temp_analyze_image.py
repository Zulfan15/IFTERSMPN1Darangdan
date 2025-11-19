"""
Run bubble detection on a single image and print summary.
Saves debug images in backend/debug_output (already done by core function).
"""
import os
from core.ljk_manual_roi import load_roi_config, find_answer_bubbles_manual_roi

TEST_IMAGE = r"temp_test_pdf\ljk_smp1darangdan_page_1.jpg"
ROI_CONFIG = r"data/images/templates/roi_config.json"

if __name__ == "__main__":
    print("Running bubble analysis for:", TEST_IMAGE)
    if not os.path.exists(TEST_IMAGE):
        print("ERROR: test image not found:", TEST_IMAGE)
        print("CWD:", os.getcwd())
        raise SystemExit(1)

    roi = load_roi_config(ROI_CONFIG)
    if roi is None:
        print("ERROR: ROI config not found:", ROI_CONFIG)
        raise SystemExit(1)

    result = find_answer_bubbles_manual_roi(TEST_IMAGE, roi)
    if result is None:
        print("No result returned from detector")
        raise SystemExit(1)

    bubbles, image, thresh, roi_used = result
    print(f"Detected bubbles count: {len(bubbles)}")

    if bubbles:
        widths = [b['w'] for b in bubbles]
        heights = [b['h'] for b in bubbles]
        areas = [b['area'] for b in bubbles]
        print(f"Bubble width range: {min(widths)} - {max(widths)}")
        print(f"Bubble height range: {min(heights)} - {max(heights)}")
        print(f"Bubble area range: {min(areas)} - {max(areas)}")

    # List debug files
    dbg_dir = os.path.join(os.getcwd(), 'debug_output')
    if os.path.exists(dbg_dir):
        files = os.listdir(dbg_dir)
        print(f"\nDebug output files ({len(files)}):")
        for f in files:
            print(" -", os.path.join(dbg_dir, f))
    else:
        print("No debug_output folder found.")

    print("\nDone.")
