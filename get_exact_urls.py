import urllib.request
import urllib.parse
import json
import time

headers = {'User-Agent': 'IndianApartmentsDesign/3.0 (info@example.org)'}

titles = [
    'File:Modern living room with stylish furniture and a view of the outdoors in a cozy apartment setting.jpg',
    'File:Sunrise view from an apartment balcony in Visakhapatnam.jpg',
    'File:Modular Kitchen Design - Picker Online.jpg'
]

params = {
    'action': 'query',
    'titles': '|'.join(titles),
    'prop': 'imageinfo',
    'iiprop': 'url|size',
    'format': 'json'
}
url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        for pid, p in data.get('query', {}).get('pages', {}).items():
            print(p.get('title'))
            info = p.get('imageinfo', [{}])[0]
            print('  URL:', info.get('url'))
except Exception as e:
    print('Error:', e)
