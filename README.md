# LRCGET-CLI

A lightweight Node.js utility to automatically fetch and save synchronized lyrics (.lrc) for your local music library from LRCLIB.

## Features

- **Recursive Scanning:** Automatically crawls through nested folders to find your music.
- **Broad Format Support:** Compatible with over 25 audio extensions (MP3, FLAC, WAV, M4A, OGG, OPUS, etc.).
- **Smart Metadata:** Uses music-metadata to extract track titles and artist names directly from file tags.
- **Synced Preference:** Prioritizes synchronized lyrics (time-stamped) for a better listening experience, falling back to plain text if necessary.
- **Efficiency:** Skips files that already have an .lrc companion or are identified as instrumentals.
- **Visual Feedback:** Provides a color-coded status report in the terminal.

## Requirements
- **Node.js**
- Accurate Artist and Title tags in the music files. The script relies on these tags to query the database.

## Dependencies
- **lrclib-api:** The API client for fetching lyrics from LRCLIB.
- **music-metadata:** A music metadata parser for Node.js.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ryubic/LRCGET-CLI
   cd LRCGET-CLI
   ```
2. **Install required npm packages**
   ```bash
   npm install
   ```

## Usage

Run the script using Node.js. By default, it scans the current working directory.

   ```bash
   node LRCGET-CLI.js
   ```

### Target a Specific Directory
   ```bash
   node LRCGET-CLI.js -d "/path/to/your/music"
   ```

## Status Legend

During the process, the script uses the following indicators:

- 🟩 Synced: .lrc file created with time-stamps.
- ⬛ Plain: .lrc file created with plain text only.
- 🟨 Exists: Skipped; .lrc file already present.
- 🟦 Instrumental: Skipped; track marked as instrumental in database.
- 🟥 Not Found: No matching lyrics found on LRCLIB.

