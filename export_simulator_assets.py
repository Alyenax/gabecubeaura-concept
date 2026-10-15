"""Publish native RGB frames only, not private runtime code or user settings.

Usage: python3 export_simulator_assets.py /absolute/path/to/plugin-checkout
PNG atlases retain every authored pixel and delay, without a runtime GIF decoder.
Only the selected atlas is decoded by the browser. No speech models are bundled.
"""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import sys
import zlib

ROOT = Path(__file__).resolve().parent
PLUGIN = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(PLUGIN / "py_modules"))
from signalbar.faceplate import artwork_dashboard as dashboard
from signalbar.faceplate.scenes import FONT_3X5, Canvas
from signalbar.faceplate.weather_artwork import _backgrounds, load_catalog, WEATHER_ARTWORK_V2_THEME
from signalbar.assistant import face, companion


def png(path, width, height, rgb):
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))
    rows = b''.join(b'\0' + rgb[y * width * 3:(y + 1) * width * 3] for y in range(height))
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b''))


target = ROOT / 'assets' / 'simulator'
target.mkdir(parents=True, exist_ok=True)
source = subprocess.check_output(['git', '-C', str(PLUGIN), 'rev-parse', 'HEAD'], text=True).strip()
catalog = {'source_commit': source, 'width': 64, 'height': 54, 'weather': {}, 'assistant': {},
           'font': FONT_3X5, 'icons': {}, 'notch_icons': {}, 'colors': {}, 'overlay_fixture': {}}


def atlas(key, frames, delays, loop, **extra):
    rgb = b''.join(frames)
    filename = key.replace(':', '-') + '.png'
    png(target / filename, 64, 54 * len(frames), rgb)
    return {'src': 'assets/simulator/' + filename, 'frames': len(frames), 'delays': delays,
            'loop': loop, 'rgb_sha256': hashlib.sha256(rgb).hexdigest(), **extra}


for preset in load_catalog(WEATHER_ARTWORK_V2_THEME)['presets']:
    key = preset['id']
    frames = _backgrounds(WEATHER_ARTWORK_V2_THEME, key)
    catalog['weather'][key] = atlas('weather-' + key, frames, [100] * len(frames), True,
                                   title=preset['label'], scene=preset['source_scene'])

for mount in ('optique', 'rectangular', 'round'):
    for amplitude in face.AMPLITUDES:
        for mode in face.MODES:
            bank, indices = face._bank(mount, mode, amplitude)
            palette = face._palette(bank, face.settings({'mount': mount, 'emotional_amplitude': amplitude}))
            frames = [bytes(c for i in frame for c in palette[i]) for frame in indices]
            key = f'gabe-{mount}-{amplitude}-{mode}'
            catalog['assistant'][key] = atlas(key, frames, [bank['delay_cs'] * 10] * len(frames), True,
                palette=bank['palette'], rendered_palette=palette)
for motion in ('calm', 'lively'):
    for mode in companion.INTERACTIVE_EVENTS:
        bank, indices = companion.interactive_bank(mode, motion)
        palette = [entry['rgb'] for entry in bank['palette']]
        frames = [bytes(c for i in frame for c in palette[i]) for frame in indices]
        key = f'companion-{motion}-{mode}'
        payload, metadata = companion.animation({'companion_motion': motion}, mode)
        catalog['assistant'][key] = atlas(key, frames, [d * 10 for d in bank['delays_cs']], bank['loop'],
                                         gif_bytes=len(payload), rotation_degrees=metadata['rotation_degrees'],
                                         palette=bank['palette'], rendered_palette=palette)

for condition in ('clear_day', 'clear_night', 'rain', 'cloud', 'cloud_night', 'breaks', 'breaks_night', 'snow', 'storm'):
    grid = Canvas()
    dashboard._weather_icon(grid, condition, 0, 0, compact=True, ux_enabled=True)
    catalog['icons'][condition] = [[i % 64, i // 64, color] for i, color in enumerate(grid.pixels) if any(color)]
    grid = Canvas()
    dashboard._weather_icon(grid, condition, 38, 2, ux_enabled=True)
    catalog['notch_icons'][condition] = [[i % 64, i // 64, color] for i, color in enumerate(grid.pixels) if any(color)]
for name in ('WARM_WHITE', 'TEMPERATURE_AMBER', 'MORNING_BLUE', 'AFTERNOON_ORANGE', 'PLAYER_ONE', 'PLAYER_TWO', 'NOTCH_BACKGROUND', 'NOTCH_BORDER', 'RAIL_BACKGROUND', 'RAIL_BORDER', 'SEPARATOR_GREY'):
    catalog['colors'][name] = getattr(dashboard, name)
# Reference overlay is exported as RGB for pixel-level regression checks in JS.
from datetime import datetime
fixture = dashboard.build_artwork_dashboard([bytes(64 * 54 * 3)], datetime(2026, 10, 15, 21, 40), 42,
    weather={'condition': 'rain', 'temperature_c': 12}, bottom_mode='controllers',
    controllers=[{'percent': 87}, {'percent': 64}], show_p2=True, ux_enabled=True)
catalog['overlay_fixture'] = atlas('dashboard-reference', fixture.frames, [1000], True)
(ROOT / 'simulator-assets.js').write_text('globalThis.GCA_SIMULATOR_ASSETS=' + json.dumps(catalog, separators=(',', ':')) + ';\n')
print(f"Exported {len(catalog['weather'])} weather and {len(catalog['assistant'])} assistant banks from {source}; {sum(p.stat().st_size for p in target.glob('*.png')):,} bytes")
