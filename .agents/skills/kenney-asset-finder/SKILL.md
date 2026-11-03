---
name: kenney-asset-finder
description: Find, download, and prepare Kenney asset packs for a Phaser game; use when choosing or adding game art, UI, icons, audio, or 3D assets.
---

# Kenney Asset Finder

Use Kenney's [Game Assets All-in-1 preview](https://kenney.nl/data/itch/preview/) to find packs that fit the user's game or prototype.

## Find suitable packs

- Search the current catalog for the user's subject, style, viewpoint, and asset type. Use the page's All, 2D, 3D, UI, Icons, Audio, and Other categories when they help narrow the results.
- Inspect the candidate pack's preview image when available. Treat pack names as clues, not proof of exact contents. The catalog can change, and the page notes that some packages may not appear there; do not rely on a fixed remembered list.
- Prefer a small set of strong matches. Explain what each pack appears to provide and why it fits the request. Follow the user's requested format; otherwise use a table with English pack name, a Traditional Chinese reference translation, category, and a concise description. Include preview links when useful.
- Be clear when a match is based only on a title or preview. Do not invent sprite counts, file formats, variants, license terms, prices, or download availability.

## Download and prepare assets for Phaser

The preview page is a catalog of preview images, not necessarily the download location for the full pack. For an actual download, find the corresponding official Kenney pack page and verify its download and license details there. Do not claim a preview image is the source asset. Download or add assets to the project only when the user asks for that work.

When the user asks to add a pack to this project:

1. Inspect the archive's file types and top-level layout before extracting. Keep the pack's files together under `public/assets/kenney/<pack-slug>/` and preserve its original subfolders and `License.txt`. Avoid mixing different packs or renaming files without a concrete need.
2. Report the resulting project-relative paths and the formats included. For Phaser loader URLs, use the project's public asset path (usually `/assets/kenney/<pack-slug>/...`) and confirm the configured server base path if it differs.
3. Before writing Phaser loading or gameplay code, read the relevant installed skill(s) from this project:
   - Always read [Loading Assets](../loading-assets/SKILL.md) for Phaser runtime loading.
   - Read [Sprites and Images](../sprites-and-images/SKILL.md) for images, spritesheets, or atlases; also read [Animations](../animations/SKILL.md) when the pack includes animation data or animated frames.
   - Read [Tilemaps](../tilemaps/SKILL.md) for map data, and [Audio and Sound](../audio-and-sound/SKILL.md) for music or sound effects.
   - Read [Text and BitmapText](../text-and-bitmaptext/SKILL.md) for in-game fonts. If creating a demo scene or changing the game boot flow, also read [Game Setup and Config](../game-setup-and-config/SKILL.md) and [Scenes](../scenes/SKILL.md).
4. If the request is download-only, stop after organizing and inspecting the pack; do not change gameplay code. If the user asks to test or integrate it, use the relevant Phaser skill(s) and wire only the assets needed for that task.

For 3D packs, inspect the actual files and do not imply that Phaser can render arbitrary 3D model formats directly. Keep licensing claims tied to the pack's official page or included license file.
