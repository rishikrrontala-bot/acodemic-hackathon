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
# Each set is fetched into its own folder so adding a parameter later doesn't refetch the rest.
# NOTE: in the climatology endpoint T2M_MAX / T2M_MIN are the month's *extremes* (e.g. Mopti,
# March: T2M 29.98, T2M_MAX 43.24), not the mean daily maximum. Zeer uses T2M_RANGE, the mean
# daily temperature range, to get the typical afternoon: T2M + T2M_RANGE / 2.
SETS = [
    ('power', ['T2M', 'T2M_MAX', 'T2M_MIN', 'T2MDEW', 'T2MWET', 'RH2M', 'QV2M',
               'PRECTOTCORR', 'WS2M', 'PS', 'ALLSKY_SFC_SW_DWN']),
    ('power_range', ['T2M_RANGE']),
]
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
    towns = json.loads((ROOT / 'data' / 'towns.json').read_text())
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else len(towns)
    for folder, params in SETS:
        raw = ROOT / 'data' / 'raw' / folder
        raw.mkdir(parents=True, exist_ok=True)
        done = 0
        for t in towns[:limit]:
            out = raw / f"{t['id']}.json"
            if out.exists():
                continue
            url = URL.format(p=','.join(params), lon=t['lon'], lat=t['lat'])
            data = fetch(url)
            out.write_text(json.dumps(data, separators=(',', ':')))
            done += 1
            print(f"{folder} {done:4d} {t['cc']} {t['name']}", flush=True)
            time.sleep(0.3)
        print(f'{folder}: fetched {done} new; {len(list(raw.glob("*.json")))} on disk')

if __name__ == '__main__':
    main()
