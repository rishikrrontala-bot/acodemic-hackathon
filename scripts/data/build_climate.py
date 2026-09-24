"""Compact the NASA POWER snapshot into the file the app loads.

Input:  data/towns.json, data/raw/power/<geonameid>.json (from fetch_power.py)
Output: public/data/climate.json  {meta, towns:[{id,n,a,cc,c,lat,lon,p,m:{T,Tx,Tn,Td,RH,Q,P,R}}]}
        each monthly series is 12 numbers (Jan..Dec), rounded to 0.1.
Also prints the climatology period NASA reports, which the app cites.

Run:  python3 scripts/data/build_climate.py
"""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
KEYS = {  # app key: POWER parameter
    'T': 'T2M', 'Td': 'T2MDEW', 'RH': 'RH2M', 'Q': 'QV2M', 'P': 'PS', 'R': 'PRECTOTCORR',
}
# Typical afternoon / night: T2M ± T2M_RANGE/2 (T2M_RANGE is the mean daily range). The
# climatology's T2M_MAX / T2M_MIN are monthly extremes and are deliberately not used.

def main():
    towns = json.loads((ROOT / 'data' / 'towns.json').read_text())
    out, periods, skipped = [], set(), []
    for t in towns:
        f = ROOT / 'data' / 'raw' / 'power' / f"{t['id']}.json"
        if not f.exists():
            skipped.append(t['name'])
            continue
        d = json.loads(f.read_text())
        par = d['properties']['parameter']
        hdr = d.get('header', {})
        periods.add(hdr.get('range', f"{hdr.get('start', '?')}-{hdr.get('end', '?')}"))
        fill = hdr.get('fill_value', -999)
        m = {}
        ok = True
        for k, pk in KEYS.items():
            vals = [par[pk][mm] for mm in MONTHS]
            if any(v is None or v == fill for v in vals):
                ok = False
                break
            m[k] = [round(float(v), 1) for v in vals]
        rf = ROOT / 'data' / 'raw' / 'power_range' / f"{t['id']}.json"
        if ok and rf.exists():
            rng = json.loads(rf.read_text())['properties']['parameter']['T2M_RANGE']
            r = [float(rng[mm]) for mm in MONTHS]
            if any(v == fill for v in r):
                ok = False
            else:
                m['Tx'] = [round(a + b / 2, 1) for a, b in zip(m['T'], r)]
                m['Tn'] = [round(a - b / 2, 1) for a, b in zip(m['T'], r)]
        elif ok:
            skipped.append(t['name'] + ' (no T2M_RANGE yet)')
            continue
        if not ok:
            skipped.append(t['name'] + ' (fill values)')
            continue
        out.append({'id': t['id'], 'n': t['name'], 'a': t['alt'], 'cc': t['cc'], 'c': t['country'],
                    'lat': t['lat'], 'lon': t['lon'], 'p': t['pop'], 'm': m})
    meta = {
        'source': 'NASA POWER climatology API, community AG (https://power.larc.nasa.gov/)',
        'period': sorted(periods),
        'afternoon': 'Tx = T2M + T2M_RANGE/2 (mean daily range); Tn = T2M - T2M_RANGE/2',
        'units': {'T': '°C', 'Tx': '°C', 'Tn': '°C', 'Td': '°C', 'RH': '%', 'Q': 'g/kg', 'P': 'kPa', 'R': 'mm/day'},
        'towns': len(out),
    }
    dest = ROOT / 'public' / 'data' / 'climate.json'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps({'meta': meta, 'towns': out}, ensure_ascii=False, separators=(',', ':')))
    print(f'{len(out)} towns -> {dest} ({dest.stat().st_size // 1024} KB); period {meta["period"]}')
    if skipped:
        print('skipped:', ', '.join(skipped))

if __name__ == '__main__':
    main()
