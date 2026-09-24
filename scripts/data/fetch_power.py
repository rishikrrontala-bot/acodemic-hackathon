"""Fetch NASA POWER monthly climatology for every town in data/towns.json.

NASA POWER (Prediction Of Worldwide Energy Resources), NASA Langley Research
Center, https://power.larc.nasa.gov/ . The climatology endpoint returns long-term
monthly means (MERRA-2 meteorology) for a point. Community "AG" (agroclimatology).

Incremental: towns already present in data/raw/power/ are skipped, so the job
can be re-run safely. Stdlib only.

Run:  python3 scripts/data/fetch_power.py
"""
import json, pathlib, time, urllib.request, urllib.error, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
RAW = ROOT / 'data' / 'raw' / 'power'
PARAMS = ['T2M', 'T2M_MAX', 'T2M_MIN', 'T2MDEW', 'T2MWET', 'RH2M', 'QV2M',
          'PRECTOTCORR', 'WS2M', 'PS', 'ALLSKY_SFC_SW_DWN']
URL = ('https://power.larc.nasa.gov/api/temporal/climatology/point'
       '?parameters={p}&community=AG&longitude={lon}&latitude={lat}&format=JSON')

def fetch(url, tries=5):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=90) as r:
                return json.load(r)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            wait = 2 ** (i + 1)
            print(f'  retry {i+1}/{tries} in {wait}s: {e}', flush=True)
            time.sleep(wait)
    raise RuntimeError(f'failed: {url}')

def main():
    RAW.mkdir(parents=True, exist_ok=True)
    towns = json.loads((ROOT / 'data' / 'towns.json').read_text())
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else len(towns)
    done = 0
    for t in towns[:limit]:
        out = RAW / f"{t['id']}.json"
        if out.exists():
            continue
        url = URL.format(p=','.join(PARAMS), lon=t['lon'], lat=t['lat'])
        data = fetch(url)
        out.write_text(json.dumps(data, separators=(',', ':')))
        done += 1
        print(f"{done:4d} {t['cc']} {t['name']}", flush=True)
        time.sleep(0.4)
    print(f'fetched {done} new; {len(list(RAW.glob("*.json")))} on disk')

if __name__ == '__main__':
    main()
