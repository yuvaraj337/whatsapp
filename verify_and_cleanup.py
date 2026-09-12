import os
from PIL import Image

files = [
    'apt_elite_towers.jpg',
    'apt_urban_heights.jpg',
    'apt_lake_view.jpg',
    'overview_thumb_1.jpg',
    'overview_thumb_2.jpg',
    'overview_thumb_3.jpg',
    'overview_thumb_4.jpg',
    'room_living.jpg',
    'room_thumb_1.jpg',
    'room_thumb_2.jpg',
    'room_thumb_3.jpg',
    'room_thumb_5.jpg'
]

print("=== VERIFYING REPLACED IMAGES ===")
for d in ['public/images/journey', 'dist/images/journey']:
    print(f"\nDirectory: {d}")
    for f in files:
        fp = os.path.join(d, f)
        if os.path.exists(fp):
            with Image.open(fp) as im:
                print(f"  [OK] {f}: {im.size}, {os.path.getsize(fp):,} bytes")
        else:
            print(f"  [MISSING] {f}")

# Cleanup temporary scratch files
to_remove = [
    'download_interiors_all.py',
    'get_exact_urls.py',
    'download_exact.py',
    'apply_interiors.py',
    'search_rooms.py',
    'search_bedroom.py'
]
for f in to_remove:
    if os.path.exists(f):
        os.remove(f)
        print(f"Cleaned: {f}")

print("\nAll tasks completed successfully!")
