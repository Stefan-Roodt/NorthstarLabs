import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = ROOT / ".tools" / "kokoro-runtime"
if not RUNTIME.exists():
    raise SystemExit("Kokoro is not installed. Install the local runtime before generating narration.")
sys.path.insert(0, str(RUNTIME))

try:
    import numpy as np  # noqa: E402
    import soundfile as sf  # noqa: E402
    from kokoro import KPipeline  # noqa: E402
except Exception as exc:
    print(f"WARNING: Neural narration unavailable ({type(exc).__name__}: {exc}). Falling back to system audio.", file=sys.stderr)
    raise SystemExit(1)

parser = argparse.ArgumentParser(description="Generate NorthstarLabs neural narration locally with Kokoro.")
parser.add_argument("--text", required=True)
parser.add_argument("--output", required=True)
parser.add_argument("--voice", default="bm_george")
parser.add_argument("--speed", type=float, default=0.98)
args = parser.parse_args()

pipeline = KPipeline(lang_code="b")
segments = []
for _, _, audio in pipeline(args.text, voice=args.voice, speed=args.speed, split_pattern=r"\n+"):
    if hasattr(audio, "detach"):
        audio = audio.detach().cpu().numpy()
    segments.append(np.asarray(audio, dtype=np.float32))
if not segments:
    raise SystemExit("Kokoro returned no audio.")

pause = np.zeros(int(24000 * 0.22), dtype=np.float32)
joined = segments[0]
for segment in segments[1:]:
    joined = np.concatenate((joined, pause, segment))

output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
sf.write(output, joined, 24000, subtype="PCM_16")
print(f"Created {output} with {args.voice}.")
