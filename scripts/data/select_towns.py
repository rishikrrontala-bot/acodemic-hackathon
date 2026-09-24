"""Select the market towns Zeer ships climate data for.

Deterministic: GeoNames cities (population >= 15,000, via the `geonamescache`
PyPI package, CC BY 4.0 GeoNames data) in the hot countries where clay-pot
coolers are used or promoted, capped per country by population, plus a list of
named towns that must be present (field sites and well-known dry-season markets).

Run:  pip install geonamescache==3.0.2 && python3 scripts/data/select_towns.py
Writes data/towns.json
"""
import json, re, unicodedata, pathlib
import geonamescache

# Per-country caps. Hot drylands and the Sahel get more towns; mostly-humid
# countries get a few so the app can honestly show where the pot does NOT work.
CAPS = {
    # Sahel and West Africa
    'ML': 14, 'NE': 10, 'BF': 8, 'NG': 28, 'TD': 8, 'SN': 8, 'MR': 6, 'GH': 8,
    'BJ': 4, 'TG': 3, 'GM': 2, 'GN': 4, 'CI': 5, 'CM': 6, 'CF': 2, 'SL': 2, 'LR': 1,
    # Horn and East Africa
    'SD': 12, 'SS': 4, 'ER': 3, 'ET': 12, 'SO': 6, 'DJ': 1, 'KE': 12, 'UG': 6,
    'TZ': 10, 'RW': 2, 'BI': 2,
    # Southern Africa
    'ZM': 6, 'ZW': 6, 'MW': 4, 'MZ': 6, 'BW': 3, 'NA': 3, 'AO': 6, 'ZA': 8, 'MG': 5,
    # North Africa and Middle East
    'EG': 12, 'LY': 4, 'TN': 4, 'DZ': 8, 'MA': 8, 'JO': 3, 'IQ': 8, 'SY': 5,
    'YE': 6, 'SA': 6, 'OM': 3, 'IR': 10, 'AF': 6, 'PK': 16,
    # South Asia
    'IN': 42, 'NP': 3, 'BD': 5, 'LK': 3,
    # Latin America and the Caribbean
    'MX': 16, 'GT': 3, 'HN': 3, 'SV': 2, 'NI': 2, 'HT': 3, 'PE': 6, 'BO': 4,
    'BR': 14, 'CO': 5, 'VE': 4, 'EC': 3, 'PY': 2, 'AR': 4, 'CL': 2,
    # South-east Asia (mostly humid: the honest counter-examples)
    'ID': 4, 'PH': 4, 'MM': 4, 'KH': 2, 'TH': 3, 'VN': 3,
}

# Towns that must be included by name (country, GeoNames name as spelled in the
# dataset). Mali entries are MIT D-Lab / World Vegetable Center field regions.
MUST = [
    ('ML', 'Mopti'), ('ML', 'Ségou'), ('ML', 'Sikasso'), ('ML', 'Kayes'), ('ML', 'Gao'),
    ('ML', 'Timbuktu'), ('ML', 'Bamako'), ('ML', 'Koutiala'), ('ML', 'San'),
    ('NG', 'Kano'), ('NG', 'Maiduguri'), ('NG', 'Sokoto'), ('NG', 'Katsina'), ('NG', 'Kaduna'),
    ('NG', 'Zaria'), ('NG', 'Bauchi'), ('NG', 'Yola'), ('NG', 'Lagos'),
    ('NE', 'Niamey'), ('NE', 'Zinder'), ('NE', 'Maradi'), ('NE', 'Agadez'), ('NE', 'Tahoua'),
    ('BF', 'Ouagadougou'), ('BF', 'Bobo-Dioulasso'), ('TD', "N'Djamena"), ('TD', 'Abéché'),
    ('SD', 'Kassala'), ('SD', 'Khartoum'), ('SD', 'El Obeid'), ('SD', 'Nyala'),
    ('ET', 'Mek\'ele'), ('ET', 'Dire Dawa'), ('KE', 'Garissa'), ('KE', 'Lodwar'),
    ('KE', 'Nairobi'), ('KE', 'Kisumu'), ('SN', 'Dakar'), ('SN', 'Kaolack'), ('MR', 'Nouakchott'),
    ('IN', 'Jodhpur'), ('IN', 'Bikaner'), ('IN', 'Jaisalmer'), ('IN', 'Ahmedabad'),
    ('IN', 'Nagpur'), ('IN', 'Kolkata'), ('IN', 'Jaipur'), ('IN', 'Barmer'),
    ('PK', 'Hyderabad'), ('PK', 'Multan'), ('PK', 'Bahawalpur'),
    ('EG', 'Aswan'), ('EG', 'Luxor'), ('MX', 'Hermosillo'), ('MX', 'Mexicali'),
    ('BR', 'Petrolina'), ('PE', 'Piura'), ('BD', 'Dhaka'), ('ID', 'Jakarta'),
]

LATIN = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿĀ-žḀ-ỿ'’ .\-()]+$")

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c)).lower()

def main():
    gc = geonamescache.GeonamesCache(min_city_population=15000)
    cities = list(gc.get_cities().values())
    countries = gc.get_countries()
    by_cc = {}
    for c in cities:
        if c['countrycode'] in CAPS:
            by_cc.setdefault(c['countrycode'], []).append(c)
    picked = {}
    for cc, cap in CAPS.items():
        for c in sorted(by_cc.get(cc, []), key=lambda c: -c['population'])[:cap]:
            picked[c['geonameid']] = c
    missing = []
    for cc, name in MUST:
        cand = [c for c in by_cc.get(cc, []) if fold(c['name']) == fold(name)
                or fold(name) in {fold(a) for a in c['alternatenames']}]
        if not cand:
            missing.append(f'{cc}:{name}')
            continue
        c = max(cand, key=lambda c: c['population'])
        picked[c['geonameid']] = c
    out = []
    for c in sorted(picked.values(), key=lambda c: (c['countrycode'], -c['population'])):
        alts = sorted({a for a in c['alternatenames'] if LATIN.match(a) and fold(a) != fold(c['name'])},
                      key=len)[:4]
        out.append({
            'id': c['geonameid'],
            'name': c['name'],
            'alt': alts,
            'cc': c['countrycode'],
            'country': countries[c['countrycode']]['name'],
            'lat': round(c['latitude'], 3),
            'lon': round(c['longitude'], 3),
            'pop': c['population'],
            'tz': c['timezone'],
        })
    path = pathlib.Path(__file__).resolve().parents[2] / 'data' / 'towns.json'
    path.write_text(json.dumps(out, ensure_ascii=False, indent=0) + '\n')
    print(f'{len(out)} towns in {len({t["cc"] for t in out})} countries -> {path}')
    if missing:
        print('not found in GeoNames >=15k:', ', '.join(missing))

if __name__ == '__main__':
    main()
