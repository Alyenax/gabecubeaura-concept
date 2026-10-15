"""Export the current GabeCubeAura weather renderer for the offline concept site."""

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PLUGIN = Path(os.environ["GCA_PLUGIN_SOURCE"]) if os.environ.get("GCA_PLUGIN_SOURCE") else next((ROOT.parent / name for name in ("GabeCubeAura", "SignalBar-v070-fixes", "SignalBar")
               if (ROOT.parent / name / "py_modules").is_dir()), ROOT.parent / "GabeCubeAura")
sys.path.insert(0, str(PLUGIN / "py_modules"))

from signalbar.providers.weather_sequences import weather_loop_seconds, weather_sequence  # noqa: E402

CONDITIONS = (
    "clear_day", "clear_night", "rain", "cloud", "cloud_night", "breaks", "breaks_night", "snow", "storm"
)
VARIANT_COUNTS = {condition: (4 if condition in ("cloud", "cloud_night") else 2) for condition in CONDITIONS}
FPS = 8


def main():
    frames = {
        condition: [
            [weather_sequence(condition, variant, tick / FPS)
             for tick in range(round(weather_loop_seconds(condition, variant) * FPS))]
            for variant in range(VARIANT_COUNTS[condition])
        ]
        for condition in CONDITIONS
    }
    payload = {"fps": FPS, "frames": frames}
    serialized = json.dumps(payload, separators=(",", ":"))
    target = ROOT / "weather-frames.json"
    script = ROOT / "weather-frames.js"
    target.write_text(serialized, encoding="utf-8")
    script.write_text(f"globalThis.GABECUBEAURA_WEATHER_FRAMES={serialized};\n", encoding="utf-8")
    print(f"{target} + {script}")


if __name__ == "__main__":
    main()
