import os
import urllib.request
from PIL import Image

os.makedirs('scratch/interiors', exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

targets = {
    'living_room.jpg': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg',
    'bedroom.jpg': 'https://upload.wikimedia.org/wikipedia/commons/7/73/HI_CC_Standard_Double_Bed_2.jpg',
    'kitchen.jpg': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Modular_Kitchen_Design_-_Picker_Online.jpg',
    'balcony.jpg': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Sunrise_view_from_an_apartment_balcony_in_Visakhapatnam.jpg'
}

for name, url in targets.items():
    dest = os.path.join('scratch/interiors', name)
    if not os.path.exists(dest) or os.path.getsize(dest) < 1000:
        print(f'Downloading {name}...')
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=20) as resp, open(dest, 'wb') as out:
                out.write(resp.read())
            print(f'Done {name}: {os.path.getsize(dest)} bytes')
        except Exception as e:
            print(f'Failed {name}: {e}')

for name in targets:
    fp = os.path.join('scratch/interiors', name)
    if os.path.exists(fp):
        with Image.open(fp) as im:
            print(f'{name}: {im.size}')
