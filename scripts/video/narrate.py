"""Synthesize the demo narration with Kokoro TTS (open weights, runs on CPU).

  pip install kokoro-onnx soundfile
  model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
  python3 scripts/video/narrate.py /path/to/kokoro-v1.0.onnx /path/to/voices-v1.0.bin OUT_DIR

Writes OUT_DIR/<id>.wav for every line in scripts/video/narration.json, plus OUT_DIR/durations.json,
and prints each clip's peak and RMS so silent or clipped audio is caught without listening.
"""
import json, sys, pathlib
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

model, voices, out = sys.argv[1], sys.argv[2], pathlib.Path(sys.argv[3])
out.mkdir(parents=True, exist_ok=True)
lines = json.loads((pathlib.Path(__file__).parent / 'narration.json').read_text())
k = Kokoro(model, voices)
durations = {}
for line in lines:
    samples, sr = k.create(line['text'], voice='af_heart', speed=1.0, lang='en-us')
    samples = np.asarray(samples, dtype=np.float32)
    peak = float(np.max(np.abs(samples)))
    if peak > 0.95:  # leave headroom
        samples = samples * (0.95 / peak)
    rms = float(np.sqrt(np.mean(samples ** 2)))
    sf.write(out / f"{line['id']}.wav", samples, sr)
    durations[line['id']] = round(len(samples) / sr, 3)
    print(f"{line['id']:8s} {durations[line['id']]:6.2f}s  peak {peak:.2f}  rms {rms:.3f}")
(out / 'durations.json').write_text(json.dumps(durations, indent=2))
print('total', round(sum(durations.values()), 1), 's')
