import urllib.request
import json
import urllib.parse
import time

headers = {'User-Agent': 'IndianApartmentDesign/2.0 (contact: support@vrrealestate.in)'}

queries = [
    'apartment interior living room',
    'modern apartment living room',
    'modern apartment bedroom interior',
    'modular kitchen interior',
    'apartment balcony view'
]

results = {}
for q in queries:
    params = {
        'action': 'query',
        'generator': 'search',
        'gsrsearch': q,
        'gsrnamespace': 6,
        'gsrlimit': 8,
        'prop': 'imageinfo',
        'iiprop': 'url|size|mime',
        'format': 'json'
    }
    url = 'https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=headers)
    try:
        time.sleep(2)
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
                    results[title] = {'title': title, 'url': img_url, 'w': w, 'h': h, 'query': q}
    except Exception as e:
        print(f'Query error for "{q}": {e}')

with open('scratch/interior_results.json', 'w', encoding='utf-8') as f:
    json.dump(list(results.values()), f, indent=2)

print(f'Total candidates found: {len(results)}')
for r in list(results.values())[:15]:
    print(f"{r['w']}x{r['h']} | {r['title']}")
