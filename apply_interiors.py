import os
from PIL import Image

src_dir = 'scratch/interiors'
public_dir = 'public/images/journey'
dist_dir = 'dist/images/journey'

def crop_center_resize(img_path, target_size):
    with Image.open(img_path) as im:
        if im.mode != 'RGB':
            im = im.convert('RGB')
        w, h = im.size
        tw, th = target_size
        target_ratio = tw / th
        current_ratio = w / h
        
        if current_ratio > target_ratio:
            # wider: crop width
            new_w = int(h * target_ratio)
            left = (w - new_w) // 2
            box = (left, 0, left + new_w, h)
        else:
            # taller: crop height
            new_h = int(w / target_ratio)
            top = (h - new_h) // 2
            box = (0, top, w, top + new_h)
            
        cropped = im.crop(box)
        return cropped.resize(target_size, Image.Resampling.LANCZOS)

# Target high-res size for overview hero display (1200x800)
HERO_SIZE = (1200, 800)

mapping = {
    'overview_thumb_1.jpg': os.path.join(src_dir, 'living_room.jpg'),
    'overview_thumb_2.jpg': os.path.join(src_dir, 'bedroom.jpg'),
    'overview_thumb_3.jpg': os.path.join(src_dir, 'kitchen.jpg'),
    'overview_thumb_4.jpg': os.path.join(src_dir, 'balcony.jpg'),
    # Also sync room studio images
    'room_living.jpg': os.path.join(src_dir, 'living_room.jpg'),
    'room_thumb_1.jpg': os.path.join(src_dir, 'kitchen.jpg'),
    'room_thumb_2.jpg': os.path.join(src_dir, 'bedroom.jpg'),
    'room_thumb_3.jpg': os.path.join(src_dir, 'bedroom.jpg'),
    'room_thumb_5.jpg': os.path.join(src_dir, 'balcony.jpg')
}

for out_name, src_file in mapping.items():
    if os.path.exists(src_file):
        processed = crop_center_resize(src_file, HERO_SIZE)
        p_path = os.path.join(public_dir, out_name)
        processed.save(p_path, 'JPEG', quality=92)
        print(f'Saved {p_path}')
        if os.path.exists(dist_dir):
            d_path = os.path.join(dist_dir, out_name)
            processed.save(d_path, 'JPEG', quality=92)
            print(f'Saved {d_path}')
    else:
        print(f'Source not found: {src_file}')

print('All interior images applied successfully!')
