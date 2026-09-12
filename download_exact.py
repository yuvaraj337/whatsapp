import os
import urllib.request
import time
from PIL import Image

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

urls = {
    'living_room.jpg': 'https://upload.wikimedia.org/wikipedia/commons/4/49/Modern_living_room_with_stylish_furniture_and_a_view_of_the_outdoors_in_a_cozy_apartment_setting.jpg',
    'kitchen.jpg': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Modular_Kitchen_Design_-_Picker_Online.jpg',
    'balcony.jpg': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Sunrise_view_from_an_apartment_balcony_in_Visakhapatnam.jpg'
}

for name, url in urls.items():
    dest = os.path.join('scratch/interiors', name)
    if not os.path.exists(dest) or os.path.getsize(dest) < 1000:
        print(f'Waiting 3s before {name}...')
        time.sleep(3)
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=25) as resp, open(dest, 'wb') as out:
                out.write(resp.read())
            print(f'Done {name}: {os.path.getsize(dest)} bytes')
        except Exception as e:
            print(f'Error {name}: {e}')

for f in os.listdir('scratch/interiors'):
    fp = os.path.join('scratch/interiors', f)
    try:
        with Image.open(fp) as im:
            print(f'{f}: {im.size}')
    except Exception as e:
        print(f'Error {f}: {e}')
