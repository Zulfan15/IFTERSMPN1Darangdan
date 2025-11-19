# Program Penilaian LJK 180 Soal - Interactive ROI Selection
# User dapat memilih area JAWABAN secara manual untuk akurasi maksimal

import cv2
import numpy as np
import imutils
from imutils import contours as imutils_contours
import os
import json
try:
    from answer_key_auto import ANSWER_KEY
except ImportError:
    from answer_key import ANSWER_KEY


class ROISelector:
    """
    Class untuk memilih ROI (Region of Interest) secara interaktif
    """
    def __init__(self, image):
        self.image = image.copy()
        self.original = image.copy()
        self.roi_points = []
        self.selecting = False
        self.window_name = "Pilih Area JAWABAN - Klik 2 titik (kiri-atas, kanan-bawah)"
    
    def select_roi(self):
        """
        Memilih ROI dengan mouse
        """
        cv2.namedWindow(self.window_name)
        cv2.setMouseCallback(self.window_name, self.mouse_callback)
        
        # Resize untuk tampilan jika gambar terlalu besar
        display_image = self.resize_for_display(self.image)
        scale = display_image.shape[0] / self.image.shape[0]
        
        print("\n" + "="*70)
        print("INSTRUKSI:")
        print("="*70)
        print("1. Klik di KIRI-ATAS area JAWABAN (pojok kiri atas)")
        print("2. Klik di KANAN-BAWAH area JAWABAN (pojok kanan bawah)")
        print("3. Tekan 'r' untuk reset jika salah")
        print("4. Tekan 'ENTER' jika sudah benar")
        print("5. Tekan 'ESC' untuk keluar")
        print("="*70 + "\n")
        
        while True:
            display = display_image.copy()
            
            # Gambar titik yang sudah dipilih
            for point in self.roi_points:
                scaled_point = (int(point[0] * scale), int(point[1] * scale))
                cv2.circle(display, scaled_point, 5, (0, 255, 0), -1)
            
            # Gambar rectangle jika sudah ada 2 titik
            if len(self.roi_points) == 2:
                pt1 = (int(self.roi_points[0][0] * scale), 
                       int(self.roi_points[0][1] * scale))
                pt2 = (int(self.roi_points[1][0] * scale), 
                       int(self.roi_points[1][1] * scale))
                cv2.rectangle(display, pt1, pt2, (0, 255, 0), 2)
                
                # Tampilkan teks konfirmasi
                cv2.putText(display, "Tekan ENTER untuk konfirmasi, R untuk reset",
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            cv2.imshow(self.window_name, display)
            key = cv2.waitKey(1) & 0xFF
            
            # Enter - konfirmasi
            if key == 13 and len(self.roi_points) == 2:
                cv2.destroyAllWindows()
                return self.get_roi_coordinates()
            
            # R - reset
            elif key == ord('r') or key == ord('R'):
                self.roi_points = []
                print("Reset! Pilih ulang area JAWABAN.")
            
            # ESC - keluar
            elif key == 27:
                cv2.destroyAllWindows()
                return None
    
    def mouse_callback(self, event, x, y, flags, param):
        """
        Callback untuk mouse click
        """
        if event == cv2.EVENT_LBUTTONDOWN and len(self.roi_points) < 2:
            # Scale koordinat kembali ke ukuran asli
            display_image = self.resize_for_display(self.image)
            scale = self.image.shape[0] / display_image.shape[0]
            
            actual_x = int(x * scale)
            actual_y = int(y * scale)
            
            self.roi_points.append((actual_x, actual_y))
            print(f"Titik {len(self.roi_points)}: ({actual_x}, {actual_y})")
            
            if len(self.roi_points) == 2:
                print("\n✓ Area sudah dipilih. Tekan ENTER untuk konfirmasi, R untuk reset.\n")
    
    def resize_for_display(self, image, max_height=800):
        """
        Resize gambar untuk tampilan jika terlalu besar
        """
        height, width = image.shape[:2]
        if height > max_height:
            ratio = max_height / height
            new_width = int(width * ratio)
            return cv2.resize(image, (new_width, max_height))
        return image
    
    def get_roi_coordinates(self):
        """
        Mendapatkan koordinat ROI yang sudah dipilih
        """
        if len(self.roi_points) == 2:
            x1 = min(self.roi_points[0][0], self.roi_points[1][0])
            y1 = min(self.roi_points[0][1], self.roi_points[1][1])
            x2 = max(self.roi_points[0][0], self.roi_points[1][0])
            y2 = max(self.roi_points[0][1], self.roi_points[1][1])
            
            return {
                'x1': x1,
                'y1': y1,
                'x2': x2,
                'y2': y2,
                'width': x2 - x1,
                'height': y2 - y1
            }
        return None


def save_roi_config(roi, filename="roii_config.json"):
    """
    Menyimpan konfigurasi ROI ke file
    """
    with open(filename, 'w') as f:
        json.dump(roi, f, indent=4)
    print(f"✓ Konfigurasi ROI disimpan ke: {filename}")


def load_roi_config(filename="roii_config.json"):
    """
    Memuat konfigurasi ROI dari file
    """
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return None


def find_answer_bubbles_manual_roi(image_path, roi):
    """
    Mencari bubble jawaban di area ROI yang dipilih manual
    """
    # Load image
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Tidak bisa membaca {image_path}")
        return None
    
    height, width = image.shape[:2]
    print(f"Ukuran gambar: {width} x {height}")
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Crop ke ROI yang dipilih
    x1, y1, x2, y2 = roi['x1'], roi['y1'], roi['x2'], roi['y2']
    answer_region = gray[y1:y2, x1:x2]
    image_region = image[y1:y2, x1:x2]
    
    print(f"Area jawaban (ROI): {answer_region.shape} - {roi['width']}x{roi['height']} pixels")
    
    # Apply preprocessing
    blurred = cv2.GaussianBlur(answer_region, (5, 5), 0)
    
    # Gunakan adaptive threshold
    thresh = cv2.adaptiveThreshold(blurred, 255,
                                    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                    cv2.THRESH_BINARY_INV, 11, 2)
    
    # Morphological operations - DIMATIKAN untuk menghindari kehilangan bubble kecil
    # kernel = np.ones((2, 2), np.uint8)
    # thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    # thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
    
    # Save debug images
    output_dir = "debug_output"
    os.makedirs(output_dir, exist_ok=True)
    
    # Gambar ROI pada original image
    debug_roi = image.copy()
    cv2.rectangle(debug_roi, (x1, y1), (x2, y2), (0, 255, 0), 3)
    cv2.putText(debug_roi, "ROI - Area JAWABAN", (x1, y1-10),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    cv2.imwrite(os.path.join(output_dir, "1_roi_selected.jpg"), debug_roi)
    cv2.imwrite(os.path.join(output_dir, "2_answer_region.jpg"), answer_region)
    cv2.imwrite(os.path.join(output_dir, "3_threshold.jpg"), thresh)
    
    # Find contours
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL,
                            cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    
    print(f"Total contours ditemukan: {len(cnts)}")
    
    # Filter bubble
    bubbles = []
    
    for c in cnts:
        (x, y, w, h) = cv2.boundingRect(c)
        ar = w / float(h)
        area = cv2.contourArea(c)
        
        # Filter berdasarkan ukuran dan aspect ratio
        # Updated to support larger bubbles (35-50 pixels for high-res scans)
        if (35 <= w <= 50 and 35 <= h <= 50 and 
            0.70 <= ar <= 1.30 and area >= 1000):
            # Adjust koordinat ke gambar asli
            bubbles.append({
                'contour': c,
                'x': x + x1,
                'y': y + y1,
                'x_local': x,  # koordinat lokal dalam ROI
                'y_local': y,
                'w': w,
                'h': h,
                'area': area,
                'ar': ar
            })
    
    print(f"Bubble terdeteksi setelah filter: {len(bubbles)}")
    
    if len(bubbles) > 0:
        widths = [b['w'] for b in bubbles]
        heights = [b['h'] for b in bubbles]
        print(f"Ukuran bubble - Lebar: {min(widths)}-{max(widths)}, Tinggi: {min(heights)}-{max(heights)}")
    
    # Visualisasi bubble
    debug_image = image.copy()
    for b in bubbles:
        cv2.rectangle(debug_image, (b['x'], b['y']), 
                     (b['x']+b['w'], b['y']+b['h']), (0, 255, 0), 2)
    
    cv2.imwrite(os.path.join(output_dir, "4_bubbles_detected.jpg"), debug_image)
    print(f"✓ Debug images disimpan di: {output_dir}/")
    
    return bubbles, image, thresh, roi


def organize_bubbles_into_columns(bubbles):
    """
    Mengorganisir bubble menjadi kolom (vertikal)
    Layout LJK: 6 kolom x 30 baris
    - Kolom 1: Soal 1-30 (atas ke bawah)
    - Kolom 2: Soal 31-60 (atas ke bawah)
    - Kolom 3: Soal 61-90 (atas ke bawah)
    - dst sampai kolom 6
    
    Strategi Sederhana: K-Means clustering pada posisi X untuk identifikasi kolom
    """
    if not bubbles:
        return []
    
    # Ambil posisi X semua bubble
    x_positions = [b['x'] for b in bubbles]
    
    # Sort unique X positions dan group dengan histogram
    x_sorted = sorted(set(x_positions))
    
    # Deteksi 6 kolom berdasarkan clustering posisi X
    # Setiap kolom punya 5 posisi X yang berdekatan (untuk A, B, C, D, E)
    
    # Buat histogram untuk menemukan pusat kolom
    from collections import Counter
    x_counter = Counter(x_positions)
    
    # Group posisi X yang berdekatan (dalam 1 kolom)
    col_centers = []
    temp_group = []
    threshold = 100  # Jarak maksimal dalam 1 kolom (pixel)
    
    for x in x_sorted:
        if not temp_group or x - temp_group[-1] < threshold:
            temp_group.append(x)
        else:
            # Hitung pusat kolom
            if temp_group:
                center = sum(temp_group) / len(temp_group)
                col_centers.append(center)
            temp_group = [x]
    
    if temp_group:
        center = sum(temp_group) / len(temp_group)
        col_centers.append(center)
    
    print(f"Pusat kolom terdeteksi: {len(col_centers)} kolom")
    print(f"Posisi X pusat: {[int(c) for c in col_centers]}")
    
    # Assign bubble ke kolom terdekat
    column_bubbles = [[] for _ in range(len(col_centers))]
    
    for bubble in bubbles:
        # Cari kolom terdekat
        distances = [abs(bubble['x'] - center) for center in col_centers]
        col_idx = distances.index(min(distances))
        
        if col_idx < len(column_bubbles):
            column_bubbles[col_idx].append(bubble)
    
    # Untuk setiap kolom, sort berdasarkan Y (atas ke bawah)
    # dan group per baris (5 bubble = 1 soal)
    column_rows = []
    
    for col_idx, col_bubbles in enumerate(column_bubbles):
        # Sort berdasarkan Y
        col_bubbles.sort(key=lambda b: (b['y'], b['x']))
        
        # Group per baris
        rows = []
        skipped_rows = 0  # Counter untuk baris yang diskip
        current_row = [col_bubbles[0]] if col_bubbles else []
        y_tolerance = 15
        
        for i in range(1, len(col_bubbles)):
            bubble = col_bubbles[i]
            if abs(bubble['y'] - current_row[0]['y']) < y_tolerance:
                current_row.append(bubble)
            else:
                # Sort dalam baris dari kiri ke kanan
                current_row.sort(key=lambda b: b['x'])
                # Accept rows with 4-5 bubbles (some may be missing due to detection issues)
                if len(current_row) >= 4:
                    rows.append(current_row)
                else:
                    skipped_rows += 1
                current_row = [bubble]
        
        # Jangan lupa baris terakhir
        if current_row:
            current_row.sort(key=lambda b: b['x'])
            if len(current_row) >= 4:
                rows.append(current_row)
            else:
                skipped_rows += 1
        
        column_rows.append(rows)
        
        # Print info
        if rows:
            bubble_counts = [len(r) for r in rows[:5]]  # 5 baris pertama
            print(f"  Kolom {col_idx+1}: {len(rows)} soal, bubble/soal: {bubble_counts}... (skip: {skipped_rows})")
        else:
            print(f"  Kolom {col_idx+1}: 0 soal (skip: {skipped_rows})")
    
    return column_rows


def process_ljk_180_manual(image_path, roi, answer_key=None):
    """
    Memproses LJK dengan ROI manual
    """
    if answer_key is None:
        answer_key = ANSWER_KEY
    
    # Deteksi bubble
    result = find_answer_bubbles_manual_roi(image_path, roi)
    if result is None:
        return None
    
    bubbles, image, thresh, roi_info = result
    
    if len(bubbles) == 0:
        print("Error: Tidak ada bubble terdeteksi!")
        return None
    
    # Organisir bubble menjadi kolom (vertikal)
    column_rows = organize_bubbles_into_columns(bubbles)
    
    # Threshold untuk analisis
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Process jawaban
    student_answers = {}
    unanswered = {}  # Track soal yang tidak dijawab
    correct = 0
    question_num = 0
    
    output_image = image.copy()
    
    # Threshold untuk menentukan bubble terisi (intensitas < threshold = terisi)
    # Nilai ini perlu disesuaikan: semakin rendah = semakin ketat
    FILLED_THRESHOLD = 200  # Bubble dianggap terisi jika intensitas < 200
    
    # Process per kolom (dari kiri ke kanan)
    for col_idx, rows in enumerate(column_rows):
        # Process setiap baris dalam kolom (dari atas ke bawah)
        for row_idx, row in enumerate(rows):
            if question_num >= 180:
                break
            
            # row sudah berisi 5 bubble (A-E) yang sudah terurut kiri-kanan
            if len(row) < 5:
                continue
            
            group = row  # Sudah terurut A-E
            
            # Cari bubble terisi (intensitas paling RENDAH = paling HITAM)
            min_intensity = 255
            bubbled_idx = 0
            
            for j, bubble in enumerate(group):
                x, y, w, h = bubble['x'], bubble['y'], bubble['w'], bubble['h']
                
                roi_bubble = gray[y:y+h, x:x+w]
                if roi_bubble.size == 0:
                    continue
                
                # Rata-rata intensitas (0-255). Semakin rendah = semakin hitam = terisi
                intensity = np.mean(roi_bubble)
                
                if intensity < min_intensity:
                    min_intensity = intensity
                    bubbled_idx = j
            
            # Cek apakah bubble benar-benar terisi (tidak kosong)
            if min_intensity < FILLED_THRESHOLD:
                # Bubble terisi - simpan jawaban
                student_answers[question_num] = bubbled_idx
                
                # Cek jawaban
                is_correct = (question_num in answer_key and 
                             answer_key[question_num] == bubbled_idx)
                
                if is_correct:
                    correct += 1
                    color = (0, 255, 0)  # Hijau - Benar
                else:
                    color = (0, 0, 255)  # Merah - Salah
                
                # Gambar hasil
                bubble = group[bubbled_idx]
                cv2.rectangle(output_image,
                             (bubble['x']-2, bubble['y']-2),
                             (bubble['x']+bubble['w']+2, bubble['y']+bubble['h']+2),
                             color, 2)
                
                cv2.putText(output_image, str(question_num+1),
                           (bubble['x']-20, bubble['y']+bubble['h']//2),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
            else:
                # Bubble kosong - tidak dijawab
                unanswered[question_num] = True
                
                # Tandai dengan warna kuning/oranye untuk "tidak dijawab"
                color = (0, 165, 255)  # Oranye - Tidak dijawab
                
                # Gambar tanda X atau lingkaran di area soal
                first_bubble = group[0]
                last_bubble = group[-1]
                center_x = (first_bubble['x'] + last_bubble['x'] + last_bubble['w']) // 2
                center_y = first_bubble['y'] + first_bubble['h'] // 2
                
                cv2.putText(output_image, f"{question_num+1}:?",
                           (first_bubble['x']-25, center_y),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 2)
            
            question_num += 1
    
    print(f"Total soal diproses: {question_num}")
    print(f"Soal dijawab: {len(student_answers)}")
    print(f"Soal tidak dijawab (kosong): {len(unanswered)}")
    
    # Hitung skor
    total_questions = len(answer_key)
    answered_questions = len(student_answers)
    score = (correct / total_questions) * 100 if total_questions > 0 else 0
    
    return {
        'score': score,
        'image': output_image,
        'student_answers': student_answers,
        'unanswered': unanswered,
        'correct': correct,
        'total': total_questions,
        'processed': question_num,
        'answered': answered_questions
    }


def main():
    # Template untuk memilih ROI
    template_path = "images/Ljk_contoh.jpg"
    
    # File test yang akan dinilai
    test_image_path = "images/Ljk_contoh test 3.jpg"
    
    roi_config_file = "roii_config.json"
    
    print("="*70)
    print("PROGRAM PENILAIAN LJK 180 SOAL - MANUAL ROI SELECTION")
    print("="*70)
    print(f"\nTemplate ROI  : {template_path}")
    print(f"File Test     : {test_image_path}\n")
    
    # Cek apakah ada ROI config tersimpan
    saved_roi = load_roi_config(roi_config_file)
    
    if saved_roi:
        print(f"✓ Ditemukan ROI tersimpan: {roi_config_file}")
        print(f"  Koordinat: ({saved_roi['x1']}, {saved_roi['y1']}) - ({saved_roi['x2']}, {saved_roi['y2']})")
        print(f"  Ukuran: {saved_roi['width']} x {saved_roi['height']} pixels")
        
        response = input("\nGunakan ROI tersimpan? (y/n): ").lower()
        
        if response == 'y':
            roi = saved_roi
        else:
            # Pilih ROI baru menggunakan TEMPLATE
            print(f"\n📋 Membuka TEMPLATE untuk memilih ROI: {template_path}")
            template_image = cv2.imread(template_path)
            if template_image is None:
                print(f"Error: Tidak bisa membaca {template_path}")
                return
            
            selector = ROISelector(template_image)
            roi = selector.select_roi()
            
            if roi is None:
                print("Dibatalkan.")
                return
            
            save_roi_config(roi, roi_config_file)
    else:
        # Pilih ROI baru menggunakan TEMPLATE
        print(f"📋 Membuka TEMPLATE untuk memilih ROI: {template_path}")
        print("Silakan pilih area JAWABAN pada gambar template...\n")
        
        template_image = cv2.imread(template_path)
        if template_image is None:
            print(f"Error: Tidak bisa membaca {template_path}")
            return
        
        selector = ROISelector(template_image)
        roi = selector.select_roi()
        
        if roi is None:
            print("Dibatalkan.")
            return
        
        save_roi_config(roi, roi_config_file)
    
    print(f"\n{'='*70}")
    print(f"Memproses file TEST: {test_image_path}")
    print(f"Menggunakan ROI dari template...")
    print(f"{'='*70}\n")
    
    # Process LJK TEST menggunakan ROI yang sudah dipilih
    result = process_ljk_180_manual(test_image_path, roi)
    
    if result is None:
        print("\n❌ Gagal memproses LJK!")
        print("Periksa file debug di 'debug_output/'")
        return
    
    # Save hasil
    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)
    
    output_image = os.path.join(output_dir, "ljk_hasil_manual_roii.jpg")
    cv2.imwrite(output_image, result['image'])
    
    # Save detail
    output_file = "hasil_ljk_180.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("HASIL PENILAIAN LJK 180 SOAL\n")
        f.write("(Manual ROI Selection)\n")
        f.write("="*70 + "\n\n")
        f.write(f"Template            : {template_path}\n")
        f.write(f"File Test           : {test_image_path}\n")
        f.write(f"ROI                 : ({roi['x1']}, {roi['y1']}) - ({roi['x2']}, {roi['y2']})\n")
        f.write(f"Ukuran ROI          : {roi['width']} x {roi['height']} pixels\n")
        f.write(f"Total Soal          : {result['total']}\n")
        f.write(f"Soal Berhasil Dibaca: {result['processed']}\n")
        f.write(f"Soal Dijawab        : {result['answered']}\n")
        f.write(f"Soal Tidak Dijawab  : {len(result['unanswered'])}\n")
        f.write(f"Jawaban Benar       : {result['correct']}\n")
        f.write(f"Jawaban Salah       : {result['answered'] - result['correct']}\n")
        f.write(f"Skor                : {result['score']:.2f}%\n")
        f.write("="*70 + "\n\n")
        
        # Daftar soal tidak dijawab
        if len(result['unanswered']) > 0:
            f.write("SOAL TIDAK DIJAWAB (KOSONG):\n")
            f.write("-"*70 + "\n")
            unanswered_list = sorted(result['unanswered'].keys())
            for i in range(0, len(unanswered_list), 10):
                line = "  "
                for j in range(10):
                    if i+j < len(unanswered_list):
                        line += f"{unanswered_list[i+j]+1:3d}, "
                f.write(line.rstrip(", ") + "\n")
            f.write("\n")
        
        f.write("DETAIL PERBANDINGAN JAWABAN:\n")
        f.write("-"*90 + "\n")
        f.write("No.  Kunci  Jawaban  Status  |  No.  Kunci  Jawaban  Status\n")
        f.write("-"*90 + "\n")
        
        # Gabungkan answered dan unanswered untuk laporan lengkap
        all_questions = {}
        for q_num, ans in result['student_answers'].items():
            all_questions[q_num] = chr(65 + ans)
        for q_num in result['unanswered'].keys():
            all_questions[q_num] = "-"
        
        sorted_questions = sorted(all_questions.items())
        for i in range(0, len(sorted_questions), 2):
            line = ""
            for j in range(2):
                if i+j < len(sorted_questions):
                    q_num, ans_str = sorted_questions[i+j]
                    key = ANSWER_KEY.get(q_num, -1)
                    key_letter = chr(65 + key) if key >= 0 else "?"
                    
                    if ans_str == "-":
                        status = "○"  # Tidak dijawab
                    elif ord(ans_str) - 65 == key:
                        status = "✓"  # Benar
                    else:
                        status = "✗"  # Salah
                    
                    line += f"{q_num+1:3d}.   {key_letter}      {ans_str}       {status:^6s}  |  "
            f.write(line.rstrip(" | ") + "\n")
    
    # Print summary
    print("\n" + "="*70)
    print("✅ HASIL PENILAIAN")
    print("="*70)
    print(f"Total Soal          : {result['total']}")
    print(f"Soal Berhasil Dibaca: {result['processed']}")
    print(f"Soal Dijawab        : {result['answered']}")
    print(f"Soal Tidak Dijawab  : {len(result['unanswered'])}")
    print(f"Jawaban Benar       : {result['correct']}")
    print(f"Jawaban Salah       : {result['answered'] - result['correct']}")
    print(f"Skor                : {result['score']:.2f}%")
    
    # Show unanswered questions
    if len(result['unanswered']) > 0:
        print(f"\n⚠️  SOAL TIDAK DIJAWAB (KOSONG): {len(result['unanswered'])} soal")
        unanswered_list = sorted(result['unanswered'].keys())
        unanswered_str = ", ".join([str(q+1) for q in unanswered_list[:20]])
        if len(unanswered_list) > 20:
            unanswered_str += f", ... (+{len(unanswered_list)-20} lainnya)"
        print(f"   Nomor soal: {unanswered_str}")
    
    # Show sample comparison
    print("\n📊 SAMPLE PERBANDINGAN (10 Soal Pertama):")
    print("-" * 50)
    print("No.  Kunci  Jawaban  Status")
    print("-" * 50)
    for i in range(min(10, result['processed'])):
        if i in result['student_answers']:
            ans = result['student_answers'][i]
            key = ANSWER_KEY.get(i, -1)
            ans_letter = chr(65 + ans)
            key_letter = chr(65 + key) if key >= 0 else "?"
            status = "✓ BENAR" if ans == key else "✗ SALAH"
        else:
            key = ANSWER_KEY.get(i, -1)
            ans_letter = "-"
            key_letter = chr(65 + key) if key >= 0 else "?"
            status = "○ KOSONG"
        print(f"{i+1:3d}.   {key_letter}      {ans_letter}       {status}")
    
    print("="*70)
    print(f"\n📁 Output:")
    print(f"   Gambar hasil : {output_image}")
    print(f"   Detail hasil : {output_file}")
    print(f"   ROI config   : {roi_config_file}")
    print(f"   Debug folder : debug_output/")
    print(f"\n💡 Tips:")
    print(f"   - ROI sudah tersimpan, tidak perlu pilih ulang untuk gambar selanjutnya")
    print(f"   - Hapus '{roi_config_file}' jika ingin pilih ROI baru")
    print()


if __name__ == "__main__":
    main()
