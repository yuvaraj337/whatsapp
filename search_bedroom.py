import json
import urllib.request
import urllib.parse

headers = {'User-Agent': 'IndianApartmentDesign/2.0 (contact: support@vrrealestate.in)'}

params = {
    'action': 'query',
    'generator': 'search',
    'gsrsearch': 'bedroom interior double bed',
    'gsrnamespace': 6,
    'gsrlimit': 8,
    'prop': 'imageinfo',
    'iiprop': 'url|size|mime',
    'format': 'json'
}
url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        pages = data.get('query', {}).get('pages', {})
        for pid, p in pages.items():
            title = p.get('title', '')
            info = p.get('imageinfo', [{}])[0]
            img_url = info.get('url', '')
            w = info.get('width', 0)
            h = info.get('height', 0)
            mime = info.get('mime', '')
            if mime in ('image/jpeg', 'image/png', 'image/jpg') and w >= 1200 and h >= 800:
                print(f"Bed found: {w}x{h} | {title}")
                print(f"  {img_url}")
except Exception as e:
    print(f'Error: {e}')
